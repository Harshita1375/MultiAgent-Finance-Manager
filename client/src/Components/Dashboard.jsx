import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
    FaHome, FaUser, FaRobot, FaWallet, FaPiggyBank, FaBell, FaBars, FaSignOutAlt, FaUserCircle 
} from 'react-icons/fa';
import './Dashboard.css'; 
import Profile from './Profile';
import Analytics from './Analytics';

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState({ name: 'Guest' });
    const [activeTab, setActiveTab] = useState('overview'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const googleToken = searchParams.get('token');
        if (googleToken) {
            localStorage.setItem('token', googleToken);
            navigate('/dashboard', { replace: true });
        }

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/'); 
        } else {
            fetchUserProfile(token);
        }
    }, [searchParams, navigate]);

    const fetchUserProfile = async (token) => {
        try {
            const res = await axios.get(`${API_URL}/api/auth/user`, {
                headers: { 'x-auth-token': token }
            });
            if (res.data) {
                setUser({ name: res.data.username });
            }
        } catch (err) {
            console.error("Error fetching user:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="dashboard-layout">
            <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h3>FinSync</h3>
                    <FaBars className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                </div>
                
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <FaHome /> <span>Overview</span>
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <FaUser /> <span>Profile & History</span>
                    </button>
                    
                    <div className="divider">AGENTS</div>
                    
                    <button className={activeTab === 'advisory' ? 'active' : ''} onClick={() => setActiveTab('advisory')}>
                        <FaRobot /> <span>Advisory Agent</span>
                    </button>
                    <button className={activeTab === 'expense' ? 'active' : ''} onClick={() => setActiveTab('expense')}>
                        <FaWallet /> <span>Expense Agent</span>
                    </button>
                    <button className={activeTab === 'savings' ? 'active' : ''} onClick={() => setActiveTab('savings')}>
                        <FaPiggyBank /> <span>Saving Agent</span>
                    </button>
                    <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
                        <FaBell /> <span>Notifications</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <FaSignOutAlt /> <span>Logout</span>
                    </button>
                </div>
            </div>

            <div className="main-content-wrapper">
                <div className="top-bar">
                    <h2 className="page-title">
                        {activeTab === 'overview' && 'Dashboard Overview'}
                        {activeTab === 'profile' && 'Profile Settings'}
                        {activeTab === 'advisory' && 'AI Advisor'}
                        {activeTab === 'expense' && 'Expense Agent'}
                        {activeTab === 'savings' && 'Savings Agent'}
                        {activeTab === 'notifications' && 'Notifications'}
                    </h2>

                    <div className="user-info">
                        <span className="user-name">Hi, <strong>{user.name}</strong></span>
                        <FaUserCircle className="user-avatar" />
                    </div>
                </div>

                <div className="content-area">
                    {activeTab === 'overview' && (
                        <div className="view-content">
                            <Analytics userName={user.name} /> 
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="view-content">
                            <Profile userName={user.name} /> 
                        </div>
                    )}
                    
                    {activeTab === 'advisory' && (
                        <div className="view-content">
                            <h2>🤵 Advisory Agent</h2>
                            <p>I will analyze your Profile data and give advice soon.</p>
                        </div>
                    )}
                    
                    {activeTab === 'expense' && (
                        <div className="view-content">
                            <h2>💸 Expense Agent</h2>
                            <p>Tracking expenses...</p>
                        </div>
                    )}

                    {activeTab === 'savings' && (
                        <div className="view-content">
                            <h2>🐷 Savings Agent</h2>
                            <p>Calculating compound interest...</p>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="view-content">
                            <h2>🔔 Notifications</h2>
                            <p>No new alerts.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;