import { useEffect,useState } from 'react';
import { Link,Navigate } from 'react-router-dom';
import { apiRequest,getToken } from './api';
import { useConfirm,useToast } from './uiContext';
import genreColor from './homeComp/genre';

// All playlists of the logged in user : create, rename, delete
const Playlists = () =>{

    const [lists,setLists] = useState(null);
    const [name,setName] = useState("");
    const [editing,setEditing] = useState(null);
    const [editName,setEditName] = useState("");
    const [error,setError] = useState("");
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(()=>{

        if( !getToken() ) return;

        let ignore = false;

        apiRequest("/playlists").then(d =>{ if( !ignore ) setLists(d.items); }).catch(err =>{ if( !ignore ) setError(err.message); });

        return () =>{ ignore = true; };

    },[]);

    if( !getToken() ) return <Navigate to="/login" replace/>

    const create = async (e) =>{

        e.preventDefault();

        if( !name.trim() ){

            setError("Give the playlist a name");
            return;
        }

        try {
            const created = await apiRequest("/playlists",{method : "POST", body : {name}});
            setLists([{...created, count : 0, covers : [], albumIds : []},...lists]);
            setName("");
            setError("");
            toast('Playlist "' + created.name + '" created');
        } catch (err) {
            setError(err.message);
        }
    }

    const rename = async (list) =>{

        if( !editName.trim() ){

            toast("Name cannot be empty","bad");
            return;
        }

        try {
            await apiRequest("/playlists/" + list._id,{method : "PATCH", body : {name : editName}});
            setLists(lists.map(l => l._id === list._id ? {...l, name : editName.trim()} : l));
            setEditing(null);
            toast("Playlist renamed");
        } catch (err) {
            toast(err.message,"bad");
        }
    }

    const remove = async (list) =>{

        const ok = await confirm({title : "Delete playlist?", text : 'The playlist "' + list.name + '" will be deleted. Your albums stay in the collection.', button : "Delete"});
        if( !ok ) return;

        try {
            await apiRequest("/playlists/" + list._id,{method : "DELETE"});
            setLists(lists.filter(l => l._id !== list._id));
            toast("Playlist deleted");
        } catch (err) {
            toast(err.message,"bad");
        }
    }

    return (
        <>
            <h2 className="page-title">Playlists</h2>

            <form className="new-list" onSubmit={create} noValidate>
                <input className={"form-control" + (error ? " invalid" : "")} placeholder="New playlist name" aria-label="New playlist name" maxLength={60}
                    value={name} onChange={e => { setName(e.target.value); setError(""); }}/>
                <button className="pill pill-gold">Create playlist</button>
            </form>
            <p className={"field-err" + (error ? " show" : "")} role={error ? "alert" : undefined}>{error}</p>

            {
                !lists ? (error ? null : <p className="empty">Loading playlists...</p>) :
                lists.length === 0 ? <p className="empty">No playlists yet. Create your first one above.</p> :
                <div className="lists">
                    {
                        lists.map((list,i) =>
                            <article key={list._id} className="list-card enter" style={{"--i" : i}}>
                                <Link to={"/playlists/" + list._id} className="mosaic" aria-label={"Open " + list.name}>
                                    { [0,1,2,3].map(n =>
                                        <span key={n} style={{background : list.covers[n] ? genreColor(list.covers[n].genre) : "var(--sleeve)"}}>
                                            {list.covers[n] ? list.covers[n].title.charAt(0) : ""}
                                        </span>
                                    )}
                                </Link>
                                {
                                    editing === list._id ?
                                    <div className="rename">
                                        <input className="form-control" aria-label="Playlist name" value={editName} maxLength={60} autoFocus
                                            onChange={e => setEditName(e.target.value)} onKeyDown={e => { if( e.key === "Enter" ) rename(list); if( e.key === "Escape" ) setEditing(null); }}/>
                                        <button className="pill pill-gold" onClick={() => rename(list)}>Save</button>
                                    </div>
                                    :
                                    <>
                                        <Link to={"/playlists/" + list._id} className="name">{list.name}</Link>
                                        <span className="muted">{list.count} {list.count === 1 ? "album" : "albums"}</span>
                                        <div className="acts">
                                            <button className="pill" onClick={() => { setEditing(list._id); setEditName(list.name); }}>Rename</button>
                                            <button className="pill pill-del" onClick={() => remove(list)}>Delete</button>
                                        </div>
                                    </>
                                }
                            </article>
                        )
                    }
                </div>
            }
        </>
    )
}


export default Playlists;
