import { Link } from 'react-router-dom';
import { useCart } from '../cartContext';
import { formatNames,rupee } from '../money';
import genreColor from './genre';

// The list of cart items with qty - / + and remove. Used by the drawer and the cart page
export const CartLines = ({onNavigate}) =>{

    const {cart,setQty,remove} = useCart();

    return (
        <ul className="clines">
            {
                cart.items.map(item =>
                    <li key={item.albumId + item.format} className="cline">
                        <span className="cthumb" style={{background : genreColor(item.genre)}}>{item.title.charAt(0)}</span>
                        <div className="cinfo">
                            <Link to={"/album/" + item.albumId} onClick={onNavigate}>{item.title}</Link>
                            <small>{item.artist} · {formatNames[item.format]} · {rupee(item.price)}</small>
                            <div className="qty">
                                <button type="button" aria-label="Decrease quantity" onClick={() => setQty(item,item.qty - 1)}>−</button>
                                <span aria-live="polite">{item.qty}</span>
                                <button type="button" aria-label="Increase quantity" disabled={item.qty >= 10} onClick={() => setQty(item,item.qty + 1)}>+</button>
                            </div>
                        </div>
                        <div className="cright">
                            <b>{rupee(item.lineTotal)}</b>
                            <button type="button" className="link-btn" onClick={() => remove(item)}>Remove</button>
                        </div>
                    </li>
                )
            }
        </ul>
    )
}

// Subtotal, GST and total
export const CartTotals = ({cart}) =>
    <dl className="totals">
        <div><dt>Subtotal</dt><dd>{rupee(cart.subtotal)}</dd></div>
        <div><dt>GST (18%)</dt><dd>{rupee(cart.gst)}</dd></div>
        <div className="grand"><dt>Total</dt><dd>{rupee(cart.total)}</dd></div>
    </dl>
