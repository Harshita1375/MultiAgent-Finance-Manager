import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
    FaHome, FaUser, FaRobot, FaWallet, FaPiggyBank, FaBell, FaBars, FaSignOutAlt, FaUserCircle, FaLayerGroup, FaCalendarAlt 
} from 'react-icons/fa';
import './Dashboard.css'; 
import Profile from './Profile';
import Analytics from './Analytics';
import ExpenseAgent from './ExpenseAgent';

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState({ name: 'Guest' });
    const [activeTab, setActiveTab] = useState('overview'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [viewMode, setViewMode] = useState('all'); 
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

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
            if (res.data) setUser({ name: res.data.username });
        } catch (err) { console.error(err); }
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
                    <button onClick={handleLogout} className="logout-btn"><FaSignOutAlt /> <span>Logout</span></button>
                </div>
            </div>

            <div className="main-content-wrapper">
                <div className="top-bar">
                    <div className="header-left">
                        {activeTab === 'overview' ? (
                            <div className="analytics-controls-wrapper">
                                <div className="header-text-block">
                                    <h2 className="page-title">📈 {user.name}'s Financial DNA</h2>
                                    <p className="status-badge">
                                        {viewMode === 'all' ? 'Combined History Analysis' : `Analysis for ${selectedMonth}`}
                                    </p>
                                </div>

                                <div className="view-toggle-capsule">
                                    <button 
                                        className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`} 
                                        onClick={() => setViewMode('all')}
                                    >
                                        <FaLayerGroup /> All-Time
                                    </button>
                                    <button 
                                        className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`} 
                                        onClick={() => setViewMode('month')}
                                    >
                                        <FaCalendarAlt /> Single Month
                                    </button>
                                    
                                    {viewMode === 'month' && (
                                        <input 
                                            type="month" 
                                            className="header-date-picker"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                        />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <h2 className="page-title">
                                {activeTab === 'profile' && 'Profile Settings'}
                                {activeTab === 'advisory' && 'AI Advisor'}
                                {activeTab === 'expense' && 'Expense Agent'}
                                {activeTab === 'savings' && 'Savings Agent'}
                                {activeTab === 'notifications' && 'Notifications'}
                            </h2>
                        )}
                    </div>

                    <div className="user-info">
                        <div className="user-text">
                            <span className="welcome-sub">Welcome back,</span>
                            <span className="user-name">{user.name}</span>
                        </div>
                        <FaUserCircle className="user-avatar" />
                    </div>
                </div>

                <div className="content-area">
                    {activeTab === 'overview' && (
                        <Analytics 
                            userName={user.name} 
                            viewMode={viewMode} 
                            selectedMonth={selectedMonth} 
                        />
                    )}
                    {activeTab === 'profile' && <Profile userName={user.name} />}
                    {activeTab === 'advisory' && <div className="view-content placeholder-view"><h2>Advisory Agent</h2><p>Coming Soon...</p></div>}
                    {activeTab === 'expense' && <ExpenseAgent/>}
                    {activeTab === 'savings' && <div className="view-content placeholder-view"><h2>Savings Agent</h2><p>Coming Soon...</p></div>}
                    {activeTab === 'notifications' && <div className="view-content placeholder-view"><h2>Notifications</h2><p>No new alerts.</p></div>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;