import { useCallback,useEffect,useRef,useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from './api';
import Header from './homeComp/header';
import AlbumCard from './homeComp/albumCard';
import SkeletonCard from './homeComp/skeletonCard';
import { useConfirm,useToast } from './uiContext';
import './App.css';

const PAGE_SIZE = 8;

// The collection: search, filter, sort, grid/list view and infinite scroll backed by /getall pagination
const Home = ({userName}) =>{

    const [albums,setAlbums] = useState([]);
    const [search,setSearch] = useState("");
    const [status,setStatus] = useState("");
    const [sort,setSort] = useState("newest");
    const [view,setView] = useState(() => localStorage.getItem("view") || "grid");
    const [page,setPage] = useState(1);
    const [pages,setPages] = useState(1);
    const [total,setTotal] = useState(0);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState("");
    const [refreshKey,setRefreshKey] = useState(0);
    const sentinel = useRef(null);
    const toast = useToast();
    const confirm = useConfirm();

    // Load page 1 again whenever search, filter, sort or refreshKey changes
    useEffect(()=>{

        let ignore = false;

        const timer = setTimeout(()=>{

            const params = new URLSearchParams({page : 1, limit : PAGE_SIZE, sort : sort});
            if( search ) params.append("search",search);
            if( status ) params.append("status",status);

            apiRequest("/getall?" + params.toString())
                .then(data =>{
                    if( !ignore ){
                        setAlbums(data.items);
                        setPage(1);
                        setPages(data.pages);
                        setTotal(data.total);
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

    },[search,status,sort,refreshKey]);

    const loadMore = useCallback(async ()=>{

        const params = new URLSearchParams({page : page + 1, limit : PAGE_SIZE, sort : sort});
        if( search ) params.append("search",search);
        if( status ) params.append("status",status);

        try {
            const data = await apiRequest("/getall?" + params.toString());
            setAlbums(list => [...list,...data.items.filter(a => !list.some(x => x._id === a._id))]);
            setPage(data.page);
            setPages(data.pages);
        } catch (err) {
            toast(err.message,"bad");
        }

    },[page,sort,search,status,toast]);

    // Infinite scroll : when the sentinel at the bottom becomes visible, ask for the next page
    useEffect(()=>{

        const node = sentinel.current;

        if( !node || loading || page >= pages ) return;

        const observer = new IntersectionObserver(([entry])=>{
            if( entry.isIntersecting ) loadMore();
        },{rootMargin : "300px"});

        observer.observe(node);

        return () => observer.disconnect();

    },[loading,page,pages,loadMore]);

    const changeStatus = async (album) =>{

        const newStatus = album.status === "wishlist" ? "owned" : "wishlist";

        try {
            await apiRequest("/status/" + album._id,{method : "PATCH", body : {status : newStatus}});
            setAlbums(list => list.map(a => a._id === album._id ? {...a, status : newStatus} : a));
            setRefreshKey(key => key + 1);
            toast('"' + album.title + '" is now ' + newStatus);
        } catch (err) {
            toast(err.message,"bad");
        }
    }

    const rateAlbum = async (album,rating) =>{

        const old = album.rating;
        setAlbums(list => list.map(a => a._id === album._id ? {...a, rating} : a));

        try {
            await apiRequest("/rating/" + album._id,{method : "PATCH", body : {rating}});
            toast('Rated "' + album.title + '" ' + rating + " ★");
        } catch (err) {
            setAlbums(list => list.map(a => a._id === album._id ? {...a, rating : old} : a));
            toast(err.message,"bad");
        }
    }

    const deleteAlbum = async (album) =>{

        const ok = await confirm({title : "Delete album?", text : '"' + album.title + '" will be removed from the collection and from every playlist.', button : "Delete"});
        if( !ok ) return;

        try {
            await apiRequest("/delete/" + album._id,{method : "DELETE"});
            toast('"' + album.title + '" deleted');
            setRefreshKey(key => key + 1);
        } catch (err) {
            toast(err.message,"bad");
        }
    }

    const changeView = (v) =>{

        setView(v);
        try { localStorage.setItem("view",v); } catch { /* storage blocked */ }
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
                    <input className="form-control" placeholder="Search by title, artist or genre" aria-label="Search albums"
                        value={search} onChange={e => setSearch(e.target.value)}/>
                </label>
                <div className="seg" role="group" aria-label="Filter by status">
                    <button type="button" className={status === "" ? "on" : ""} onClick={() => setStatus("")}>All</button>
                    <button type="button" className={status === "owned" ? "on" : ""} onClick={() => setStatus("owned")}>Owned</button>
                    <button type="button" className={status === "wishlist" ? "on" : ""} onClick={() => setStatus("wishlist")}>Wishlist</button>
                </div>
                <select className="form-control sort" aria-label="Sort albums" value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="title">Title A-Z</option>
                    <option value="artist">Artist A-Z</option>
                    <option value="rating">Top rated</option>
                </select>
                <div className="seg view" role="group" aria-label="View">
                    <button type="button" className={view === "grid" ? "on" : ""} aria-label="Grid view" onClick={() => changeView("grid")}>▦</button>
                    <button type="button" className={view === "list" ? "on" : ""} aria-label="List view" onClick={() => changeView("list")}>☰</button>
                </div>
                <Link to="/add" className="pill pill-gold">+ Add Album</Link>
            </div>

            { !userName && <p className="note">Login to add, edit, rate, favorite or delete albums.</p> }
            { error && <p className="note bad">Could not load albums : {error}</p> }

            {
                loading ?
                <section className="grid" aria-busy="true">{Array.from({length : 8},(_,i) => <SkeletonCard key={i}/>)}</section> :
                albums.length === 0 ? <p className="empty">No albums found.</p> :
                <>
                    <p className="count muted">Showing {albums.length} of {total} albums</p>
                    <section className={"grid" + (view === "list" ? " list" : "")} aria-label="Albums">
                        {
                            albums.map((album,i) =>
                                <AlbumCard key={album._id} album={album} userName={userName} index={i}
                                    onChangeStatus={changeStatus} onDelete={deleteAlbum} onRate={rateAlbum}/>
                            )
                        }
                    </section>
                    {
                        page < pages &&
                        <div ref={sentinel} className="more">
                            <button className="pill" onClick={loadMore}>Load more</button>
                        </div>
                    }
                </>
            }

        </div>
    )
}


export default Home;
