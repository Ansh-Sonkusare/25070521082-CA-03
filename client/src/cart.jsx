import { Link,Navigate } from 'react-router-dom';
import { getToken } from './api';
import { useCart } from './cartContext';
import { CartLines,CartTotals } from './homeComp/cartLines';

const Cart = () =>{

    const {cart,ready} = useCart();

    if( !getToken() ) return <Navigate to="/login" replace/>

    return (
        <>
            <h2 className="page-title">Your cart</h2>
            {
                !ready ? <p className="empty">Loading your cart...</p> :
                cart.items.length === 0 ?
                <div className="empty">
                    <p>Your cart is empty.</p>
                    <Link to="/store" className="pill pill-gold">Browse the store</Link>
                </div>
                :
                <div className="cart-page">
                    <div className="panel"><CartLines/></div>
                    <aside className="panel summary">
                        <h3>Summary</h3>
                        <CartTotals cart={cart}/>
                        <Link to="/checkout" className="pill pill-gold">Proceed to checkout</Link>
                    </aside>
                </div>
            }
        </>
    )
}


export default Cart;
