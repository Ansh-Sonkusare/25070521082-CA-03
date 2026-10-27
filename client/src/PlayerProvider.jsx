import { useEffect,useState } from 'react';
import { PlayerContext } from './playerContext';
import { mmss,playLength } from './money';
import Equalizer from './homeComp/equalizer';

// Fake player : nothing is played, a timer just pretends. Holds the current album, track and elapsed seconds
const PlayerProvider = ({children}) =>{

    const [player,setPlayer] = useState(null);
    const playing = player ? player.playing : false;

    // tick 4 times a second while playing, move on to the next track when one ends
    useEffect(()=>{

        if( !playing ) return;

        const timer = setInterval(()=>{

            setPlayer(p =>{

                if( !p ) return p;

                const elapsed = p.elapsed + 0.25;

                if( elapsed < playLength(p.tracks[p.index]) ) return {...p, elapsed};
                if( p.index + 1 < p.tracks.length ) return {...p, index : p.index + 1, elapsed : 0};

                return {...p, playing : false, index : 0, elapsed : 0};
            });

        },250);

        return () => clearInterval(timer);

    },[playing]);

    // start a track, or pause / resume if it is already the current one
    const play = (album,tracks,index) =>{

        setPlayer(p =>
            p && p.album._id === album._id && p.index === index ?
            {...p, playing : !p.playing} :
            {album : {_id : album._id, title : album.title, artist : album.artist}, tracks, index, elapsed : 0, playing : true}
        );
    }

    const toggle = () => setPlayer(p => p && {...p, playing : !p.playing});

    const next = () => setPlayer(p => p && (p.index + 1 < p.tracks.length ? {...p, index : p.index + 1, elapsed : 0, playing : true} : p));

    // restart the track if it has played for a few seconds, otherwise go back one
    const prev = () => setPlayer(p => p && (p.elapsed > 3 || p.index === 0 ? {...p, elapsed : 0} : {...p, index : p.index - 1, elapsed : 0, playing : true}));

    const stop = () => setPlayer(null);

    const track = player ? player.tracks[player.index] : null;
    const length = track ? playLength(track) : 0;

    return (
        <PlayerContext.Provider value={{player,play,toggle,next,prev,stop}}>

            <div className={player ? "has-player" : ""}>{children}</div>

            {
                player &&
                <div className="player" role="region" aria-label="Mini player">
                    <div className="p-info">
                        <Equalizer on={player.playing}/>
                        <div>
                            <b>{track.title}</b>
                            <small>{player.album.artist} · {player.album.title}</small>
                        </div>
                    </div>
                    <div className="p-mid">
                        <div className="p-btns">
                            <button type="button" aria-label="Previous track" onClick={prev}>⏮</button>
                            <button type="button" className="p-main" aria-label={player.playing ? "Pause" : "Play"} onClick={toggle}>{player.playing ? "❚❚" : "▶"}</button>
                            <button type="button" aria-label="Next track" disabled={player.index + 1 >= player.tracks.length} onClick={next}>⏭</button>
                        </div>
                        <div className="p-bar">
                            <small>{mmss(player.elapsed)}</small>
                            <div className="track-bar"><div style={{transform : "scaleX(" + Math.min(1,player.elapsed / length) + ")"}}></div></div>
                            <small>{mmss(length)}</small>
                        </div>
                    </div>
                    <button type="button" className="p-close" aria-label="Close player" onClick={stop}>✕</button>
                </div>
            }

        </PlayerContext.Provider>
    )
}


export default PlayerProvider;
