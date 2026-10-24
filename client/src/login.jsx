import { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { apiRequest,saveLogin } from './api';

const Login = ({setUserName}) =>{

    const navigate = useNavigate();
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [error,setError] = useState("");

    const handleSubmit = async (e) =>{

        e.preventDefault();
        setError("");

        try {
            const data = await apiRequest("/login",{method : "POST", body : {email,password}});
            saveLogin(data.jwtToken,data.name);
            setUserName(data.name);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="auth-cont">
            <h2 className="page-title">Login</h2>
            <div className="alert alert-info">Demo login : <b>admin@music.com</b> / <b>admin123</b></div>
            { error && <div className="alert alert-danger">{error}</div> }
            <form onSubmit={handleSubmit} className="card-form">
                <div className="form-group">
                    <label>Email</label>
                    <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required/>
                </div>
                <button className="pill pill-gold">Login</button>
            </form>
            <p className="mt-3 muted">No account? <Link to="/register">Register here</Link></p>
        </div>
    )
}


export default Login;
