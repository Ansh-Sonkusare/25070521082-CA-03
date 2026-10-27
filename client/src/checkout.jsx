import { useState } from 'react';
import { Link,Navigate } from 'react-router-dom';
import { apiRequest,getToken } from './api';
import { useCart } from './cartContext';
import { useToast } from './uiContext';
import { orderNo,rupee,formatNames } from './money';
import Field from './homeComp/field';
import CardPreview from './homeComp/cardPreview';
import { CartTotals } from './homeComp/cartLines';
import Vinyl from './homeComp/vinyl';

// Same checksum the server uses
const luhn = (number) =>{

    let sum = 0;

    for( let i = 0; i < number.length; i++ ){

        let d = Number(number[number.length - 1 - i]);

        if( i % 2 === 1 ){ d *= 2; if( d > 9 ) d -= 9; }

        sum += d;
    }

    return sum % 10 === 0;
}

const brandOf = (digits) => /^4/.test(digits) ? "VISA" : /^(5[1-5]|2[2-7])/.test(digits) ? "MASTERCARD" : /^3[47]/.test(digits) ? "AMEX" : "CARD";

const wait = (ms) => new Promise(resolve => setTimeout(resolve,ms));

const Checkout = () =>{

    const {cart,ready,reload} = useCart();
    const toast = useToast();
    const [ship,setShip] = useState({name : "", phone : "", address : "", city : "", pin : ""});
    const [card,setCard] = useState({number : "", name : "", expiry : "", cvv : ""});
    const [touched,setTouched] = useState({});
    const [flipped,setFlipped] = useState(false);
    const [phase,setPhase] = useState("form");
    const [order,setOrder] = useState(null);

    if( !getToken() ) return <Navigate to="/login" replace/>

    const digits = card.number.replace(/\s/g,"");
    const [mm,yy] = card.expiry.split("/");
    const expiryEnd = new Date(2000 + Number(yy),Number(mm),1);

    const errors = {
        sname : ship.name.trim() ? "" : "Name is required",
        phone : /^\d{10}$/.test(ship.phone) ? "" : "Enter a 10 digit phone number",
        address : ship.address.trim().length >= 5 ? "" : "Enter your address",
        city : ship.city.trim() ? "" : "City is required",
        pin : /^\d{6}$/.test(ship.pin) ? "" : "PIN code must be 6 digits",
        number : /^\d{13,19}$/.test(digits) && luhn(digits) ? "" : "Card number is not valid",
        cname : card.name.trim() ? "" : "Name on card is required",
        expiry : !/^\d{2}\/\d{2}$/.test(card.expiry) || Number(mm) < 1 || Number(mm) > 12 ? "Use MM/YY" : expiryEnd <= new Date() ? "Card has expired" : "",
        cvv : /^\d{3,4}$/.test(card.cvv) ? "" : "CVV is 3 or 4 digits"
    };

    const show = (key) => (touched[key] ? errors[key] : "");
    const touch = (key) => () => setTouched(t => ({...t, [key] : true}));
    const cls = (key) => "form-control" + (show(key) ? " invalid" : "");

    const setShipField = (e) => setShip({...ship, [e.target.name] : e.target.value});

    const setNumber = (e) =>{

        const d = e.target.value.replace(/\D/g,"").slice(0,19);
        setCard({...card, number : d.replace(/(.{4})(?=.)/g,"$1 ")});
    }

    const setExpiry = (e) =>{

        const d = e.target.value.replace(/\D/g,"").slice(0,4);
        setCard({...card, expiry : d.length > 2 ? d.slice(0,2) + "/" + d.slice(2) : d});
    }

    const pay = async (e) =>{

        e.preventDefault();

        if( Object.values(errors).some(Boolean) ){

            setTouched(Object.fromEntries(Object.keys(errors).map(k => [k,true])));
            toast("Please fix the highlighted fields","bad");
            return;
        }

        setPhase("processing");

        try {
            // show the processing animation for at least 2 seconds, even if the server is fast
            const [created] = await Promise.all([
                apiRequest("/orders",{method : "POST", body : {shipping : {name : ship.name, phone : ship.phone, address : ship.address, city : ship.city, pin : ship.pin}, card}}),
                wait(2000)
            ]);

            setOrder(created);
            setPhase("done");
            reload();
            toast("Payment successful");

        } catch (err) {
            await wait(600);
            setPhase("form");
            toast(err.message,"bad");
        }
    }

    if( phase === "done" ) return (
        <div className="success">
            <svg className="check" viewBox="0 0 52 52" aria-hidden="true">
                <circle className="check-ring" cx="26" cy="26" r="24" fill="none"/>
                <path className="check-tick" fill="none" d="M14 27l8 8 16-17"/>
            </svg>
            <h2 className="page-title">Payment successful</h2>
            <p className="muted">Order <b>{orderNo(order)}</b> · Transaction {order.payment.txnId} · {order.payment.brand} ending {order.payment.last4}</p>
            <div className="panel receipt">
                <ul className="plain">
                    { order.items.map(i => <li key={i.albumId + i.format}>{i.qty} × {i.title} <span className="muted">({formatNames[i.format]})</span> <b>{rupee(i.lineTotal)}</b></li>) }
                </ul>
                <CartTotals cart={order}/>
                <p className="muted">Shipping to {order.shipping.name}, {order.shipping.address}, {order.shipping.city} {order.shipping.pin}</p>
            </div>
            <div className="cta">
                <Link to="/orders" className="pill pill-gold">View my orders</Link>
                <Link to="/store" className="pill">Keep shopping</Link>
            </div>
        </div>
    )

    if( !ready ) return <p className="empty">Loading your cart...</p>

    if( cart.items.length === 0 ) return (
        <div className="empty">
            <p>Your cart is empty, so there is nothing to pay for.</p>
            <Link to="/store" className="pill pill-gold">Browse the store</Link>
        </div>
    )

    return (
        <>
            <h2 className="page-title">Checkout</h2>

            <div className="alert alert-info hint">
                Test mode, no real money. Use card <b>4242 4242 4242 4242</b>, any future expiry and any CVV. Card <b>4000 0000 0000 0002</b> is always declined.
            </div>

            <form className="checkout" onSubmit={pay} noValidate>
                <div className="co-forms">

                    <fieldset className="card-form">
                        <legend>Shipping</legend>
                        <Field label="Full name" htmlFor="s-name" error={show("sname")}>
                            <input id="s-name" className={cls("sname")} name="name" value={ship.name} onChange={setShipField} onBlur={touch("sname")} autoComplete="name"/>
                        </Field>
                        <div className="form-row">
                            <Field label="Phone" htmlFor="s-phone" error={show("phone")} className="col">
                                <input id="s-phone" className={cls("phone")} name="phone" inputMode="numeric" maxLength={10} value={ship.phone} onChange={setShipField} onBlur={touch("phone")} autoComplete="tel"/>
                            </Field>
                            <Field label="PIN code" htmlFor="s-pin" error={show("pin")} className="col">
                                <input id="s-pin" className={cls("pin")} name="pin" inputMode="numeric" maxLength={6} value={ship.pin} onChange={setShipField} onBlur={touch("pin")} autoComplete="postal-code"/>
                            </Field>
                        </div>
                        <Field label="Address" htmlFor="s-addr" error={show("address")}>
                            <input id="s-addr" className={cls("address")} name="address" value={ship.address} onChange={setShipField} onBlur={touch("address")} autoComplete="street-address"/>
                        </Field>
                        <Field label="City" htmlFor="s-city" error={show("city")}>
                            <input id="s-city" className={cls("city")} name="city" value={ship.city} onChange={setShipField} onBlur={touch("city")} autoComplete="address-level2"/>
                        </Field>
                    </fieldset>

                    <fieldset className="card-form">
                        <legend>Payment</legend>
                        <CardPreview number={card.number} name={card.name.toUpperCase()} expiry={card.expiry} cvv={card.cvv} brand={brandOf(digits)} flipped={flipped}/>
                        <Field label="Card number" htmlFor="c-num" error={show("number")}>
                            <input id="c-num" className={cls("number")} inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.number} onChange={setNumber} onBlur={touch("number")} autoComplete="cc-number"/>
                        </Field>
                        <Field label="Name on card" htmlFor="c-name" error={show("cname")}>
                            <input id="c-name" className={cls("cname")} value={card.name} onChange={e => setCard({...card, name : e.target.value})} onBlur={touch("cname")} autoComplete="cc-name"/>
                        </Field>
                        <div className="form-row">
                            <Field label="Expiry" htmlFor="c-exp" error={show("expiry")} className="col">
                                <input id="c-exp" className={cls("expiry")} inputMode="numeric" placeholder="MM/YY" value={card.expiry} onChange={setExpiry} onBlur={touch("expiry")} autoComplete="cc-exp"/>
                            </Field>
                            <Field label="CVV" htmlFor="c-cvv" error={show("cvv")} className="col">
                                <input id="c-cvv" className={cls("cvv")} inputMode="numeric" maxLength={4} placeholder="123" value={card.cvv}
                                    onChange={e => setCard({...card, cvv : e.target.value.replace(/\D/g,"")})}
                                    onFocus={() => setFlipped(true)} onBlur={() => { setFlipped(false); touch("cvv")(); }} autoComplete="cc-csc"/>
                            </Field>
                        </div>
                    </fieldset>

                </div>

                <aside className="panel summary">
                    <h3>Order summary</h3>
                    <ul className="plain">
                        { cart.items.map(i => <li key={i.albumId + i.format}>{i.qty} × {i.title} <span className="muted">({formatNames[i.format]})</span></li>) }
                    </ul>
                    <CartTotals cart={cart}/>
                    <button className="pill pill-gold">Pay {rupee(cart.total)}</button>
                </aside>
            </form>

            {
                phase === "processing" &&
                <div className="processing" role="status" aria-live="polite">
                    <div className="proc-box">
                        <Vinyl/>
                        <h3>Processing payment<span className="dots"><i>.</i><i>.</i><i>.</i></span></h3>
                        <p className="muted">Please do not close this page.</p>
                    </div>
                </div>
            }
        </>
    )
}


export default Checkout;
