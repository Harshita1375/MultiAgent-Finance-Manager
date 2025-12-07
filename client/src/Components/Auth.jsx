import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc'; 
import all from '../Assest/all.png';
import growth from '../Assest/growth.png';
import secure from '../Assest/Secure.webp';

import './Auth.css';

const slides = [
    {
      id: 1,
      title: "Get All Your Finances At One Place",
      description: "Manage your income, expenses, and investments seamlessly.",
      image: all
    },
    {
      id: 2,
      title: "Track Your Growth Real-Time",
      description: "Visualize your financial progress with advanced analytics.",
      image: growth
    },
    {
      id: 3,
      title: "Secure & Encrypted Transactions",
      description: "Your data is protected with enterprise-grade security.",
      image: secure
    }
  ];

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true); 
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [currentSlide, setCurrentSlide] = useState(0);

    const { username, email, password } = formData;
    const API_URL = process.env.REACT_APP_API_URL;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleGoogleLogin = () => {
        window.open(`${API_URL}/api/auth/google`, "_self");
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const body = JSON.stringify({ 
                email, 
                password, 
                ...( !isLogin && { username }) 
            });

            const res = await axios.post(`${API_URL}${endpoint}`, body, config);

            if (!isLogin) {
                setIsLogin(true);
                setError('Registration successful! Please login.');
                setFormData({...formData, password: ''});
            } else {
                localStorage.setItem('token', res.data.token);
                navigate('/dashboard');
            }

        } catch (err) {
            setError(err.response?.data?.msg || 'Authentication Failed');
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="login-container">
            
            <div className="login-left">
                <div className="brand-logo">FinSync.</div>
                
                <div className="login-header">
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ? 'Enter your details to access your dashboard' : 'Start your financial journey today'}</p>
                </div>

                {error && <div className={`alert ${error.includes('successful') ? 'alert-success' : 'alert-error'}`}>{error}</div>}

                <form className="login-form" onSubmit={onSubmit}>
                    
                    {!isLogin && (
                        <div className="form-group">
                            <label>Username</label>
                            <input 
                                type="text" 
                                name="username" 
                                value={username} 
                                onChange={onChange} 
                                placeholder="Choose a username"
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
                            placeholder="example@email.com"
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
                            placeholder="Enter 6+ characters"
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary">
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <button className="btn-google" onClick={handleGoogleLogin}>
                    <FcGoogle size={22} style={{ marginRight: '10px' }} />
                    Continue with Google
                </button>

                <p className="toggle-text">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                        {isLogin ? 'Sign Up' : 'Login'}
                    </span>
                </p>
            </div>

            <div className="login-right">
                <div className="slider-content">
                    <div key={currentSlide}>
                        <img 
                            src={slides[currentSlide].image} 
                            alt="Slide" 
                            className="slide-image" 
                        />
                        <div className="slide-text">
                            <h3>{slides[currentSlide].title}</h3>
                            <p>{slides[currentSlide].description}</p>
                        </div>
                    </div>
                </div>

                <div className="slider-dots">
                    {slides.map((_, index) => (
                        <span 
                            key={index} 
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Auth;