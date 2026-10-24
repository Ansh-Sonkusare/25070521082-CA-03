const express = require("express");
const {MongoClient,ObjectId} = require("mongodb");
const bodyparser = require("body-parser");
const cors = require("cors");
const bCrypt = require("bcrypt");
const jwtToken = require("jsonwebtoken");


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


async function connectToMongoDb(){

    for( let attempt = 1; attempt <= 10; attempt++ ){

        try {

            await client.connect();
            console.log("Connection successfully done with mongodb");

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

        await albums.insertMany([
            {title : "Abbey Road", artist : "The Beatles", genre : "Rock", releaseYear : 1969, tracks : 17, rating : 5, status : "owned"},
            {title : "Thriller", artist : "Michael Jackson", genre : "Pop", releaseYear : 1982, tracks : 9, rating : 5, status : "owned"},
            {title : "Kind of Blue", artist : "Miles Davis", genre : "Jazz", releaseYear : 1959, tracks : 5, rating : 5, status : "owned"},
            {title : "Random Access Memories", artist : "Daft Punk", genre : "Electronic", releaseYear : 2013, tracks : 13, rating : 4, status : "wishlist"},
            {title : "To Pimp a Butterfly", artist : "Kendrick Lamar", genre : "Hip-Hop", releaseYear : 2015, tracks : 16, rating : 5, status : "wishlist"},
            {title : "Rumours", artist : "Fleetwood Mac", genre : "Rock", releaseYear : 1977, tracks : 11, rating : 4, status : "owned"}
        ]);
        console.log("Sample albums added");
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
        next();

    } catch (error) {

        res.status(401).send({msg : "Invalid or expired token"});
    }
}

// Reads the album fields from the request body, converts numbers and keeps rating between 1 and 5
function readAlbum(body){

    const {title,artist,genre,releaseYear,tracks,rating,status} = body;

    return {
        title : typeof title === "string" ? title.trim() : "",
        artist : typeof artist === "string" ? artist.trim() : "",
        genre : typeof genre === "string" ? genre : "",
        releaseYear : Number(releaseYear),
        tracks : Number(tracks),
        rating : Math.min(5,Math.max(1,Math.round(Number(rating)) || 1)),
        status : status === "wishlist" ? "wishlist" : "owned"
    };
}


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

    let data = await albums.find(filter).sort({_id : -1}).toArray();

    res.send( data );

});

app.get("/stats",async(req,res)=>{

    const total = await albums.countDocuments();
    const wishlist = await albums.countDocuments({status : "wishlist"});
    const result = await albums.aggregate([{$group : {_id : null, average : {$avg : "$rating"}}}]).toArray();
    const averageRating = result.length ? Math.round(result[0].average * 10) / 10 : 0;

    res.send({total : total, owned : total - wishlist, wishlist : wishlist, averageRating : averageRating});
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

    const response = await albums.updateOne({_id : new ObjectId(id)},{$set : album});

    if( response.matchedCount === 0 ){

        return res.status(404).send({msg : "Album not found"});
    }

    res.send(response);

});

// Move an album between owned and wishlist by changing only its status
app.patch("/status/:id",verifyToken,async(req,res)=>{

    const id = req.params.id;

    if( !ObjectId.isValid(id) ){

        return res.status(404).send({msg : "Album Id Invalid"});
    }

    const status = req.body.status === "wishlist" ? "wishlist" : "owned";

    const response = await albums.updateOne({_id : new ObjectId(id)},{$set : {status : status}});

    if( response.matchedCount === 0 ){

        return res.status(404).send({msg : "Album not found"});
    }

    res.send(response);
});

app.delete("/delete/:id",verifyToken,async(req,res)=>{

    const id = req.params.id;

    if( !ObjectId.isValid(id) ){

        return res.status(404).send({msg : "Album Id Invalid"});
    }

    const response = await albums.deleteOne({_id : new ObjectId(id)});

    if( response.deletedCount === 0 ){

        return res.status(404).send({msg : "Album not found"});
    }

    res.send(response);

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
