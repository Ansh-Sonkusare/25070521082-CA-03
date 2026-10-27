import { useEffect,useState } from 'react';
import { Link,Navigate,useParams } from 'react-router-dom';
import { apiRequest,getToken } from './api';
import { useToast } from './uiContext';
import AlbumCard from './homeComp/albumCard';

const PlaylistDetail = ({userName}) =>{

    const {id} = useParams();
    const [playlist,setPlaylist] = useState(null);
    const [error,setError] = useState("");
    const toast = useToast();

    useEffect(()=>{

        if( !getToken() ) return;

        let ignore = false;

        apiRequest("/playlists/" + id).then(d =>{ if( !ignore ) setPlaylist(d); }).catch(err =>{ if( !ignore ) setError(err.message); });

        return () =>{ ignore = true; };

    },[id]);

    if( !getToken() ) return <Navigate to="/login" replace/>

    const removeAlbum = async (album) =>{

        try {
            await apiRequest("/playlists/" + id + "/albums/" + album._id,{method : "DELETE"});
            setPlaylist({...playlist, items : playlist.items.filter(a => a._id !== album._id)});
            toast('Removed "' + album.title + '"');
        } catch (err) {
            toast(err.message,"bad");
        }
    }

    if( error ) return <p className="note bad">{error} <Link to="/playlists">Back to playlists</Link></p>

    if( !playlist ) return <p className="empty">Loading playlist...</p>

    return (
        <>
            <Link to="/playlists" className="back">‹ All playlists</Link>
            <h2 className="page-title">{playlist.name}</h2>
            {
                playlist.items.length === 0 ?
                <p className="empty">This playlist is empty. Open an album and use "Add to playlist".</p> :
                <section className="grid" aria-label="Albums in playlist">
                    { playlist.items.map((album,i) =>
                        <AlbumCard key={album._id} album={album} userName={userName} index={i} onRemove={removeAlbum}/>
                    )}
                </section>
            }
        </>
    )
}


export default PlaylistDetail;
