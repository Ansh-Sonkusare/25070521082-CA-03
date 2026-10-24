import { Link } from 'react-router-dom';
import genreColor from './genre';

const AlbumCard = ({album,userName,onChangeStatus,onDelete}) =>{

    const isWishlist = album.status === "wishlist";

    return (
        <article className="item" style={{"--genre" : genreColor(album.genre), "--label" : isWishlist ? "#58CDB9" : "#F0B600"}}>
            <Link to={"/album/" + album._id} className="sleeve" aria-label={album.title}>
                <div className="disc"></div>
                <div className="cover">
                    <span className="mono" aria-hidden="true">{album.title.charAt(0)}</span>
                    <span className="tag">{album.genre}</span>
                    <span className={"chip" + (isWishlist ? " wish" : "")}>{isWishlist ? "Wishlist" : "Owned"}</span>
                </div>
            </Link>
            <div>
                <Link to={"/album/" + album._id} className="name">{album.title}</Link>
                <div className="meta">
                    <span>{album.artist}</span>
                    <span>{album.releaseYear} · {album.tracks} tracks</span>
                </div>
            </div>
            <div className="line">
                <span className="stars" role="img" aria-label={album.rating + " out of 5 stars"}>
                    {"★".repeat(album.rating)}<i>{"★".repeat(5 - album.rating)}</i>
                </span>
                {
                    userName &&
                    <div className="acts">
                        <Link to={"/edit/" + album._id} className="pill">Edit</Link>
                        <button className="pill pill-teal" onClick={() => onChangeStatus(album)}>
                            {isWishlist ? "Mark owned" : "To wishlist"}
                        </button>
                        <button className="pill pill-del" aria-label="Delete album" onClick={() => onDelete(album)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>
                            </svg>
                        </button>
                    </div>
                }
            </div>
        </article>
    )
}


export default AlbumCard;
