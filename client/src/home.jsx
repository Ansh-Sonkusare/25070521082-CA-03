import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from './api';
import Header from './homeComp/header';
import AlbumCard from './homeComp/albumCard';
import './App.css';

const Home = ({userName}) =>{

    const [albums,setAlbums] = useState([]);
    const [search,setSearch] = useState("");
    const [status,setStatus] = useState("");
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState("");
    const [message,setMessage] = useState("");
    const [refreshKey,setRefreshKey] = useState(0);

    // Fetch albums from the server whenever search, filter or refreshKey changes
    useEffect(()=>{

        let ignore = false;

        const timer = setTimeout(()=>{

            setLoading(true);

            const params = new URLSearchParams();
            if( search ) params.append("search",search);
            if( status ) params.append("status",status);

            apiRequest("/getall?" + params.toString())
                .then(data =>{
                    if( !ignore ){
                        setAlbums(data);
                        setError("");
                    }
                })
                .catch(err =>{
                    if( !ignore ) setError(err.message);
                })
                .finally(()=>{
                    if( !ignore ) setLoading(false);
                });

        },300);

        return () =>{
            ignore = true;
            clearTimeout(timer);
        }

    },[search,status,refreshKey]);

    const changeStatus = async (album) =>{

        const newStatus = album.status === "wishlist" ? "owned" : "wishlist";

        try {
            await apiRequest("/status/" + album._id,{method : "PATCH", body : {status : newStatus}});
            setMessage('"' + album.title + '" is now ' + newStatus);
            setRefreshKey(key => key + 1);
        } catch (err) {
            setMessage(err.message);
        }
    }

    const deleteAlbum = async (album) =>{

        if( !window.confirm('Delete "' + album.title + '"?') ) return;

        try {
            await apiRequest("/delete/" + album._id,{method : "DELETE"});
            setMessage('"' + album.title + '" deleted');
            setRefreshKey(key => key + 1);
        } catch (err) {
            setMessage(err.message);
        }
    }

    return (
        <div className="home-cont">

            <div className="top">
                <h1>The<br/>collection</h1>
                <Header refreshKey = {refreshKey}/>
            </div>

            <div className="bar">
                <label className="search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A7A29A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="M20 20l-4-4"/>
                    </svg>
                    <input className="form-control" placeholder="Search by title, artist or genre"
                        value={search} onChange={e => setSearch(e.target.value)}/>
                </label>
                <div className="seg" role="group" aria-label="Filter by status">
                    <button type="button" className={status === "" ? "on" : ""} onClick={() => setStatus("")}>All</button>
                    <button type="button" className={status === "owned" ? "on" : ""} onClick={() => setStatus("owned")}>Owned</button>
                    <button type="button" className={status === "wishlist" ? "on" : ""} onClick={() => setStatus("wishlist")}>Wishlist</button>
                </div>
                <Link to="/add" className="pill pill-gold">+ Add Album</Link>
            </div>

            { !userName && <p className="note">Login to add, edit, move or delete albums.</p> }
            { message && <p className="note ok">{message}</p> }
            { error && <p className="note bad">Could not load albums : {error}</p> }

            {
                loading ? <p className="empty">Loading albums from server...</p> :
                albums.length === 0 ? <p className="empty">No albums found.</p> :
                <section className="grid" aria-label="Albums">
                    {
                        albums.map(album =>
                            <AlbumCard key={album._id} album={album} userName={userName}
                                onChangeStatus={changeStatus} onDelete={deleteAlbum}/>
                        )
                    }
                </section>
            }

        </div>
    )
}


export default Home;
