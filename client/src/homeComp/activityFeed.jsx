const verbs = {created : "added", updated : "edited", status : "moved", rating : "re-rated", deleted : "deleted", favorite : "favorited", playlist : "playlisted", tracks : "edited the tracklist of", order : "placed an order"};

// "5 min ago" style time
const timeAgo = (date) =>{

    const seconds = Math.max(0,(Date.now() - new Date(date).getTime()) / 1000);

    if( seconds < 60 ) return "just now";
    if( seconds < 3600 ) return Math.floor(seconds / 60) + " min ago";
    if( seconds < 86400 ) return Math.floor(seconds / 3600) + " h ago";

    return Math.floor(seconds / 86400) + " d ago";
}

// List of events from the /activity routes
const ActivityFeed = ({items,showUser = true}) =>{

    if( items.length === 0 ) return <p className="empty small">No activity yet.</p>

    return (
        <ul className="feed">
            {
                items.map((item,i) =>
                    <li key={item._id} style={{"--d" : i * 50 + "ms"}}>
                        <span className={"dot " + item.action}></span>
                        <div>
                            <p>
                                {showUser && <b>{item.user} </b>}
                                {verbs[item.action]}{" "}
                                {item.albumTitle && <i>{item.albumTitle}</i>}
                                {item.detail && <span className="muted">{item.albumTitle ? " · " : ""}{item.detail}</span>}
                            </p>
                            <small>{timeAgo(item.at)}</small>
                        </div>
                    </li>
                )
            }
        </ul>
    )
}


export default ActivityFeed;
