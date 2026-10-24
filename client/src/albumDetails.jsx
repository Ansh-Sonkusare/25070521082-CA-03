import { useEffect,useState } from 'react';
import { Link,useNavigate,useParams } from 'react-router-dom';
import { apiRequest } from './api';
import genreColor from './homeComp/genre';

const AlbumDetails = ({userName}) =>{

    const {id} = useParams();
    const navigate = useNavigate();
    const [album,setAlbum] = useState(null);
    const [error,setError] = useState("");

    useEffect(()=>{

        apiRequest("/get/" + id).then(setAlbum).catch(err => setError(err.message));

    },[id]);

    // Switch between owned and wishlist, then reload the album from the server
    const changeStatus = async () =>{

        const newStatus = album.status === "wishlist" ? "owned" : "wishlist";

        try {
            await apiRequest("/status/" + id,{method : "PATCH", body : {status : newStatus}});
            setAlbum(await apiRequest("/get/" + id));
        } catch (err) {
            setError(err.message);
        }
    }

    const deleteAlbum = async () =>{

        if( !window.confirm('Delete "' + album.title + '"?') ) return;

        try {
            await apiRequest("/delete/" + id,{method : "DELETE"});
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    }

    if( error ) return <p className="note bad">{error} <Link to="/">Back to albums</Link></p>

    if( !album ) return <p className="empty">Loading album...</p>

    const isWishlist = album.status === "wishlist";

    return (
        <>
            <Link to="/" className="back">
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
                        <span className="stars" role="img" aria-label={album.rating + " out of 5 stars"}>
                            {"★".repeat(album.rating)}<i>{"★".repeat(5 - album.rating)}</i>
                        </span>
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

                    {
                        userName &&
                        <div className="acts">
                            <button className="pill pill-teal" onClick={changeStatus}>{album.status === "wishlist" ? "Mark owned" : "Move to wishlist"}</button>
                            <Link to={"/edit/" + album._id} className="pill pill-gold">Edit album</Link>
                            <button className="pill pill-del" onClick={deleteAlbum}>Delete</button>
                        </div>
                    }
                </article>
            </div>
        </>
    )
}


export default AlbumDetails;
