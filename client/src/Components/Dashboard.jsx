import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
    FaHistory, FaCog, FaHome, FaUser, FaRobot, FaWallet, FaPiggyBank, FaBell, FaBars, FaSignOutAlt, FaUserCircle, FaLayerGroup, FaCalendarAlt, FaUserEdit, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';
import './Dashboard.css'; 
import Profile from './Profile';
import Analytics from './Analytics';
import ExpenseAgent from './ExpenseAgent';
import TransactionHistory from './TransactionHistory';

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // User State
    const [user, setUser] = useState({ name: 'Guest' });
    const [activeTab, setActiveTab] = useState('overview'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileExpanded, setIsProfileExpanded] = useState(false); // Dropdown State

    // Analytics View State (Lifted Up)
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

    // Helper for mobile: auto-close sidebar on selection
    const handleNavClick = (tab) => {
        setActiveTab(tab);
        if (window.innerWidth <= 768) setIsSidebarOpen(false);
    };

    return (
        <div className="dashboard-layout">
            
            {/* --- SIDEBAR --- */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h3>FinSync</h3>
                    <FaBars className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                </div>
                
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => handleNavClick('overview')}>
                        <FaHome /> <span>Overview</span>
                    </button>
                    
                    {/* PROFILE DROPDOWN */}
                    <button 
                        className={`nav-dropdown-btn ${activeTab.includes('profile') ? 'active' : ''}`}
                        onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                    >
                        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                            <FaUser /> <span>Profile</span>
                        </div>
                        {isProfileExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>

                    {/* SUB-MENU (Only visible when expanded) */}
                    {isProfileExpanded && (
                        <div className="sidebar-subnav">
                            <button 
                                className={activeTab === 'profile-edit' ? 'active-sub' : ''} 
                                onClick={() => handleNavClick('profile-edit')}
                            >
                                <FaUserEdit /> Edit Profile
                            </button>
                            <button 
                                className={activeTab === 'profile-history' ? 'active-sub' : ''} 
                                onClick={() => handleNavClick('profile-history')}
                            >
                                <FaHistory /> History
                            </button>
                            <button 
                                className={activeTab === 'profile-settings' ? 'active-sub' : ''} 
                                onClick={() => handleNavClick('profile-settings')}
                            >
                                <FaCog /> Settings
                            </button>
                        </div>
                    )}
                    
                    <div className="divider">AGENTS</div>
                    
                    <button className={activeTab === 'advisory' ? 'active' : ''} onClick={() => handleNavClick('advisory')}>
                        <FaRobot /> <span>Advisory Agent</span>
                    </button>
                    <button className={activeTab === 'expense' ? 'active' : ''} onClick={() => handleNavClick('expense')}>
                        <FaWallet /> <span>Expense Agent</span>
                    </button>
                    <button className={activeTab === 'savings' ? 'active' : ''} onClick={() => handleNavClick('savings')}>
                        <FaPiggyBank /> <span>Saving Agent</span>
                    </button>
                    <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => handleNavClick('notifications')}>
                        <FaBell /> <span>Notifications</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn"><FaSignOutAlt /> <span>Logout</span></button>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="main-content-wrapper">
                
                {/* TOP BAR */}
                <div className="top-bar">
                    <div className="header-left">
                        {/* If Overview, show Analytics Controls. If other tab, show Title. */}
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
                                {activeTab === 'profile-edit' && '✏️ Edit Monthly Record'}
                                {activeTab === 'profile-history' && '📜 Transaction History'}
                                {activeTab === 'profile-settings' && '⚙️ Settings'}
                                {activeTab === 'advisory' && 'AI Advisor'}
                                {activeTab === 'expense' && '💸 Expense Guardian'}
                                {activeTab === 'savings' && 'Savings Agent'}
                                {activeTab === 'notifications' && 'Notifications'}
                            </h2>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="user-info">
                        <div className="user-text">
                            <span className="welcome-sub">Welcome back,</span>
                            <span className="user-name">{user.name}</span>
                        </div>
                        <FaUserCircle className="user-avatar" />
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="content-area">
                    
                    {/* 1. OVERVIEW */}
                    {activeTab === 'overview' && (
                        <Analytics 
                            userName={user.name} 
                            viewMode={viewMode} 
                            selectedMonth={selectedMonth} 
                        />
                    )}

                    {/* 2. PROFILE SUB-PAGES */}
                    {activeTab === 'profile-edit' && <Profile userName={user.name} />}
                    {activeTab === 'profile-history' && <TransactionHistory />}
                    
                    {activeTab === 'profile-settings' && (
                        <div className="view-content placeholder-view">
                            <h2>⚙️ Settings</h2><p>Configuration options coming soon.</p>
                        </div>
                    )}
                    
                    {/* 3. AGENTS */}
                    {activeTab === 'advisory' && <div className="view-content placeholder-view"><h2>Advisory Agent</h2><p>Coming Soon...</p></div>}
                    {activeTab === 'expense' && <ExpenseAgent />}
                    {activeTab === 'savings' && <div className="view-content placeholder-view"><h2>Savings Agent</h2><p>Coming Soon...</p></div>}
                    {activeTab === 'notifications' && <div className="view-content placeholder-view"><h2>Notifications</h2><p>No new alerts.</p></div>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;