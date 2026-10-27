import { createContext,useContext } from 'react';

// ids = array of favorite album ids, toggle(album) flips one
export const FavContext = createContext({ids : [], toggle : () => {}});

export const useFavorites = () => useContext(FavContext);
