import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from './api';
import Reveal from './Reveal';
import CountUp from './CountUp';
import useReveal from './useReveal';
import Vinyl from './homeComp/vinyl';
import genreColor from './homeComp/genre';

const features = [
    {icon : "▦", title : "Your whole collection", text : "Search, filter, sort and scroll through every album, as a grid or a list."},
    {icon : "★", title : "Rate with a click", text : "Tap the stars on any album to rate it from 1 to 5. Saved instantly."},
    {icon : "♥", title : "Favorites", text : "Heart the records you love and find them again on your account page."},
    {icon : "☰", title : "Playlists", text : "Build your own playlists and add any album from its details page."},
    {icon : "◔", title : "Live dashboard", text : "Charts for genres, owned vs wishlist and your rating spread."},
    {icon : "↯", title : "Activity feed", text : "See who added, edited or rated what, straight from the database."}
];

const headline = ["Every","record","you","love,","spinning","in","one","place."];

// Small album tile used in the horizontal scroll strips
const Tile = ({album}) =>
    <Link to={"/album/" + album._id} className="tile" style={{"--genre" : genreColor(album.genre), "--label" : album.status === "wishlist" ? "#58CDB9" : "#F0B600"}}>
        <div className="sleeve">
            <div className="disc"></div>
            <div className="cover">
                <span className="mono" aria-hidden="true">{album.title.charAt(0)}</span>
                <span className="tag">{album.genre}</span>
            </div>
        </div>
        <b>{album.title}</b>
        <span>{album.artist} · {album.rating} ★</span>
    </Link>

const Strip = ({title,albums}) =>
    <Reveal as="section" className="strip-sec">
        <h2>{title}</h2>
        <div className="strip" tabIndex={0} aria-label={title}>
            { albums.map(a => <Tile key={a._id} album={a}/>) }
        </div>
    </Reveal>

const Landing = () =>{

    const [stats,setStats] = useState(null);
    const [recent,setRecent] = useState([]);
    const [top,setTop] = useState([]);
    const [statsRef,statsSeen] = useReveal(0.4);

    useEffect(()=>{

        let ignore = false;

        apiRequest("/stats").then(d =>{ if( !ignore ) setStats(d); }).catch(() => {});
        apiRequest("/getall?sort=newest&limit=10").then(d =>{ if( !ignore ) setRecent(d.items); }).catch(() => {});
        apiRequest("/getall?sort=rating&limit=10").then(d =>{ if( !ignore ) setTop(d.items); }).catch(() => {});

        return () =>{ ignore = true; };

    },[]);

    return (
        <div className="landing">

            <section className="hero">
                <div className="hero-text">
                    <p className="eyebrow rise" style={{"--d" : "0ms"}}>React · Express · MongoDB</p>
                    <h1>
                        { headline.map((w,i) => <span key={i} className="word" style={{"--d" : 120 + i * 90 + "ms"}}>{w}</span>) }
                    </h1>
                    <p className="lead rise" style={{"--d" : "900ms"}}>Catalogue what you own, plan what you want, rate it, playlist it. A full-stack record shelf with a live dashboard.</p>
                    <div className="cta rise" style={{"--d" : "1050ms"}}>
                        <Link to="/collection" className="pill pill-gold">Browse the collection</Link>
                        <Link to="/dashboard" className="pill">See the dashboard</Link>
                    </div>
                </div>
                <Vinyl/>
                <a href="#stats" className="scroll-hint" aria-label="Scroll down">Scroll ↓</a>
            </section>

            <section id="stats" ref={statsRef} className="stat-strip">
                {
                    [["Albums",stats && stats.total,0],["Owned",stats && stats.owned,0],["Wishlist",stats && stats.wishlist,0],["Avg rating",stats && stats.averageRating,1]].map(([label,value,dec],i) =>
                        <div key={label} className={"big-stat" + (statsSeen ? " in" : "")} style={{"--d" : i * 100 + "ms"}}>
                            <b>{stats ? <CountUp value={value} start={statsSeen} decimals={dec}/> : "-"}</b>
                            <span>{label}</span>
                        </div>
                    )
                }
            </section>

            <Reveal as="section" className="features-sec">
                <h2>Everything a record shelf needs</h2>
                <div className="features">
                    { features.map((f,i) =>
                        <Reveal key={f.title} className="feature" delay={i * 90}>
                            <span className="f-icon" aria-hidden="true">{f.icon}</span>
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </Reveal>
                    )}
                </div>
            </Reveal>

            { recent.length > 0 && <Strip title="Recently added" albums={recent}/> }
            { top.length > 0 && <Strip title="Top rated" albums={top}/> }

            <Reveal as="section" className="final-cta">
                <h2>Start your shelf</h2>
                <p className="muted">Log in with the demo account or register your own.</p>
                <Link to="/login" className="pill pill-gold">Get started</Link>
            </Reveal>

        </div>
    )
}


export default Landing;
