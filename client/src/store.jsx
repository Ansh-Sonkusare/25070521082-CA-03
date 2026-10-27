import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from './api';
import genreColor from './homeComp/genre';
import BuyBox from './homeComp/buyBox';
import SkeletonCard from './homeComp/skeletonCard';
import { useToast } from './uiContext';

const PAGE_SIZE = 8;

// Albums that have a price. Adds them to the server-side cart
const Store = () =>{

    const [albums,setAlbums] = useState([]);
    const [search,setSearch] = useState("");
    const [sort,setSort] = useState("newest");
    const [page,setPage] = useState(1);
    const [pages,setPages] = useState(1);
    const [loading,setLoading] = useState(true);
    const toast = useToast();

    useEffect(()=>{

        let ignore = false;

        const timer = setTimeout(()=>{

            const params = new URLSearchParams({forSale : 1, page : 1, limit : PAGE_SIZE, sort});
            if( search ) params.append("search",search);

            apiRequest("/getall?" + params.toString())
                .then(data =>{ if( !ignore ){ setAlbums(data.items); setPage(1); setPages(data.pages); } })
                .catch(err =>{ if( !ignore ) toast(err.message,"bad"); })
                .finally(() =>{ if( !ignore ) setLoading(false); });

        },300);

        return () =>{ ignore = true; clearTimeout(timer); };

    },[search,sort,toast]);

    const loadMore = async () =>{

        const params = new URLSearchParams({forSale : 1, page : page + 1, limit : PAGE_SIZE, sort});
        if( search ) params.append("search",search);

        try {
            const data = await apiRequest("/getall?" + params.toString());
            setAlbums(list => [...list,...data.items.filter(a => !list.some(x => x._id === a._id))]);
            setPage(data.page);
            setPages(data.pages);
        } catch (err) {
            toast(err.message,"bad");
        }
    }

    return (
        <>
            <h2 className="page-title">Store</h2>

            <div className="bar">
                <label className="search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A7A29A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="M20 20l-4-4"/>
                    </svg>
                    <input className="form-control" placeholder="Search the store" aria-label="Search the store" value={search} onChange={e => setSearch(e.target.value)}/>
                </label>
                <select className="form-control sort" aria-label="Sort" value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="title">Title A-Z</option>
                    <option value="artist">Artist A-Z</option>
                    <option value="rating">Top rated</option>
                </select>
            </div>

            {
                loading ? <section className="grid store-grid">{Array.from({length : 8},(_,i) => <SkeletonCard key={i}/>)}</section> :
                albums.length === 0 ? <p className="empty">Nothing for sale matches.</p> :
                <>
                    <section className="grid store-grid" aria-label="Albums for sale">
                        {
                            albums.map((album,i) =>
                                <article key={album._id} className="item enter" style={{"--genre" : genreColor(album.genre), "--label" : "#F0B600", "--i" : i % PAGE_SIZE}}>
                                    <Link to={"/album/" + album._id} className="sleeve" aria-label={album.title}>
                                        <div className="disc"></div>
                                        <div className="cover">
                                            <span className="mono" aria-hidden="true">{album.title.charAt(0)}</span>
                                            <span className="tag">{album.genre}</span>
                                        </div>
                                    </Link>
                                    <div>
                                        <Link to={"/album/" + album._id} className="name">{album.title}</Link>
                                        <div className="meta"><span>{album.artist}</span><span>{album.releaseYear}</span></div>
                                    </div>
                                    <BuyBox album={album}/>
                                </article>
                            )
                        }
                    </section>
                    { page < pages && <div className="more"><button className="pill" onClick={loadMore}>Load more</button></div> }
                </>
            }
        </>
    )
}


export default Store;
