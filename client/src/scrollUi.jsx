import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useScroll from './useScroll';

// Top progress bar, back-to-top button, and jump to top on every route change
const ScrollUi = () =>{

    const {pathname} = useLocation();
    const {y,progress} = useScroll();

    useEffect(()=>{

        window.scrollTo({top : 0, behavior : "instant"});

    },[pathname]);

    return (
        <>
            <div className="progress" aria-hidden="true"><div style={{transform : "scaleX(" + progress + ")"}}></div></div>
            <button type="button" className={"to-top" + (y > 500 ? " show" : "")} aria-label="Back to top" tabIndex={y > 500 ? 0 : -1}
                onClick={() => window.scrollTo({top : 0, behavior : "smooth"})}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>
            </button>
        </>
    )
}


export default ScrollUi;
