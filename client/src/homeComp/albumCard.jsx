import { Link } from 'react-router-dom';
import genreColor from './genre';
import StarRating from './starRating';
import HeartButton from './heartButton';

const AlbumCard = ({album,userName,onChangeStatus,onDelete,onRate,onRemove,index = 0}) =>{

    const isWishlist = album.status === "wishlist";

    return (
        <article className="item enter" style={{"--genre" : genreColor(album.genre), "--label" : isWishlist ? "#58CDB9" : "#F0B600", "--i" : index % 12}}>
            <Link to={"/album/" + album._id} className="sleeve" aria-label={album.title}>
                <div className="disc"></div>
                <div className="cover">
                    <span className="mono" aria-hidden="true">{album.title.charAt(0)}</span>
                    <span className="tag">{album.genre}</span>
                    <span className={"chip" + (isWishlist ? " wish" : "")}>{isWishlist ? "Wishlist" : "Owned"}</span>
                </div>
            </Link>
            { userName && <HeartButton album={album}/> }
            <div>
                <Link to={"/album/" + album._id} className="name">{album.title}</Link>
                <div className="meta">
                    <span>{album.artist}</span>
                    <span>{album.releaseYear} · {album.tracks} tracks</span>
                </div>
            </div>
            <div className="line">
                <StarRating rating={album.rating} onRate={userName && onRate ? (n) => onRate(album,n) : undefined}/>
                {
                    userName && onChangeStatus &&
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
                {
                    onRemove &&
                    <button className="pill" onClick={() => onRemove(album)}>Remove</button>
                }
            </div>
        </article>
    )
}


export default AlbumCard;
