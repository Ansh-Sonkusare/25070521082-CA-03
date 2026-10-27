import { useEffect,useState } from 'react';

// Current scroll position (px) and progress through the page (0 to 1)
const useScroll = () =>{

    const [state,setState] = useState({y : 0, progress : 0});

    useEffect(()=>{

        const onScroll = () =>{

            const max = document.documentElement.scrollHeight - window.innerHeight;
            setState({y : window.scrollY, progress : max > 0 ? Math.min(1,window.scrollY / max) : 0});
        }

        window.addEventListener("scroll",onScroll,{passive : true});
        window.addEventListener("resize",onScroll);

        return () =>{
            window.removeEventListener("scroll",onScroll);
            window.removeEventListener("resize",onScroll);
        }

    },[]);

    return state;
}


export default useScroll;
