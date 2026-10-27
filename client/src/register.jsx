import { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { apiRequest } from './api';
import Field from './homeComp/field';
import PasswordInput from './homeComp/passwordInput';
import { useToast } from './uiContext';

const Register = () =>{

    const navigate = useNavigate();
    const toast = useToast();
    const [form,setForm] = useState({name : "", email : "", password : ""});
    const [touched,setTouched] = useState({});
    const [error,setError] = useState("");
    const [busy,setBusy] = useState(false);

    const errors = {
        name : form.name.trim() ? "" : "Name is required",
        email : /^\S+@\S+\.\S+$/.test(form.email) ? "" : "Enter a valid email address",
        password : form.password.length >= 6 ? "" : "Use at least 6 characters"
    };

    const show = (name) => (touched[name] ? errors[name] : "");

    const handleChange = (e) =>{

        setForm({...form,[e.target.name] : e.target.value});
    }

    const blur = (e) => setTouched({...touched,[e.target.name] : true});

    const handleSubmit = async (e) =>{

        e.preventDefault();
        setError("");

        if( errors.name || errors.email || errors.password ){

            setTouched({name : true, email : true, password : true});
            return;
        }

        setBusy(true);

        try {
            await apiRequest("/register",{method : "POST", body : form});
            toast("Account created. Please log in.");
            navigate("/login");
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    }

    return (
        <div className="auth-cont">
            <h2 className="page-title">Register</h2>
            { error && <div className="alert alert-danger">{error}</div> }
            <form onSubmit={handleSubmit} className="card-form" noValidate>
                <Field label="Name" htmlFor="name" error={show("name")}>
                    <input id="name" className={"form-control" + (show("name") ? " invalid" : "")} name="name" value={form.name} onChange={handleChange} onBlur={blur}/>
                </Field>
                <Field label="Email" htmlFor="email" error={show("email")}>
                    <input id="email" className={"form-control" + (show("email") ? " invalid" : "")} type="email" name="email" value={form.email} onChange={handleChange} onBlur={blur}/>
                </Field>
                <Field label="Password" htmlFor="password" error={show("password")}>
                    <PasswordInput id="password" value={form.password} invalid={!!show("password")} onChange={handleChange}/>
                </Field>
                <button className="pill pill-gold" disabled={busy}>{busy ? "Creating..." : "Register"}</button>
            </form>
            <p className="mt-3 muted">Already registered? <Link to="/login">Login here</Link></p>
        </div>
    )
}


export default Register;
