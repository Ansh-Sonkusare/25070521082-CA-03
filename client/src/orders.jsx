import { useEffect,useState } from 'react';
import { Link,Navigate } from 'react-router-dom';
import { apiRequest,getToken } from './api';
import { formatNames,orderNo,rupee } from './money';
import { CartTotals } from './homeComp/cartLines';

const Orders = () =>{

    const [orders,setOrders] = useState(null);
    const [open,setOpen] = useState("");
    const [error,setError] = useState("");

    useEffect(()=>{

        if( !getToken() ) return;

        let ignore = false;

        apiRequest("/orders").then(d =>{ if( !ignore ) setOrders(d.items); }).catch(err =>{ if( !ignore ) setError(err.message); });

        return () =>{ ignore = true; };

    },[]);

    if( !getToken() ) return <Navigate to="/login" replace/>

    return (
        <>
            <h2 className="page-title">My orders</h2>
            { error && <p className="note bad">{error}</p> }
            {
                !orders ? (error ? null : <p className="empty">Loading orders...</p>) :
                orders.length === 0 ?
                <div className="empty"><p>No orders yet.</p><Link to="/store" className="pill pill-gold">Browse the store</Link></div> :
                <div className="orders">
                    {
                        orders.map((o,i) =>
                            <article key={o._id} className={"order enter" + (open === o._id ? " open" : "")} style={{"--i" : i}}>
                                <button type="button" className="order-head" aria-expanded={open === o._id} onClick={() => setOpen(open === o._id ? "" : o._id)}>
                                    <b>{orderNo(o)}</b>
                                    <span className="muted">{new Date(o.createdAt).toLocaleDateString("en-IN",{day : "numeric", month : "short", year : "numeric"})}</span>
                                    <span className="chip paid">{o.status}</span>
                                    <b className="o-total">{rupee(o.total)}</b>
                                    <span className="chev" aria-hidden="true">⌄</span>
                                </button>
                                <div className="order-body"><div>
                                    <ul className="plain">
                                        { o.items.map(it => <li key={it.albumId + it.format}>{it.qty} × <Link to={"/album/" + it.albumId}>{it.title}</Link> <span className="muted">({formatNames[it.format]}) · {rupee(it.lineTotal)}</span></li>) }
                                    </ul>
                                    <CartTotals cart={o}/>
                                    <p className="muted">Ship to {o.shipping.name}, {o.shipping.address}, {o.shipping.city} {o.shipping.pin} · {o.payment.brand} ending {o.payment.last4} · {o.payment.txnId}</p>
                                </div></div>
                            </article>
                        )
                    }
                </div>
            }
        </>
    )
}


export default Orders;
