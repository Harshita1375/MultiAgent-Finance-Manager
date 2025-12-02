import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css'; // We will create this styling next

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // 1. CHECK FOR GOOGLE TOKEN (From URL)
        const googleToken = searchParams.get('token');
        if (googleToken) {
            localStorage.setItem('token', googleToken);
            // Remove token from URL for security so it doesn't stay in browser history
            navigate('/dashboard', { replace: true });
        }

        // 2. VERIFY TOKEN & GET USER DATA
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/'); // Redirect to login if no token
        } else {
            // Optional: Fetch user profile here if you have a route for it
            // For now, we just acknowledge they are logged in
            setUser({ name: "User" }); 
        }
    }, [searchParams, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>💰 Finance Dashboard</h1>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </header>

            <div className="stats-grid">
                <div className="card">
                    <h3>Total Balance</h3>
                    <p className="amount">$0.00</p>
                </div>
                <div className="card">
                    <h3>Monthly Expenses</h3>
                    <p className="amount">$0.00</p>
                </div>
                <div className="card">
                    <h3>Savings Goal</h3>
                    <p className="amount">$0.00</p>
                </div>
            </div>

            <div className="main-content">
                <div className="chart-section">
                    <h2>Spending Overview</h2>
                    <div className="placeholder-chart">
                        [Charts will go here]
                    </div>
                </div>

                <div className="agent-section">
                    <h2>🤖 AI Financial Agent</h2>
                    <div className="agent-chat">
                        <p>Waiting for data to analyze...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;