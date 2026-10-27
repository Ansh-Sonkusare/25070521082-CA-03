import { useEffect,useState } from 'react';
import { Link,useNavigate,useParams } from 'react-router-dom';
import { apiRequest } from './api';
import genreColor from './homeComp/genre';
import StarRating from './homeComp/starRating';
import HeartButton from './homeComp/heartButton';
import AddToPlaylist from './homeComp/addToPlaylist';
import Tracklist from './homeComp/tracklist';
import BuyBox from './homeComp/buyBox';
import { useConfirm,useToast } from './uiContext';

const AlbumDetails = ({userName}) =>{

    const {id} = useParams();
    const navigate = useNavigate();
    const [album,setAlbum] = useState(null);
    const [error,setError] = useState("");
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(()=>{

        apiRequest("/get/" + id).then(setAlbum).catch(err => setError(err.message));

    },[id]);

    // Switch between owned and wishlist, then reload the album from the server
    const changeStatus = async () =>{

        const newStatus = album.status === "wishlist" ? "owned" : "wishlist";

        try {
            await apiRequest("/status/" + id,{method : "PATCH", body : {status : newStatus}});
            setAlbum(await apiRequest("/get/" + id));
            toast('"' + album.title + '" is now ' + newStatus);
        } catch (err) {
            toast(err.message,"bad");
        }
    }

    const rate = async (n) =>{

        const old = album.rating;
        setAlbum({...album, rating : n});

        try {
            await apiRequest("/rating/" + id,{method : "PATCH", body : {rating : n}});
            toast("Rated " + n + " ★");
        } catch (err) {
            setAlbum({...album, rating : old});
            toast(err.message,"bad");
        }
    }

    const deleteAlbum = async () =>{

        const ok = await confirm({title : "Delete album?", text : '"' + album.title + '" will be removed from the collection and from every playlist.', button : "Delete"});
        if( !ok ) return;

        try {
            await apiRequest("/delete/" + id,{method : "DELETE"});
            toast('"' + album.title + '" deleted');
            navigate("/collection");
        } catch (err) {
            toast(err.message,"bad");
        }
    }

    if( error ) return <p className="note bad">{error} <Link to="/collection">Back to albums</Link></p>

    if( !album ) return <p className="empty">Loading album...</p>

    const isWishlist = album.status === "wishlist";

    return (
        <>
            <Link to="/collection" className="back">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
                Back to collection
            </Link>

            <div className="detail" style={{"--genre" : genreColor(album.genre), "--label" : isWishlist ? "#58CDB9" : "#F0B600"}}>
                <div className="sleeve">
                    <div className="disc"></div>
                    <div className="cover">
                        <span className="mono" aria-hidden="true">{album.title.charAt(0)}</span>
                        <span className="tag">{album.genre}</span>
                    </div>
                </div>

                <article className="info">
                    <div className="line">
                        <span className={"chip" + (isWishlist ? " wish" : "")}>{isWishlist ? "Wishlist" : "Owned"}</span>
                        <StarRating rating={album.rating} onRate={userName ? rate : undefined}/>
                        { userName && <HeartButton album={album}/> }
                    </div>
                    <h1>{album.title}</h1>
                    <p className="by">{album.artist}</p>

                    <dl className="facts">
                        <div><dt>Genre</dt><dd>{album.genre}</dd></div>
                        <div><dt>Released</dt><dd>{album.releaseYear}</dd></div>
                        <div><dt>Tracks</dt><dd>{album.tracks}</dd></div>
                        <div><dt>Rating</dt><dd className="gold">{album.rating} / 5</dd></div>
                    </dl>
                    <p className="rid">Record id <span>{album._id}</span></p>

                    <BuyBox album={album}/>

                    {
                        userName &&
                        <div className="acts">
                            <button className="pill pill-teal" onClick={changeStatus}>{album.status === "wishlist" ? "Mark owned" : "Move to wishlist"}</button>
                            <Link to={"/edit/" + album._id} className="pill pill-gold">Edit album</Link>
                            <AddToPlaylist album={album}/>
                            <button className="pill pill-del" onClick={deleteAlbum}>Delete</button>
                        </div>
                    }
                </article>
            </div>

            <Tracklist album={album} userName={userName} onChange={(changes) => setAlbum({...album, ...changes})}/>
        </>
    )
}


export default AlbumDetails;
