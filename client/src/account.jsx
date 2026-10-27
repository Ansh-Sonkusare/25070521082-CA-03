import { useEffect,useState } from 'react';
import { Link,Navigate } from 'react-router-dom';
import { apiRequest,getToken } from './api';
import { useFavorites } from './favContext';
import AlbumCard from './homeComp/albumCard';
import ActivityFeed from './homeComp/activityFeed';
import Reveal from './Reveal';

// "My account" : favorites, playlists and my own activity
const Account = ({userName}) =>{

    const [favs,setFavs] = useState([]);
    const [lists,setLists] = useState([]);
    const [feed,setFeed] = useState([]);
    const {ids} = useFavorites();

    useEffect(()=>{

        if( !getToken() ) return;

        let ignore = false;

        apiRequest("/favorites").then(d =>{ if( !ignore ) setFavs(d.items); }).catch(() => {});
        apiRequest("/playlists").then(d =>{ if( !ignore ) setLists(d.items); }).catch(() => {});
        apiRequest("/me/activity?limit=15").then(d =>{ if( !ignore ) setFeed(d.items); }).catch(() => {});

        return () =>{ ignore = true; };

    },[]);

    if( !getToken() ) return <Navigate to="/login" replace/>

    // hearts un-toggled on this page disappear from the list right away
    const shownFavs = favs.filter(a => ids.includes(a._id));

    return (
        <>
            <h2 className="page-title">{userName}'s account</h2>

            <Reveal as="section" className="acct-sec">
                <h3>Favorites <span className="muted">({shownFavs.length})</span></h3>
                {
                    shownFavs.length === 0 ? <p className="muted">No favorites yet. Tap the heart on any album.</p> :
                    <div className="grid">
                        { shownFavs.map((a,i) => <AlbumCard key={a._id} album={a} userName={userName} index={i}/>) }
                    </div>
                }
            </Reveal>

            <Reveal as="section" className="acct-sec">
                <h3>Playlists <span className="muted">({lists.length})</span></h3>
                {
                    lists.length === 0 ? <p className="muted">No playlists yet. <Link to="/playlists">Create one</Link>.</p> :
                    <ul className="plain">
                        { lists.map(l => <li key={l._id}><Link to={"/playlists/" + l._id}>{l.name}</Link> <span className="muted">· {l.count} albums</span></li>) }
                    </ul>
                }
            </Reveal>

            <Reveal as="section" className="acct-sec">
                <h3>My activity</h3>
                <ActivityFeed items={feed} showUser={false}/>
            </Reveal>
        </>
    )
}


export default Account;
