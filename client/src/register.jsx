import { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { apiRequest } from './api';

const Register = () =>{

    const navigate = useNavigate();
    const [form,setForm] = useState({name : "", email : "", password : ""});
    const [error,setError] = useState("");

    const handleChange = (e) =>{

        setForm({...form,[e.target.name] : e.target.value});
    }

    const handleSubmit = async (e) =>{

        e.preventDefault();
        setError("");

        try {
            await apiRequest("/register",{method : "POST", body : form});
            navigate("/login");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="auth-cont">
            <h2 className="page-title">Register</h2>
            { error && <div className="alert alert-danger">{error}</div> }
            <form onSubmit={handleSubmit} className="card-form">
                <div className="form-group">
                    <label>Name</label>
                    <input className="form-control" name="name" value={form.name} onChange={handleChange} required/>
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required/>
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required/>
                </div>
                <button className="pill pill-gold">Register</button>
            </form>
            <p className="mt-3 muted">Already registered? <Link to="/login">Login here</Link></p>
        </div>
    )
}


export default Register;
