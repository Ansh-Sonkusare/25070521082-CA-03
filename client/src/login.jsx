import { useState } from 'react';
import { Link,useLocation,useNavigate } from 'react-router-dom';
import { apiRequest,saveLogin } from './api';
import Field from './homeComp/field';
import PasswordInput from './homeComp/passwordInput';
import { useToast } from './uiContext';

const Login = ({setUserName}) =>{

    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [touched,setTouched] = useState({});
    const [error,setError] = useState("");
    const [busy,setBusy] = useState(false);

    const errors = {
        email : /^\S+@\S+\.\S+$/.test(email) ? "" : "Enter a valid email address",
        password : password ? "" : "Password is required"
    };

    const show = (name) => (touched[name] ? errors[name] : "");

    const handleSubmit = async (e) =>{

        e.preventDefault();
        setError("");

        if( errors.email || errors.password ){

            setTouched({email : true, password : true});
            return;
        }

        setBusy(true);

        try {
            const data = await apiRequest("/login",{method : "POST", body : {email,password}});
            saveLogin(data.jwtToken,data.name);
            setUserName(data.name);
            toast("Welcome back, " + data.name);
            navigate(location.state?.from || "/collection");
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    }

    return (
        <div className="auth-cont">
            <h2 className="page-title">Login</h2>
            <div className="alert alert-info">Demo login : <b>admin@music.com</b> / <b>admin123</b></div>
            { error && <div className="alert alert-danger">{error}</div> }
            <form onSubmit={handleSubmit} className="card-form" noValidate>
                <Field label="Email" htmlFor="email" error={show("email")}>
                    <input id="email" className={"form-control" + (show("email") ? " invalid" : "")} type="email" value={email}
                        onChange={e => setEmail(e.target.value)} onBlur={() => setTouched({...touched, email : true})}/>
                </Field>
                <Field label="Password" htmlFor="password" error={show("password")}>
                    <PasswordInput id="password" value={password} invalid={!!show("password")}
                        onChange={e => setPassword(e.target.value)}/>
                </Field>
                <button className="pill pill-gold" disabled={busy}>{busy ? "Signing in..." : "Login"}</button>
            </form>
            <p className="mt-3 muted">No account? <Link to="/register">Register here</Link></p>
        </div>
    )
}


export default Login;
