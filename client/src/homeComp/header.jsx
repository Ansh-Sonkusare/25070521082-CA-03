import { useEffect,useState } from 'react';
import { apiRequest } from '../api';

// Shows live counts from the /stats route
const Header = ({refreshKey}) =>{

    const [stats,setStats] = useState(null);

    useEffect(()=>{

        apiRequest("/stats").then(setStats).catch(() => setStats(null));

    },[refreshKey]);

    return (
        <div className="stats">
            <div className="stat">
                <b>{stats ? stats.total : "-"}</b>
                <span>Albums</span>
            </div>
            <div className="stat">
                <b>{stats ? stats.owned : "-"}</b>
                <span>Owned</span>
            </div>
            <div className="stat teal">
                <b>{stats ? stats.wishlist : "-"}</b>
                <span>Wishlist</span>
            </div>
            <div className="stat gold">
                <b>{stats ? stats.averageRating + " ★" : "-"}</b>
                <span>Avg rating</span>
            </div>
        </div>
    )
}


export default Header;