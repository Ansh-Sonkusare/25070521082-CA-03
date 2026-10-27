import { createContext,useContext } from 'react';

export const emptyCart = {items : [], count : 0, subtotal : 0, gst : 0, total : 0};

export const CartContext = createContext({cart : emptyCart, ready : true});

export const useCart = () => useContext(CartContext);
