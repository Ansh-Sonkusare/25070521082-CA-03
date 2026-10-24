import { NavLink,useNavigate } from 'react-router-dom';
import { clearLogin } from './api';
import './App.css';

const Nav = ({userName,setUserName}) =>{

    const navigate = useNavigate();

    const logout = () =>{

        clearLogin();
        setUserName(null);
        navigate("/");
    }

    return (

        <header className='my-nav'>
            <nav className='nav-in'>
                <NavLink to = "/" className='brand'>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10.5" stroke="#F2EAD7" strokeWidth="1.2"/>
                        <circle cx="12" cy="12" r="7" stroke="#2E3038" strokeWidth="1"/>
                        <circle cx="12" cy="12" r="3.2" fill="#F0B600"/>
                        <circle cx="12" cy="12" r="0.9" fill="#15161A"/>
                    </svg>
                    <span>Music Album Collection</span>
                </NavLink>
                <div className='links'>
                    <NavLink to = "/" end>Albums</NavLink>
                    <NavLink to = "/add">Add Album</NavLink>
                    <NavLink to = "/about">About</NavLink>
                    {
                        userName ?
                        <>
                            <span className='hi'>Hi, {userName}</span>
                            <button className='pill' onClick={logout}>Logout</button>
                        </>
                        :
                        <NavLink to = "/login">Login</NavLink>
                    }
                </div>
            </nav>
        </header>
    )
}


export default Nav;
