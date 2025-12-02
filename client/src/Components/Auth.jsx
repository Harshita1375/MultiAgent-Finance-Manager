import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc'; 
import './Auth.css';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true); 
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { username, email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleGoogleLogin = () => {

        window.open("http://localhost:5000/api/auth/google", "_self");
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        
        // Define Endpoint based on mode
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const body = JSON.stringify({ 
                email, 
                password, 
                ...( !isLogin && { username }) // Only send username if registering
            });

            const res = await axios.post(`http://localhost:5000${endpoint}`, body, config);

            // If Registering, auto-switch to login or auto-login (logic depends on preference)
            if (!isLogin) {
                setIsLogin(true);
                setError('Registration successful! Please login.');
            } else {
                localStorage.setItem('token', res.data.token);
                navigate('/dashboard');
            }

        } catch (err) {
            setError(err.response?.data?.msg || 'Authentication Failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="subtitle">
                    {isLogin ? 'Enter your details to access your dashboard' : 'Start your financial journey today'}
                </p>

                {error && <div className={`alert ${error.includes('successful') ? 'alert-success' : 'alert-error'}`}>{error}</div>}

                {/* Google Button */}
                <button className="btn-google" onClick={handleGoogleLogin}>
                    <FcGoogle size={22} style={{ marginRight: '10px' }} />
                    Continue with Google
                </button>

                <div className="divider">
                    <span>OR</span>
                </div>
                
                <form onSubmit={onSubmit}>
                    {/* Show Username field only if Registering */}
                    {!isLogin && (
                        <div className="form-group">
                            <label>Username</label>
                            <input 
                                type="text" 
                                name="username" 
                                value={username} 
                                onChange={onChange} 
                                required 
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={email} 
                            onChange={onChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={password} 
                            onChange={onChange} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-primary">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <p className="toggle-text">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                        {isLogin ? 'Sign Up' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Auth;