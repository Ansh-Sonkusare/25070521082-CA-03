import { useEffect,useState } from 'react';

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Counts from 0 to target once start is true. Returns the current number
const useCountUp = (target,start,duration = 1200) =>{

    const [value,setValue] = useState(0);

    useEffect(()=>{

        if( !start ) return;

        if( reduced() ){

            const timer = setTimeout(() => setValue(target),0);
            return () => clearTimeout(timer);
        }

        let frame;
        const begin = performance.now();

        const tick = (now) =>{

            const progress = Math.min(1,(now - begin) / duration);
            setValue(target * (1 - Math.pow(1 - progress,3)));

            if( progress < 1 ) frame = requestAnimationFrame(tick);
        }

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);

    },[target,start,duration]);

    return value;
}


export default useCountUp;
