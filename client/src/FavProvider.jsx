import { useCallback,useEffect,useMemo,useState } from 'react';
import { apiRequest } from './api';
import { FavContext } from './favContext';
import { useToast } from './uiContext';

// Keeps the logged in user's favorite album ids in one place so every heart stays in sync
const FavProvider = ({userName,children}) =>{

    const [loaded,setLoaded] = useState([]);
    const toast = useToast();

    useEffect(()=>{

        if( !userName ) return;

        let ignore = false;

        apiRequest("/favorites").then(data =>{ if( !ignore ) setLoaded(data.ids); }).catch(() => {});

        return () => { ignore = true; };

    },[userName]);

    const ids = useMemo(() => (userName ? loaded : []),[userName,loaded]);

    const toggle = useCallback(async (album) =>{

        const isFav = ids.includes(album._id);

        // update the heart first, undo if the server refuses
        setLoaded(list => isFav ? list.filter(id => id !== album._id) : [...list,album._id]);

        try {
            await apiRequest("/favorites/" + album._id,{method : isFav ? "DELETE" : "POST"});
            toast(isFav ? "Removed from favorites" : '"' + album.title + '" added to favorites');
        } catch (err) {
            setLoaded(list => isFav ? [...list,album._id] : list.filter(id => id !== album._id));
            toast(err.message,"bad");
        }

    },[ids,toast]);

    return <FavContext.Provider value={{ids,toggle}}>{children}</FavContext.Provider>
}


export default FavProvider;
