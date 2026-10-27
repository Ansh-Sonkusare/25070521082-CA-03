import { useCallback,useEffect,useState } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import { apiRequest } from './api';
import { CartContext,emptyCart } from './cartContext';
import { useToast } from './uiContext';
import CartDrawer from './homeComp/cartDrawer';

// The cart lives on the server (carts collection). This keeps a copy in React and talks to the /cart routes
const CartProvider = ({userName,children}) =>{

    const [loaded,setLoaded] = useState(null);
    const [drawerOpen,setDrawerOpen] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const reload = useCallback(() =>{

        return apiRequest("/cart").then(setLoaded).catch(() => {});

    },[]);

    useEffect(()=>{

        if( !userName ) return;

        let ignore = false;

        apiRequest("/cart").then(data =>{ if( !ignore ) setLoaded(data); }).catch(() =>{ if( !ignore ) setLoaded(emptyCart); });

        return () => { ignore = true; };

    },[userName]);

    const cart = userName && loaded ? loaded : emptyCart;

    // false until the first /cart answer arrives, so pages do not flash "empty"
    const ready = !userName || loaded !== null;

    // Runs one cart request and keeps the returned cart. Returns true on success
    const run = async (path,options,message) =>{

        try {
            setLoaded(await apiRequest(path,options));
            if( message ) toast(message);
            return true;
        } catch (err) {
            toast(err.message,"bad");
            return false;
        }
    }

    const add = async (album,format) =>{

        if( !userName ){

            toast("Login to use the cart","bad");
            navigate("/login",{state : {from : location.pathname}});
            return false;
        }

        return run("/cart",{method : "POST", body : {albumId : album._id, format}},'"' + album.title + '" added to cart');
    }

    const setQty = (item,qty) => run("/cart",{method : "PATCH", body : {albumId : item.albumId, format : item.format, qty}});

    const remove = (item) => run("/cart/" + item.albumId + "/" + item.format,{method : "DELETE"},"Removed from cart");

    return (
        <CartContext.Provider value={{cart,ready,add,setQty,remove,reload,drawerOpen,setDrawerOpen}}>
            {children}
            <CartDrawer/>
        </CartContext.Provider>
    )
}


export default CartProvider;
