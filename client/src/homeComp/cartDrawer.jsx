import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../cartContext';
import { CartLines,CartTotals } from './cartLines';

// Cart panel that slides in from the right
const CartDrawer = () =>{

    const {cart,drawerOpen,setDrawerOpen} = useCart();

    useEffect(()=>{

        if( !drawerOpen ) return;

        const onKey = (e) =>{ if( e.key === "Escape" ) setDrawerOpen(false); };
        window.addEventListener("keydown",onKey);

        return () => window.removeEventListener("keydown",onKey);

    },[drawerOpen,setDrawerOpen]);

    const close = () => setDrawerOpen(false);

    return (
        <>
            <div className={"drawer-back" + (drawerOpen ? " open" : "")} onClick={close}></div>
            <aside className={"drawer" + (drawerOpen ? " open" : "")} aria-label="Shopping cart" aria-hidden={!drawerOpen} inert={!drawerOpen}>
                <div className="drawer-head">
                    <h3>Your cart <span className="muted">({cart.count})</span></h3>
                    <button type="button" className="pill" onClick={close} aria-label="Close cart">✕</button>
                </div>
                {
                    cart.items.length === 0 ?
                    <div className="drawer-empty">
                        <p className="muted">Your cart is empty.</p>
                        <Link to="/store" className="pill pill-gold" onClick={close}>Browse the store</Link>
                    </div>
                    :
                    <>
                        <div className="drawer-body"><CartLines onNavigate={close}/></div>
                        <div className="drawer-foot">
                            <CartTotals cart={cart}/>
                            <div className="drawer-acts">
                                <Link to="/cart" className="pill" onClick={close}>View cart</Link>
                                <Link to="/checkout" className="pill pill-gold" onClick={close}>Checkout</Link>
                            </div>
                        </div>
                    </>
                }
            </aside>
        </>
    )
}


export default CartDrawer;
