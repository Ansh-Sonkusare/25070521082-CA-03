const express = require("express");
const {MongoClient,ObjectId} = require("mongodb");
const bodyparser = require("body-parser");
const cors = require("cors");
const bCrypt = require("bcrypt");
const jwtToken = require("jsonwebtoken");
const crypto = require("crypto");


const app = express();
app.use(cors());
app.use(bodyparser.json());

// body-parser leaves req.body undefined when no JSON is sent, so use an empty object
app.use((req,res,next)=>{

    if( req.body === undefined ){

        req.body = {};
    }

    next();
});
const uri = process.env.MONGO_URI || "mongodb://localhost:27018";
const client = new MongoClient(uri);
const port = process.env.PORT || 5002;
const SECRET = process.env.JWT_SECRET || "MY_SECRET_TOKEN";

const myDb = client.db("musicDb");
const albums = myDb.collection("albums");
const users = myDb.collection("users");
const activity = myDb.collection("activity");
const playlists = myDb.collection("playlists");
const favorites = myDb.collection("favorites");
const carts = myDb.collection("carts");
const orders = myDb.collection("orders");


async function connectToMongoDb(){

    for( let attempt = 1; attempt <= 10; attempt++ ){

        try {

            await client.connect();
            console.log("Connection successfully done with mongodb");

            // npm run seed : wipe the database and fill it with fresh sample data
            if( process.argv.includes("--seed") ){

                await myDb.dropDatabase();
                await seedData();
                console.log("Database reset with sample data");
                process.exit(0);
            }

            await seedData();

            app.listen(port,()=>{

                console.log("Server started at port : " + port);
            })

            return;

        } catch (error) {

            console.log("Connection failed to mongodb (attempt " + attempt + "/10) : " + error.message);
            await new Promise(resolve => setTimeout(resolve,2000));
        }
    }

    console.log("Could not connect to mongodb. Run 'docker compose up -d' in the project folder first.");
    process.exit(1);
}

// Adds a demo user and some albums the first time the server runs
async function seedData(){

    if( await users.countDocuments() === 0 ){

        const hashedPass = await bCrypt.hash("admin123",10);
        await users.insertOne({name : "Admin", email : "admin@music.com", password : hashedPass});
        console.log("Demo user created : admin@music.com / admin123");
    }

    if( await albums.countDocuments() === 0 ){

        // "Title|m:ss" lines become {title, duration (seconds), preview}. The first two tracks are 30 second previews
        const list = (lines) => lines.map((line,i) =>{

            const [title,time] = line.split("|");
            const [m,sec] = time.split(":").map(Number);
            return {title : title, duration : m * 60 + sec, preview : i < 2};
        });

        const sample = [
            {title : "Abbey Road", artist : "The Beatles", genre : "Rock", releaseYear : 1969, rating : 5, status : "owned",
                prices : {vinyl : 2499, cd : 899, digital : 399}, tracklist : list([
                "Come Together|4:20","Something|3:03","Maxwell's Silver Hammer|3:27","Oh! Darling|3:26","Octopus's Garden|2:51",
                "I Want You (She's So Heavy)|7:47","Here Comes the Sun|3:05","Because|2:45","You Never Give Me Your Money|4:02",
                "Sun King|2:26","Mean Mr. Mustard|1:06","Polythene Pam|1:12","She Came In Through the Bathroom Window|1:57",
                "Golden Slumbers|1:31","Carry That Weight|1:36","The End|2:19","Her Majesty|0:23"])},
            {title : "Thriller", artist : "Michael Jackson", genre : "Pop", releaseYear : 1982, rating : 5, status : "owned",
                prices : {vinyl : 2199, cd : 799, digital : 349}, tracklist : list([
                "Wanna Be Startin' Somethin'|6:03","Baby Be Mine|4:20","The Girl Is Mine|3:42","Thriller|5:57","Beat It|4:18",
                "Billie Jean|4:54","Human Nature|4:06","P.Y.T. (Pretty Young Thing)|3:59","The Lady in My Life|4:57"])},
            {title : "Kind of Blue", artist : "Miles Davis", genre : "Jazz", releaseYear : 1959, rating : 5, status : "owned",
                prices : {vinyl : 2799, cd : 999, digital : 449}, tracklist : list([
                "So What|9:22","Freddie Freeloader|9:49","Blue in Green|5:37","All Blues|11:33","Flamenco Sketches|9:26"])},
            {title : "Random Access Memories", artist : "Daft Punk", genre : "Electronic", releaseYear : 2013, rating : 4, status : "wishlist",
                prices : {vinyl : 3299, cd : 1099, digital : 499}, tracklist : list([
                "Give Life Back to Music|4:34","The Game of Love|5:22","Giorgio by Moroder|9:04","Within|3:48","Instant Crush|5:37",
                "Lose Yourself to Dance|5:53","Touch|8:18","Get Lucky|6:09","Beyond|4:50","Motherboard|5:41","Fragments of Time|4:39",
                "Doin' It Right|4:11","Contact|6:21"])},
            {title : "To Pimp a Butterfly", artist : "Kendrick Lamar", genre : "Hip-Hop", releaseYear : 2015, rating : 5, status : "wishlist",
                prices : {vinyl : 2999, cd : 999, digital : 449}, tracklist : list([
                "Wesley's Theory|4:47","For Free? (Interlude)|2:10","King Kunta|3:54","Institutionalized|4:31","These Walls|5:00",
                "u|4:28","Alright|3:39","For Sale? (Interlude)|4:51","Momma|4:43","Hood Politics|4:52","How Much a Dollar Cost|4:21",
                "Complexion (A Zulu Love)|4:23","The Blacker the Berry|5:28","You Ain't Gotta Lie (Momma Said)|4:01","i|5:36","Mortal Man|12:07"])},
            {title : "Rumours", artist : "Fleetwood Mac", genre : "Rock", releaseYear : 1977, rating : 4, status : "owned",
                prices : {vinyl : 2399, cd : 849, digital : 379}, tracklist : list([
                "Second Hand News|2:43","Dreams|4:14","Never Going Back Again|2:14","Don't Stop|3:11","Go Your Own Way|3:38",
                "Songbird|3:20","The Chain|4:30","You Make Loving Fun|3:31","I Don't Want to Know|3:11","Oh Daddy|3:54","Gold Dust Woman|4:51"])}
        ];

        // tracks (the count shown on cards) always matches the tracklist length
        await albums.insertMany(sample.map(album => ({...album, tracks : album.tracklist.length})));
        console.log("Sample albums added (with tracklists and prices)");
    }
}

connectToMongoDb();


// Checks the "Authorization: Bearer <token>" header
function verifyToken(req,res,next){

    const header = req.headers.authorization || "";
    const token = header.split(" ")[1];

    if( !token ){

        return res.status(401).send({msg : "Login required"});
    }

    try {

        req.user = jwtToken.verify(token,SECRET);

        // Tokens from older logins have no email, and carts/playlists are keyed by it
        if( !req.user.email ){

            return res.status(401).send({msg : "Session expired, please login again"});
        }

        next();

    } catch (error) {

        res.status(401).send({msg : "Invalid or expired token"});
    }
}

// Reads the album fields from the request body, converts numbers and keeps rating between 1 and 5
function readAlbum(body){

    const {title,artist,genre,releaseYear,tracks,rating,status} = body;
    const prices = body.prices && typeof body.prices === "object" ? body.prices : {};

    return {
        title : typeof title === "string" ? title.trim() : "",
        artist : typeof artist === "string" ? artist.trim() : "",
        genre : typeof genre === "string" ? genre : "",
        releaseYear : Number(releaseYear),
        tracks : Number(tracks),
        rating : Math.min(5,Math.max(1,Math.round(Number(rating)) || 1)),
        status : status === "wishlist" ? "wishlist" : "owned",
        prices : {vinyl : readPrice(prices.vinyl), cd : readPrice(prices.cd), digital : readPrice(prices.digital)}
    };
}

// Whole rupees between 0 and 1,000,000. 0 means "not sold in this format"
function readPrice(value){

    return Math.min(1000000,Math.max(0,Math.round(Number(value)) || 0));
}


// Writes one line to the activity feed (who did what and when). A failed log must never fail the request
async function logActivity(user,action,album,detail){

    try {

        await activity.insertOne({
            user : user.subject,
            email : user.email,
            action : action,
            albumId : album && album._id ? String(album._id) : "",
            albumTitle : album ? album.title : "",
            detail : detail || "",
            at : new Date()
        });

    } catch (error) {

        console.log("Could not write activity : " + error.message);
    }
}

// Returns the ObjectId of a route param, or null when it is not a valid id
function toId(value){

    return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

// Playlist names are plain strings, 1 to 60 characters
function readName(body){

    return typeof body.name === "string" ? body.name.trim().slice(0,60) : "";
}

const formats = ["vinyl","cd","digital"];
const GST_RATE = 0.18;

const sorts = {
    newest : {_id : -1},
    title : {title : 1, _id : -1},
    artist : {artist : 1, title : 1},
    rating : {rating : -1, _id : -1}
};


app.get("/getall",async(req,res)=>{

    // Escape regex characters so input like "(" does not break the query
    const search = (req.query.search || "").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const filter = {};

    if( search ){

        filter.$or = [
            {title : {$regex : search, $options : "i"}},
            {artist : {$regex : search, $options : "i"}},
            {genre : {$regex : search, $options : "i"}}
        ];
    }

    if( req.query.status ){

        filter.status = req.query.status;
    }

    // forSale=1 : only albums that have a price in at least one format (the store)
    if( req.query.forSale ){

        filter.$and = [{$or : formats.map(format => ({["prices." + format] : {$gt : 0}}))}];
    }

    const limit = Math.min(50,Math.max(1,parseInt(req.query.limit) || 12));
    const total = await albums.countDocuments(filter);
    const pages = Math.max(1,Math.ceil(total / limit));
    const page = Math.min(pages,Math.max(1,parseInt(req.query.page) || 1));

    const items = await albums.find(filter)
        .collation({locale : "en", strength : 2})
        .sort(sorts[req.query.sort] || sorts.newest)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

    res.send({items : items, total : total, page : page, pages : pages});

});

app.get("/stats",async(req,res)=>{

    const total = await albums.countDocuments();
    const wishlist = await albums.countDocuments({status : "wishlist"});
    const result = await albums.aggregate([{$group : {_id : null, average : {$avg : "$rating"}}}]).toArray();
    const averageRating = result.length ? Math.round(result[0].average * 10) / 10 : 0;

    const genreRows = await albums.aggregate([
        {$group : {_id : {$cond : [{$in : ["$genre",[null,""]]},"Other","$genre"]}, count : {$sum : 1}}},
        {$sort : {count : -1, _id : 1}}
    ]).toArray();

    const ratingRows = await albums.aggregate([{$group : {_id : "$rating", count : {$sum : 1}}}]).toArray();

    // Always return all five ratings, with 0 for the ones nobody used
    const ratings = [1,2,3,4,5].map(star =>{

        const row = ratingRows.find(item => item._id === star);
        return {rating : star, count : row ? row.count : 0};
    });

    const revenueRow = await orders.aggregate([{$group : {_id : null, revenue : {$sum : "$total"}, count : {$sum : 1}}}]).toArray();

    // Orders for each of the last 7 days, in UTC (days without orders count as 0)
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 6);
    since.setUTCHours(0,0,0,0);

    const dayRows = await orders.aggregate([
        {$match : {createdAt : {$gte : since}}},
        {$group : {_id : {$dateToString : {format : "%Y-%m-%d", date : "$createdAt"}}, count : {$sum : 1}, revenue : {$sum : "$total"}}}
    ]).toArray();

    const ordersPerDay = [];

    for( let i = 0; i < 7; i++ ){

        const day = new Date(since);
        day.setUTCDate(since.getUTCDate() + i);
        const key = day.toISOString().slice(0,10);
        const row = dayRows.find(item => item._id === key);
        ordersPerDay.push({day : key, count : row ? row.count : 0, revenue : row ? row.revenue : 0});
    }

    res.send({
        revenue : revenueRow.length ? revenueRow[0].revenue : 0,
        orderCount : revenueRow.length ? revenueRow[0].count : 0,
        ordersPerDay : ordersPerDay,
        total : total,
        owned : total - wishlist,
        wishlist : wishlist,
        averageRating : averageRating,
        genres : genreRows.map(row => ({genre : row._id, count : row.count})),
        ratings : ratings
    });
});

// Latest events from the activity collection, newest first
app.get("/activity",async(req,res)=>{

    const limit = Math.min(50,Math.max(1,parseInt(req.query.limit) || 10));
    const items = await activity.find().sort({_id : -1}).limit(limit).toArray();

    res.send({items : items});
});

// Same feed, only for the logged in user
app.get("/me/activity",verifyToken,async(req,res)=>{

    const limit = Math.min(50,Math.max(1,parseInt(req.query.limit) || 10));
    const items = await activity.find({email : req.user.email}).sort({_id : -1}).limit(limit).toArray();

    res.send({items : items});
});

app.get("/get/:id",async(req,res)=>{

    const id = req.params.id;

    if( !ObjectId.isValid(id) ){

        return res.status(404).send({msg : "Album Id Invalid"});
    }

    const album = await albums.findOne({_id : new ObjectId(id)});

    if( album == null ){

        return res.status(404).send({msg : "Album not found"});
    }

    res.send( album );
});

app.post("/create",verifyToken,async(req,res)=>{

    const album = readAlbum(req.body);

    if( !album.title || !album.artist ){

        return res.status(422).send({msg : "Title and artist are required"});
    }

    const response = await albums.insertOne(album);
    await logActivity(req.user,"created",{...album,_id : response.insertedId},album.artist);

    res.status(201).send(response);

});

app.put("/update/:id",verifyToken,async(req,res)=>{

    const id = req.params.id;

    if( !ObjectId.isValid(id) ){

        return res.status(404).send({msg : "Album Id Invalid"});
    }

    const album = readAlbum(req.body);

    if( !album.title || !album.artist ){

        return res.status(422).send({msg : "Title and artist are required"});
    }

    const before = await albums.findOne({_id : new ObjectId(id)});

    if( before == null ){

        return res.status(404).send({msg : "Album not found"});
    }

    const response = await albums.updateOne({_id : new ObjectId(id)},{$set : album});
    const target = {...album,_id : before._id};

    if( album.rating !== before.rating ) await logActivity(req.user,"rating",target,before.rating + " to " + album.rating + " stars");
    if( album.status !== before.status ) await logActivity(req.user,"status",target,"now " + album.status);

    const otherFields = ["title","artist","genre","releaseYear","tracks"];

    if( otherFields.some(field => album[field] !== before[field]) ) await logActivity(req.user,"updated",target);

    res.send(response);

});

// Move an album between owned and wishlist by changing only its status
app.patch("/status/:id",verifyToken,async(req,res)=>{

    const id = req.params.id;

    if( !ObjectId.isValid(id) ){

        return res.status(404).send({msg : "Album Id Invalid"});
    }

    const status = req.body.status === "wishlist" ? "wishlist" : "owned";

    const album = await albums.findOneAndUpdate({_id : new ObjectId(id)},{$set : {status : status}},{returnDocument : "after"});

    if( album == null ){

        return res.status(404).send({msg : "Album not found"});
    }

    await logActivity(req.user,"status",album,"now " + status);

    res.send({matchedCount : 1});
});

// Change only the rating (used by the clickable stars)
app.patch("/rating/:id",verifyToken,async(req,res)=>{

    const id = req.params.id;

    if( !ObjectId.isValid(id) ){

        return res.status(404).send({msg : "Album Id Invalid"});
    }

    const rating = Math.min(5,Math.max(1,Math.round(Number(req.body.rating)) || 1));

    const before = await albums.findOneAndUpdate({_id : new ObjectId(id)},{$set : {rating : rating}},{returnDocument : "before"});

    if( before == null ){

        return res.status(404).send({msg : "Album not found"});
    }

    if( before.rating !== rating ) await logActivity(req.user,"rating",before,before.rating + " to " + rating + " stars");

    res.send({matchedCount : 1, rating : rating});
});

app.delete("/delete/:id",verifyToken,async(req,res)=>{

    const id = req.params.id;

    if( !ObjectId.isValid(id) ){

        return res.status(404).send({msg : "Album Id Invalid"});
    }

    const album = await albums.findOneAndDelete({_id : new ObjectId(id)});

    if( album == null ){

        return res.status(404).send({msg : "Album not found"});
    }

    // Remove the deleted album from every playlist and favorites list
    await playlists.updateMany({},{$pull : {albumIds : album._id}});
    await favorites.deleteMany({albumId : album._id});
    await carts.updateMany({},{$pull : {items : {albumId : album._id}}});
    await logActivity(req.user,"deleted",album,album.artist);

    res.send({deletedCount : 1});

});

app.post("/register",async(req,res)=>{

    const {name,email,password} = req.body;

    if( typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || !name || !email || !password ){

        return res.status(422).send({msg : "Name, email and password are required"});
    }

    const existing = await users.findOne({email : email});

    if( existing != null ){

        return res.status(409).send({msg : "Email already registered"});
    }

    const hashedPass = await bCrypt.hash(password,10);

    const response = await users.insertOne({name : name, email : email, password : hashedPass});

    res.status(201).send(response);
});

app.post("/login",async(req,res)=>{

    const {email,password} = req.body;

    // Only plain strings are allowed, so an object like {"$ne":null} cannot be used as a query
    const user = typeof email === "string" ? await users.findOne({email : email}) : null;

    if( user == null ){

        return res.status(422).send({msg : "Invalid Email"});
    }

    const isCorrect = await bCrypt.compare(typeof password === "string" ? password : "",user.password);

    if( !isCorrect ){

        return res.status(422).send({msg : "Invalid Password"});
    }

    const payLoad = {
        subject : user.name,
        email : user.email
    }

    res.send({jwtToken : jwtToken.sign(payLoad,SECRET,{expiresIn : "1d"}), name : user.name});

});



/* ---------- Favorites (per user, saved by email from the JWT) ---------- */

app.get("/favorites",verifyToken,async(req,res)=>{

    const rows = await favorites.find({email : req.user.email}).sort({_id : -1}).toArray();
    const items = await albums.find({_id : {$in : rows.map(row => row.albumId)}}).toArray();

    // Keep the newest favorite first
    const ordered = rows.map(row => items.find(album => album._id.equals(row.albumId))).filter(Boolean);

    res.send({items : ordered, ids : ordered.map(album => String(album._id))});
});

app.post("/favorites/:id",verifyToken,async(req,res)=>{

    const albumId = toId(req.params.id);
    const album = albumId ? await albums.findOne({_id : albumId}) : null;

    if( album == null ){

        return res.status(404).send({msg : "Album not found"});
    }

    const result = await favorites.updateOne(
        {email : req.user.email, albumId : albumId},
        {$setOnInsert : {email : req.user.email, albumId : albumId, at : new Date()}},
        {upsert : true}
    );

    if( result.upsertedCount ) await logActivity(req.user,"favorite",album);

    res.status(201).send({favorite : true});
});

app.delete("/favorites/:id",verifyToken,async(req,res)=>{

    const albumId = toId(req.params.id);

    if( albumId == null ){

        return res.status(404).send({msg : "Album Id Invalid"});
    }

    await favorites.deleteOne({email : req.user.email, albumId : albumId});

    res.send({favorite : false});
});


/* ---------- Playlists (owned by the logged in user) ---------- */

// Loads a playlist only when it belongs to the logged in user
async function findOwnPlaylist(req,res){

    const id = toId(req.params.id);
    const playlist = id ? await playlists.findOne({_id : id, owner : req.user.email}) : null;

    if( playlist == null ){

        res.status(404).send({msg : "Playlist not found"});
    }

    return playlist;
}

app.get("/playlists",verifyToken,async(req,res)=>{

    const rows = await playlists.find({owner : req.user.email}).sort({_id : -1}).toArray();
    const covers = await albums.find({_id : {$in : rows.flatMap(row => row.albumIds.slice(0,4))}}).toArray();

    const items = rows.map(row => ({
        _id : row._id,
        name : row.name,
        createdAt : row.createdAt,
        albumIds : row.albumIds.map(String),
        count : row.albumIds.length,
        covers : row.albumIds.slice(0,4).map(albumId => covers.find(album => album._id.equals(albumId))).filter(Boolean)
            .map(album => ({_id : album._id, title : album.title, genre : album.genre}))
    }));

    res.send({items : items});
});

app.post("/playlists",verifyToken,async(req,res)=>{

    const name = readName(req.body);

    if( !name ){

        return res.status(422).send({msg : "Playlist name is required"});
    }

    const playlist = {owner : req.user.email, name : name, albumIds : [], createdAt : new Date()};
    const response = await playlists.insertOne(playlist);

    await logActivity(req.user,"playlist",null,'created playlist "' + name + '"');

    res.status(201).send({...playlist,_id : response.insertedId});
});

app.get("/playlists/:id",verifyToken,async(req,res)=>{

    const playlist = await findOwnPlaylist(req,res);
    if( playlist == null ) return;

    const found = await albums.find({_id : {$in : playlist.albumIds}}).toArray();
    const items = playlist.albumIds.map(albumId => found.find(album => album._id.equals(albumId))).filter(Boolean);

    res.send({_id : playlist._id, name : playlist.name, createdAt : playlist.createdAt, items : items});
});

app.patch("/playlists/:id",verifyToken,async(req,res)=>{

    const playlist = await findOwnPlaylist(req,res);
    if( playlist == null ) return;

    const name = readName(req.body);

    if( !name ){

        return res.status(422).send({msg : "Playlist name is required"});
    }

    await playlists.updateOne({_id : playlist._id},{$set : {name : name}});
    await logActivity(req.user,"playlist",null,'renamed playlist "' + playlist.name + '" to "' + name + '"');

    res.send({_id : playlist._id, name : name});
});

app.delete("/playlists/:id",verifyToken,async(req,res)=>{

    const playlist = await findOwnPlaylist(req,res);
    if( playlist == null ) return;

    await playlists.deleteOne({_id : playlist._id});
    await logActivity(req.user,"playlist",null,'deleted playlist "' + playlist.name + '"');

    res.send({deletedCount : 1});
});

app.post("/playlists/:id/albums/:albumId",verifyToken,async(req,res)=>{

    const playlist = await findOwnPlaylist(req,res);
    if( playlist == null ) return;

    const albumId = toId(req.params.albumId);
    const album = albumId ? await albums.findOne({_id : albumId}) : null;

    if( album == null ){

        return res.status(404).send({msg : "Album not found"});
    }

    const result = await playlists.updateOne({_id : playlist._id},{$addToSet : {albumIds : albumId}});

    if( result.modifiedCount ) await logActivity(req.user,"playlist",album,'added to "' + playlist.name + '"');

    res.status(201).send({added : result.modifiedCount === 1});
});

app.delete("/playlists/:id/albums/:albumId",verifyToken,async(req,res)=>{

    const playlist = await findOwnPlaylist(req,res);
    if( playlist == null ) return;

    const albumId = toId(req.params.albumId);

    if( albumId == null ){

        return res.status(404).send({msg : "Album Id Invalid"});
    }

    await playlists.updateOne({_id : playlist._id},{$pull : {albumIds : albumId}});

    res.send({removed : true});
});



/* ---------- Tracklist ---------- */

// Replaces the whole tracklist of an album. The client sends the new order after add, edit, delete or move up/down
app.put("/albums/:id/tracklist",verifyToken,async(req,res)=>{

    const id = toId(req.params.id);

    if( id == null ){

        return res.status(404).send({msg : "Album Id Invalid"});
    }

    const list = req.body.tracklist;

    if( !Array.isArray(list) || list.length > 100 ){

        return res.status(422).send({msg : "Tracklist must be a list of up to 100 tracks"});
    }

    const tracklist = [];

    for( const item of list ){

        const title = item && typeof item.title === "string" ? item.title.trim() : "";
        const duration = Number(item && item.duration);

        if( !title || title.length > 100 ){

            return res.status(422).send({msg : "Every track needs a title of up to 100 characters"});
        }

        if( !Number.isInteger(duration) || duration < 1 || duration > 7200 ){

            return res.status(422).send({msg : "Track duration must be between 0:01 and 120:00"});
        }

        tracklist.push({title : title, duration : duration, preview : item.preview === true});
    }

    const album = await albums.findOneAndUpdate({_id : id},{$set : {tracklist : tracklist, tracks : tracklist.length}},{returnDocument : "after"});

    if( album == null ){

        return res.status(404).send({msg : "Album not found"});
    }

    await logActivity(req.user,"tracks",album,tracklist.length + " tracks");

    res.send({tracklist : tracklist, tracks : tracklist.length});
});


/* ---------- Cart (one per user, keyed by the email in the JWT) ---------- */

// Builds the cart the client sees. Prices always come from the albums collection, never from the client
async function buildCart(email){

    const cart = await carts.findOne({email : email});
    const rows = cart ? cart.items : [];
    const found = await albums.find({_id : {$in : rows.map(row => row.albumId)}}).toArray();

    const items = rows.map(row =>{

        const album = found.find(item => item._id.equals(row.albumId));
        const price = album && album.prices ? album.prices[row.format] || 0 : 0;

        return album && price > 0 ? {
            albumId : String(album._id),
            title : album.title,
            artist : album.artist,
            genre : album.genre,
            format : row.format,
            qty : row.qty,
            price : price,
            lineTotal : price * row.qty
        } : null;

    }).filter(Boolean);

    const subtotal = items.reduce((sum,item) => sum + item.lineTotal,0);
    const gst = Math.round(subtotal * GST_RATE);

    return {items : items, count : items.reduce((sum,item) => sum + item.qty,0), subtotal : subtotal, gst : gst, total : subtotal + gst};
}

app.get("/cart",verifyToken,async(req,res)=>{

    res.send(await buildCart(req.user.email));
});

// Add one copy of an album in a format ({albumId, format})
app.post("/cart",verifyToken,async(req,res)=>{

    const albumId = toId(req.body.albumId);
    const format = req.body.format;
    const album = albumId ? await albums.findOne({_id : albumId}) : null;

    if( album == null ){

        return res.status(404).send({msg : "Album not found"});
    }

    if( !formats.includes(format) || !album.prices || !(album.prices[format] > 0) ){

        return res.status(422).send({msg : "This album is not sold in that format"});
    }

    const cart = await carts.findOne({email : req.user.email});
    const line = cart && cart.items.find(item => item.albumId.equals(albumId) && item.format === format);

    if( line && line.qty >= 10 ){

        return res.status(422).send({msg : "You can buy at most 10 copies of one item"});
    }

    if( line ){

        await carts.updateOne({email : req.user.email, items : {$elemMatch : {albumId : albumId, format : format}}},{$inc : {"items.$.qty" : 1}});

    } else {

        await carts.updateOne({email : req.user.email},{$push : {items : {albumId : albumId, format : format, qty : 1}}, $set : {updatedAt : new Date()}},{upsert : true});
    }

    res.status(201).send(await buildCart(req.user.email));
});

// Set the quantity of a line ({albumId, format, qty}). 0 removes it
app.patch("/cart",verifyToken,async(req,res)=>{

    const albumId = toId(req.body.albumId);
    const qty = Math.min(10,Math.round(Number(req.body.qty)));

    if( albumId == null || !formats.includes(req.body.format) || Number.isNaN(qty) ){

        return res.status(422).send({msg : "albumId, format and qty are required"});
    }

    if( qty <= 0 ){

        await carts.updateOne({email : req.user.email},{$pull : {items : {albumId : albumId, format : req.body.format}}});

    } else {

        await carts.updateOne({email : req.user.email, items : {$elemMatch : {albumId : albumId, format : req.body.format}}},{$set : {"items.$.qty" : qty}});
    }

    res.send(await buildCart(req.user.email));
});

app.delete("/cart/:albumId/:format",verifyToken,async(req,res)=>{

    const albumId = toId(req.params.albumId);

    if( albumId == null ){

        return res.status(404).send({msg : "Album Id Invalid"});
    }

    await carts.updateOne({email : req.user.email},{$pull : {items : {albumId : albumId, format : req.params.format}}});

    res.send(await buildCart(req.user.email));
});


/* ---------- Orders and mock payment (no real money moves, nothing is sent to a bank) ---------- */

// Luhn check : the standard checksum every real card number passes
function passesLuhn(number){

    let sum = 0;

    for( let i = 0; i < number.length; i++ ){

        let digit = Number(number[number.length - 1 - i]);

        if( i % 2 === 1 ){

            digit *= 2;
            if( digit > 9 ) digit -= 9;
        }

        sum += digit;
    }

    return sum % 10 === 0;
}

function cardBrand(number){

    if( /^4/.test(number) ) return "Visa";
    if( /^(5[1-5]|2[2-7])/.test(number) ) return "Mastercard";
    if( /^3[47]/.test(number) ) return "Amex";

    return "Card";
}

// Returns an error message, or "" when the shipping details are fine
function checkShipping(shipping){

    const text = (value) => typeof value === "string" ? value.trim() : "";

    if( !shipping || typeof shipping !== "object" ) return "Shipping details are required";
    if( !text(shipping.name) ) return "Shipping name is required";
    if( !/^\d{10}$/.test(text(shipping.phone)) ) return "Phone must be 10 digits";
    if( text(shipping.address).length < 5 ) return "Address is required";
    if( !text(shipping.city) ) return "City is required";
    if( !/^\d{6}$/.test(text(shipping.pin)) ) return "PIN code must be 6 digits";

    return "";
}

// Returns an error message, or "" when the card passes the mock checks
function checkCard(card){

    if( !card || typeof card !== "object" ) return "Card details are required";

    const number = String(card.number || "").replace(/\s/g,"");

    if( !/^\d{13,19}$/.test(number) || !passesLuhn(number) ) return "Card number is not valid";

    const match = /^(\d{2})\/(\d{2})$/.exec(String(card.expiry || ""));

    if( !match || Number(match[1]) < 1 || Number(match[1]) > 12 ) return "Expiry must look like MM/YY";

    // a card is valid until the end of its expiry month
    const endOfMonth = new Date(2000 + Number(match[2]),Number(match[1]),1);

    if( endOfMonth <= new Date() ) return "Card has expired";

    if( !/^\d{3,4}$/.test(String(card.cvv || "")) ) return "CVV must be 3 or 4 digits";
    if( typeof card.name !== "string" || !card.name.trim() ) return "Name on card is required";

    return "";
}

app.post("/orders",verifyToken,async(req,res)=>{

    const shippingError = checkShipping(req.body.shipping);

    if( shippingError ) return res.status(422).send({msg : shippingError});

    const cardError = checkCard(req.body.card);

    if( cardError ) return res.status(422).send({msg : cardError});

    const cart = await buildCart(req.user.email);

    if( cart.items.length === 0 ){

        return res.status(422).send({msg : "Your cart is empty"});
    }

    const number = String(req.body.card.number).replace(/\s/g,"");

    // this test card is always declined
    if( number === "4000000000000002" ){

        return res.status(402).send({msg : "Payment declined by the card issuer"});
    }

    const shipping = req.body.shipping;

    const order = {
        email : req.user.email,
        user : req.user.subject,
        items : cart.items,
        subtotal : cart.subtotal,
        gst : cart.gst,
        total : cart.total,
        shipping : {name : shipping.name.trim(), phone : shipping.phone.trim(), address : shipping.address.trim(), city : shipping.city.trim(), pin : shipping.pin.trim()},
        payment : {brand : cardBrand(number), last4 : number.slice(-4), txnId : "TXN" + crypto.randomBytes(5).toString("hex").toUpperCase()},
        status : "paid",
        createdAt : new Date()
    };

    const response = await orders.insertOne(order);

    await carts.deleteOne({email : req.user.email});
    await logActivity(req.user,"order",null,"order #" + String(response.insertedId).slice(-6).toUpperCase() + " · Rs " + order.total);

    res.status(201).send({...order,_id : response.insertedId});
});

app.get("/orders",verifyToken,async(req,res)=>{

    const items = await orders.find({email : req.user.email}).sort({_id : -1}).toArray();

    res.send({items : items});
});

app.get("/orders/:id",verifyToken,async(req,res)=>{

    const id = toId(req.params.id);
    const order = id ? await orders.findOne({_id : id, email : req.user.email}) : null;

    if( order == null ){

        return res.status(404).send({msg : "Order not found"});
    }

    res.send(order);
});
