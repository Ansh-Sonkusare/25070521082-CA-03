import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { useToast } from '../uiContext';

// Dropdown on the album page: pick a playlist to add the album to
const AddToPlaylist = ({album}) =>{

    const [lists,setLists] = useState([]);
    const [open,setOpen] = useState(false);
    const toast = useToast();

    useEffect(()=>{

        let ignore = false;

        apiRequest("/playlists").then(data =>{ if( !ignore ) setLists(data.items); }).catch(() => {});

        return () => { ignore = true; };

    },[]);

    const add = async (list) =>{

        setOpen(false);

        try {
            const result = await apiRequest("/playlists/" + list._id + "/albums/" + album._id,{method : "POST"});
            setLists(all => all.map(l => l._id === list._id ? {...l, albumIds : [...l.albumIds,album._id]} : l));
            toast(result.added ? 'Added to "' + list.name + '"' : "Already in \"" + list.name + '"');
        } catch (err) {
            toast(err.message,"bad");
        }
    }

    return (
        <div className="menu-wrap" onBlur={e => { if( !e.currentTarget.contains(e.relatedTarget) ) setOpen(false); }}>
            <button type="button" className="pill" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>+ Add to playlist</button>
            <div className={"menu" + (open ? " open" : "")} role="menu">
                {
                    lists.length === 0 ?
                    <Link to="/playlists" role="menuitem">Create your first playlist</Link> :
                    lists.map(list =>
                        <button key={list._id} type="button" role="menuitem" tabIndex={open ? 0 : -1} onClick={() => add(list)}>
                            {list.name}
                            {list.albumIds.includes(album._id) && <span className="check">✓</span>}
                        </button>
                    )
                }
            </div>
        </div>
    )
}


export default AddToPlaylist;
