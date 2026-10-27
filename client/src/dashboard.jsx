import { useEffect,useState } from 'react';
import { apiRequest } from './api';
import Reveal from './Reveal';
import CountUp from './CountUp';
import useReveal from './useReveal';
import ActivityFeed from './homeComp/activityFeed';
import { GenreBars,Donut,RatingBars,DayBars } from './homeComp/charts';

const Dashboard = () =>{

    const [stats,setStats] = useState(null);
    const [feed,setFeed] = useState([]);
    const [error,setError] = useState("");
    const [ref,seen] = useReveal(0.3);

    useEffect(()=>{

        let ignore = false;

        apiRequest("/stats").then(d =>{ if( !ignore ) setStats(d); }).catch(err =>{ if( !ignore ) setError(err.message); });
        apiRequest("/activity?limit=10").then(d =>{ if( !ignore ) setFeed(d.items); }).catch(() => {});

        return () =>{ ignore = true; };

    },[]);

    if( error ) return <p className="note bad">Could not load stats : {error}</p>

    return (
        <>
            <h2 className="page-title">Dashboard</h2>

            <div ref={ref} className="cards">
                {
                    [["Albums",stats && stats.total,0,""],["Owned",stats && stats.owned,0,"gold"],["Wishlist",stats && stats.wishlist,0,"teal"],["Avg rating",stats && stats.averageRating,1,"gold"],["Revenue (₹)",stats && stats.revenue,0,"teal"],["Orders",stats && stats.orderCount,0,""]].map(([label,value,dec,tone],i) =>
                        <div key={label} className={"dcard " + tone + (seen ? " in" : "")} style={{"--d" : i * 90 + "ms"}}>
                            <span>{label}</span>
                            <b>{stats ? <CountUp value={value} start={seen} decimals={dec}/> : "-"}</b>
                        </div>
                    )
                }
            </div>

            {
                !stats ? <p className="empty">Loading charts...</p> :
                <div className="panels">
                    <Reveal className="panel wide">
                        <h3>Albums per genre</h3>
                        <GenreBars genres={stats.genres}/>
                    </Reveal>
                    <Reveal className="panel" delay={100}>
                        <h3>Owned vs wishlist</h3>
                        <Donut owned={stats.owned} wishlist={stats.wishlist}/>
                    </Reveal>
                    <Reveal className="panel" delay={200}>
                        <h3>Rating distribution</h3>
                        <RatingBars ratings={stats.ratings}/>
                    </Reveal>
                    <Reveal className="panel wide" delay={100}>
                        <h3>Orders per day <span className="muted">(last 7 days)</span></h3>
                        <DayBars days={stats.ordersPerDay}/>
                    </Reveal>
                    <Reveal className="panel wide" delay={100}>
                        <h3>Recent activity</h3>
                        <ActivityFeed items={feed}/>
                    </Reveal>
                </div>
            }
        </>
    )
}


export default Dashboard;
