import { useState } from 'react';
import { apiRequest } from '../api';
import { usePlayer } from '../playerContext';
import { useToast,useConfirm } from '../uiContext';
import { mmss,parseMmss,playLength,runtime } from '../money';
import Equalizer from './equalizer';

const blank = {title : "", time : "", preview : false};

// Tracklist of an album with fake play buttons. Logged in users can add, edit, delete and reorder tracks
const Tracklist = ({album,userName,onChange}) =>{

    const tracks = album.tracklist || [];
    const {player,play} = usePlayer();
    const toast = useToast();
    const confirm = useConfirm();
    const [editing,setEditing] = useState(-1);
    const [draft,setDraft] = useState(blank);
    const [adding,setAdding] = useState(blank);
    const [error,setError] = useState("");
    const [flash,setFlash] = useState(-1);

    const total = tracks.reduce((sum,t) => sum + t.duration,0);
    const current = player && player.album._id === album._id ? player : null;

    // Send the whole new list to the server, show it right away and undo if the server says no
    const save = async (list,message) =>{

        try {
            const data = await apiRequest("/albums/" + album._id + "/tracklist",{method : "PUT", body : {tracklist : list}});
            onChange({tracklist : data.tracklist, tracks : data.tracks});
            if( message ) toast(message);
            return true;
        } catch (err) {
            toast(err.message,"bad");
            return false;
        }
    }

    // turns the form values into a track, or sets an error message
    const readForm = (form) =>{

        const duration = parseMmss(form.time);

        if( !form.title.trim() ){ setError("Track title is required"); return null; }
        if( Number.isNaN(duration) || duration < 1 ){ setError("Duration must look like 3:45"); return null; }

        setError("");

        return {title : form.title.trim(), duration, preview : form.preview};
    }

    const addTrack = async (e) =>{

        e.preventDefault();

        const track = readForm(adding);
        if( !track ) return;

        if( await save([...tracks,track],"Track added") ) setAdding(blank);
    }

    const saveEdit = async () =>{

        const track = readForm(draft);
        if( !track ) return;

        if( await save(tracks.map((t,i) => i === editing ? track : t),"Track updated") ) setEditing(-1);
    }

    const removeTrack = async (i) =>{

        const ok = await confirm({title : "Delete track?", text : '"' + tracks[i].title + '" will be removed from this album.', button : "Delete"});
        if( ok ) save(tracks.filter((_,n) => n !== i),"Track deleted");
    }

    const move = async (i,dir) =>{

        const list = [...tracks];
        [list[i],list[i + dir]] = [list[i + dir],list[i]];

        if( await save(list) ){

            setFlash(i + dir);
            setTimeout(() => setFlash(-1),700);
        }
    }

    const startEdit = (i) =>{

        setEditing(i);
        setDraft({title : tracks[i].title, time : mmss(tracks[i].duration), preview : !!tracks[i].preview});
        setError("");
    }

    return (
        <section className="tracklist" aria-label="Tracklist">
            <div className="tl-head">
                <h3>Tracklist</h3>
                <span className="muted">{tracks.length} {tracks.length === 1 ? "track" : "tracks"} · {runtime(total)}</span>
            </div>

            { tracks.length === 0 && <p className="muted">No tracks yet.{userName ? " Add the first one below." : ""}</p> }

            <ol className="tl">
                {
                    tracks.map((t,i) =>{

                        const active = current && current.index === i;

                        if( editing === i ){

                            return (
                                <li key={i} className="tl-row edit">
                                    <span className="tl-no">{i + 1}</span>
                                    <input className="form-control" aria-label="Track title" value={draft.title} onChange={e => setDraft({...draft, title : e.target.value})}/>
                                    <input className="form-control time" aria-label="Duration (mm:ss)" placeholder="3:45" value={draft.time} onChange={e => setDraft({...draft, time : e.target.value})}/>
                                    <label className="chk"><input type="checkbox" checked={draft.preview} onChange={e => setDraft({...draft, preview : e.target.checked})}/> Preview</label>
                                    <span className="tl-acts">
                                        <button type="button" className="pill pill-gold" onClick={saveEdit}>Save</button>
                                        <button type="button" className="pill" onClick={() => setEditing(-1)}>Cancel</button>
                                    </span>
                                </li>
                            )
                        }

                        return (
                            <li key={i} className={"tl-row" + (active ? " active" : "") + (flash === i ? " flash" : "")}>
                                <span className="tl-no">
                                    { active && current.playing ? <Equalizer on/> : i + 1 }
                                </span>
                                <button type="button" className="tl-play" aria-label={(active && current.playing ? "Pause " : "Play ") + t.title} onClick={() => play(album,tracks,i)}>
                                    {active && current.playing ? "❚❚" : "▶"}
                                </button>
                                <span className="tl-title">
                                    {t.title}
                                    { t.preview && <span className="chip prev">Preview</span> }
                                </span>
                                <span className="tl-time">{mmss(t.duration)}</span>
                                {
                                    userName &&
                                    <span className="tl-acts">
                                        <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i,-1)}>▲</button>
                                        <button type="button" aria-label="Move down" disabled={i === tracks.length - 1} onClick={() => move(i,1)}>▼</button>
                                        <button type="button" aria-label="Edit track" onClick={() => startEdit(i)}>✎</button>
                                        <button type="button" aria-label="Delete track" onClick={() => removeTrack(i)}>✕</button>
                                    </span>
                                }
                                { active && <div className="track-bar row"><div style={{transform : "scaleX(" + Math.min(1,current.elapsed / playLength(t)) + ")"}}></div></div> }
                            </li>
                        )
                    })
                }
            </ol>

            {
                userName &&
                <form className="tl-add" onSubmit={addTrack} noValidate>
                    <input className="form-control" aria-label="New track title" placeholder="New track title" value={adding.title} onChange={e => setAdding({...adding, title : e.target.value})}/>
                    <input className="form-control time" aria-label="New track duration" placeholder="mm:ss" value={adding.time} onChange={e => setAdding({...adding, time : e.target.value})}/>
                    <label className="chk"><input type="checkbox" checked={adding.preview} onChange={e => setAdding({...adding, preview : e.target.checked})}/> Preview</label>
                    <button className="pill pill-gold">+ Add track</button>
                </form>
            }
            <p className={"field-err" + (error ? " show" : "")} role={error ? "alert" : undefined}>{error}</p>
            <p className="muted tl-note">Play buttons are a demo: no audio, just a timer. Preview tracks play a 30 second clip.</p>
        </section>
    )
}


export default Tracklist;
