import { useEffect,useRef,useState } from 'react';
import { NavLink,useLocation,useNavigate } from 'react-router-dom';
import { clearLogin } from './api';
import useScroll from './useScroll';
import { useCart } from './cartContext';
import { useToast } from './uiContext';
import './App.css';

const primary = [
    {to : "/collection", label : "Collection"},
    {to : "/store", label : "Store"},
    {to : "/dashboard", label : "Dashboard"},
    {to : "/about", label : "About"}
];

const account = [
    {to : "/account", label : "My account"},
    {to : "/playlists", label : "Playlists"},
    {to : "/orders", label : "Orders"},
    {to : "/add", label : "Add album"}
];

const Nav = ({userName,setUserName}) =>{

    const navigate = useNavigate();
    const {pathname} = useLocation();
    const {y} = useScroll();
    const toast = useToast();
    const {cart,setDrawerOpen} = useCart();
    const [panelAt,setPanelAt] = useState(null);
    const [menuAt,setMenuAt] = useState(null);
    const menuRef = useRef(null);

    // Menus are open only on the page where they were opened, so a route change closes them
    const panelOpen = panelAt === pathname;
    const menuOpen = menuAt === pathname;

    // Escape closes either menu, a click outside closes the dropdown, the page behind the mobile panel does not scroll
    useEffect(()=>{

        if( !panelOpen && !menuOpen ) return;

        const onKey = (e) =>{ if( e.key === "Escape" ){ setPanelAt(null); setMenuAt(null); } };
        const onDown = (e) =>{ if( menuRef.current && !menuRef.current.contains(e.target) ) setMenuAt(null); };

        window.addEventListener("keydown",onKey);
        document.addEventListener("mousedown",onDown);

        return () =>{
            window.removeEventListener("keydown",onKey);
            document.removeEventListener("mousedown",onDown);
        }

    },[panelOpen,menuOpen]);

    useEffect(()=>{

        if( !panelOpen ) return;

        const old = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () =>{ document.body.style.overflow = old; };

    },[panelOpen]);

    const logout = () =>{

        clearLogin();
        setUserName(null);
        toast("Logged out");
        navigate("/");
    }

    return (

        <header className={"my-nav" + (y > 24 ? " scrolled" : "")}>
            <nav className='nav-in' aria-label="Main">

                <NavLink to = "/" className='brand' aria-label="Music Album Collection, home">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10.5" stroke="#F2EAD7" strokeWidth="1.2"/>
                        <circle cx="12" cy="12" r="7" stroke="#2E3038" strokeWidth="1"/>
                        <circle cx="12" cy="12" r="3.2" fill="#F0B600"/>
                        <circle cx="12" cy="12" r="0.9" fill="#15161A"/>
                    </svg>
                    <span>Music Album Collection</span>
                </NavLink>

                <div className='links'>
                    { primary.map(l => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>) }
                </div>

                <div className="nav-right">

                    {
                        userName &&
                        <button type="button" className="cart-btn" aria-label={"Open cart, " + cart.count + " items"} onClick={() => setDrawerOpen(true)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2"/>
                                <circle cx="9" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/>
                            </svg>
                            { cart.count > 0 && <span key={cart.count} className="badge">{cart.count}</span> }
                        </button>
                    }

                    {
                        userName ?
                        <div className="user-menu" ref={menuRef}>
                            <button type="button" className={"user-btn" + (menuOpen ? " open" : "")} aria-haspopup="menu" aria-expanded={menuOpen}
                                onClick={() => setMenuAt(menuOpen ? null : pathname)}>
                                <span className="avatar" aria-hidden="true">{userName.charAt(0).toUpperCase()}</span>
                                <span className="user-name">{userName}</span>
                                <svg className="caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                            </button>
                            <div className={"dropdown" + (menuOpen ? " open" : "")} role="menu">
                                { account.map(l => <NavLink key={l.to} to={l.to} role="menuitem" tabIndex={menuOpen ? 0 : -1}>{l.label}</NavLink>) }
                                <hr/>
                                <button type="button" role="menuitem" tabIndex={menuOpen ? 0 : -1} onClick={logout}>Log out</button>
                            </div>
                        </div>
                        :
                        <div className="auth-links">
                            <NavLink to="/login" className="login-link">Log in</NavLink>
                            <NavLink to="/register" className="pill pill-gold sm">Sign up</NavLink>
                        </div>
                    }

                    <button type="button" className={"burger" + (panelOpen ? " open" : "")} aria-label={panelOpen ? "Close menu" : "Open menu"} aria-expanded={panelOpen}
                        onClick={() => setPanelAt(panelOpen ? null : pathname)}>
                        <span></span><span></span><span></span>
                    </button>

                </div>
            </nav>

            <div className={"m-back" + (panelOpen ? " open" : "")} onClick={() => setPanelAt(null)}></div>
            <aside className={"m-panel" + (panelOpen ? " open" : "")} aria-label="Menu" aria-hidden={!panelOpen} inert={!panelOpen}>
                <p className="m-label">Browse</p>
                { primary.map(l => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>) }
                {
                    userName ?
                    <>
                        <p className="m-label">Signed in as {userName}</p>
                        { account.map(l => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>) }
                        <button type="button" className="pill m-logout" onClick={logout}>Log out</button>
                    </>
                    :
                    <div className="m-auth">
                        <NavLink to="/login" className="pill">Log in</NavLink>
                        <NavLink to="/register" className="pill pill-gold">Sign up</NavLink>
                    </div>
                }
            </aside>
        </header>
    )
}


export default Nav;
