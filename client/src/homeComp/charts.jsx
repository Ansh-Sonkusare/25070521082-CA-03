import useReveal from '../useReveal';
import genreColor from './genre';

// Vertical bars (SVG), one per genre
export const GenreBars = ({genres}) =>{

    const [ref,seen] = useReveal();
    const max = Math.max(1,...genres.map(g => g.count));
    const slot = 64;
    const height = 180;

    return (
        <div ref={ref} className={"chart" + (seen ? " in" : "")}>
            <svg viewBox={"0 -20 " + Math.max(slot * genres.length,slot) + " " + (height + 64)} role="img" aria-label="Albums per genre">
                {
                    genres.map((g,i) =>{
                        const h = Math.max(4,(g.count / max) * height);
                        return (
                            <g key={g.genre} transform={"translate(" + i * slot + ",0)"}>
                                <rect className="bar-rect" x="12" y={height - h} width="40" height={h} rx="5" fill={genreColor(g.genre)} style={{"--d" : i * 80 + "ms"}}/>
                                <text x="32" y={height - h - 6} textAnchor="middle" className="bar-val">{g.count}</text>
                                <text x="32" y={height + 20} textAnchor="middle" className="bar-lab">{g.genre.length > 9 ? g.genre.slice(0,8) + "…" : g.genre}</text>
                            </g>
                        )
                    })
                }
            </svg>
        </div>
    )
}

// Ring split between owned and wishlist, the stroke animates when it scrolls in
export const Donut = ({owned,wishlist}) =>{

    const [ref,seen] = useReveal();
    const total = owned + wishlist;
    const r = 54;
    const c = 2 * Math.PI * r;
    const ownedLen = total ? (owned / total) * c : 0;

    return (
        <div ref={ref} className={"donut" + (seen ? " in" : "")}>
            <svg viewBox="0 0 140 140" role="img" aria-label={owned + " owned, " + wishlist + " on wishlist"}>
                <circle cx="70" cy="70" r={r} fill="none" stroke="var(--teal)" strokeWidth="16" opacity={total ? 1 : 0.2}/>
                <circle className="donut-fill" cx="70" cy="70" r={r} fill="none" stroke="var(--gold)" strokeWidth="16"
                    strokeDasharray={(seen ? ownedLen : 0) + " " + c} transform="rotate(-90 70 70)"/>
                <text x="70" y="68" textAnchor="middle" className="donut-num">{total}</text>
                <text x="70" y="88" textAnchor="middle" className="donut-sub">albums</text>
            </svg>
            <ul className="legend">
                <li><i style={{background : "var(--gold)"}}></i>Owned <b>{owned}</b></li>
                <li><i style={{background : "var(--teal)"}}></i>Wishlist <b>{wishlist}</b></li>
            </ul>
        </div>
    )
}

// Horizontal bar per star rating
export const RatingBars = ({ratings}) =>{

    const [ref,seen] = useReveal();
    const max = Math.max(1,...ratings.map(r => r.count));

    return (
        <div ref={ref} className="rbars">
            {
                [...ratings].reverse().map((r,i) =>
                    <div className="rbar" key={r.rating}>
                        <span>{r.rating} ★</span>
                        <div className="rbar-track"><div className="rbar-fill" style={{width : seen ? (r.count / max) * 100 + "%" : "0%", transitionDelay : i * 90 + "ms"}}></div></div>
                        <b>{r.count}</b>
                    </div>
                )
            }
        </div>
    )
}

// Orders in the last 7 days
export const DayBars = ({days}) =>{

    const [ref,seen] = useReveal();
    const max = Math.max(1,...days.map(d => d.count));
    const slot = 56;
    const height = 120;

    return (
        <div ref={ref} className={"chart" + (seen ? " in" : "")}>
            <svg viewBox={"0 -20 " + slot * days.length + " " + (height + 60)} role="img" aria-label="Orders per day, last 7 days">
                {
                    days.map((d,i) =>{
                        const h = d.count ? Math.max(6,(d.count / max) * height) : 3;
                        return (
                            <g key={d.day} transform={"translate(" + i * slot + ",0)"}>
                                <rect className="bar-rect" x="10" y={height - h} width="36" height={h} rx="5" fill={d.count ? "var(--gold)" : "var(--line)"} style={{"--d" : i * 70 + "ms"}}/>
                                <text x="28" y={height - h - 6} textAnchor="middle" className="bar-val">{d.count}</text>
                                <text x="28" y={height + 20} textAnchor="middle" className="bar-lab">{new Date(d.day + "T00:00:00Z").toLocaleDateString("en-IN",{weekday : "short", timeZone : "UTC"})}</text>
                            </g>
                        )
                    })
                }
            </svg>
        </div>
    )
}
