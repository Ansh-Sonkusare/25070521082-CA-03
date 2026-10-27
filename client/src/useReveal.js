import { useEffect,useRef,useState } from 'react';

// Returns [ref, seen]. seen turns true (once) when the element scrolls into view
const useReveal = (threshold = 0.15) =>{

    const ref = useRef(null);
    const [seen,setSeen] = useState(false);

    useEffect(()=>{

        const node = ref.current;

        if( !node || typeof IntersectionObserver === "undefined" ){

            const timer = setTimeout(() => setSeen(true),0);
            return () => clearTimeout(timer);
        }

        const observer = new IntersectionObserver(([entry])=>{

            if( entry.isIntersecting ){
                setSeen(true);
                observer.disconnect();
            }

        },{threshold : threshold});

        observer.observe(node);

        return () => observer.disconnect();

    },[threshold]);

    return [ref,seen];
}


export default useReveal;
