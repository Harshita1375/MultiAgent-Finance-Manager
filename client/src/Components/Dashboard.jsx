import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
    FaHistory, FaCog, FaHome, FaUser, FaRobot, FaWallet, FaPiggyBank, FaBell, FaBars, FaSignOutAlt, FaUserCircle, FaLayerGroup, FaCalendarAlt, FaUserEdit, FaChevronDown, FaChevronUp, FaPlusCircle, FaslidersH 
} from 'react-icons/fa';
import './Dashboard.css'; 
import Profile from './Profile';
import Analytics from './Analytics';
import ExpenseAgent from './ExpenseAgent';
import TransactionHistory from './TransactionHistory';
import SavingAgent from './SavingAgent';
import Notification from './Notification';
import SidebarBadge from './SidebarBadge';
import AdvisoryAgent from './AdvisoryAgent';
import WalletWidget from './WalletWidget';

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState({ name: 'Guest' });
    const [activeTab, setActiveTab] = useState('overview'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileExpanded, setIsProfileExpanded] = useState(false); 
    
    const [hasWallet, setHasWallet] = useState(false);

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
            checkWalletStatus(token); 
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

    const checkWalletStatus = async (token) => {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const res = await axios.get(`${API_URL}/api/records?month=${currentMonth}`, {
                headers: { 'x-auth-token': token }
            });
            
            if (res.data && res.data.wallet && res.data.wallet.limit > 0) {
                setHasWallet(true);
            } else {
                setHasWallet(false);
            }
        } catch (err) {
            console.error("Wallet check failed", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleNavClick = (tab) => {
        setActiveTab(tab);
        if (window.innerWidth <= 768) setIsSidebarOpen(false);
    };

    return (
        <div className="dashboard-layout">
            
            <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h3>FinSync</h3>
                    <FaBars className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                </div>
                
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => handleNavClick('overview')}>
                        <FaHome /> <span>Overview</span>
                    </button>
                    
                    <button 
                        className={`nav-dropdown-btn ${activeTab.includes('profile') ? 'active' : ''}`}
                        onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                    >
                        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                            <FaUser /> <span>Profile</span>
                        </div>
                        {isProfileExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>

                    {isProfileExpanded && (
                        <div className="sidebar-subnav">
                            <button className={activeTab === 'profile-edit' ? 'active-sub' : ''} onClick={() => handleNavClick('profile-edit')}>
                                <FaUserEdit /> Edit Profile
                            </button>
                            <button className={activeTab === 'profile-history' ? 'active-sub' : ''} onClick={() => handleNavClick('profile-history')}>
                                <FaHistory /> History
                            </button>
                            <button className={activeTab === 'profile-settings' ? 'active-sub' : ''} onClick={() => handleNavClick('profile-settings')}>
                                <FaCog /> Settings
                            </button>
                        </div>
                    )}

                    <button 
                        className={`wallet-nav-btn ${activeTab === 'wallet' ? 'active' : ''}`} 
                        onClick={() => handleNavClick('wallet')}
                    >
                        <FaWallet /> 
                        <span>{hasWallet ? 'Regulate Wallet' : 'Create Wallet'}</span>
                    </button>
                    
                    <div className="divider">AGENTS</div>
                    
                    <button className={activeTab === 'advisory' ? 'active' : ''} onClick={() => handleNavClick('advisory')}>
                        <FaRobot /> <span>Advisory Agent</span>
                    </button>
                    <button className={activeTab === 'expense' ? 'active' : ''} onClick={() => handleNavClick('expense')}>
                        <FaLayerGroup /> <span>Expense Agent</span>
                    </button>
                    <button className={activeTab === 'savings' ? 'active' : ''} onClick={() => handleNavClick('savings')}>
                        <FaPiggyBank /> <span>Saving Agent</span>
                    </button>
                    <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => handleNavClick('notifications')}>
                        <FaBell /> <span>Notifications</span>
                        <SidebarBadge/>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn"><FaSignOutAlt /> <span>Logout</span></button>
                </div>
            </div>

            <div className="main-content-wrapper">
                
                <div className="top-bar">
                    <div className="header-left">
                        <h2 className="page-title">
                            {activeTab === 'overview' && `📈 ${user.name}'s Financial DNA`}
                            {activeTab === 'wallet' && (hasWallet ? '💳 Daily Wallet' : '🆕 Setup Wallet')}
                            {activeTab === 'profile-edit' && '✏️ Edit Monthly Record'}
                            {activeTab === 'profile-history' && '📜 Transaction History'}
                            {activeTab === 'expense' && '💸 Expense Guardian'}
                            {activeTab === 'savings' && 'Savings Agent'}
                            {activeTab === 'notifications' && 'Notifications'}
                        </h2>
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

                    {activeTab === 'wallet' && (
                        <div className="wallet-page-container">
                            <WalletWidget onSetupComplete={() => setHasWallet(true)} />
                        </div>
                    )}

                    {activeTab === 'profile-edit' && <Profile userName={user.name} />}
                    {activeTab === 'profile-history' && <TransactionHistory />}
                    
                    {/* AGENTS */}
                    {activeTab === 'advisory' && <AdvisoryAgent/>}
                    {activeTab === 'expense' && <ExpenseAgent />}
                    {activeTab === 'savings' && <SavingAgent />}
                    {activeTab === 'notifications' && <Notification />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;