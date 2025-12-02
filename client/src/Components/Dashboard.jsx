import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
    FaHome, FaUser, FaRobot, FaWallet, FaPiggyBank, FaBell, FaBars, FaSignOutAlt 
} from 'react-icons/fa';
import './Dashboard.css'; 
import Profile from './Profile';
import Analytics from './Analytics';

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState({ name: 'User' });
    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
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
            fetchData(token);
        }
    }, [searchParams, navigate]);

    const fetchData = async (token) => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.get(`${API_URL}/api/expenses`, config);
            setExpenses(res.data);
            const total = res.data.reduce((acc, curr) => acc + curr.amount, 0);
            setTotalExpenses(total);
        } catch (err) {
            console.error(err);
            if(err.response?.status === 401) handleLogout();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="view-content">
                        <Analytics /> 
                    </div>
                );

            case 'profile':
                return (
                    <div className="view-content">
                        <Profile /> 
                    </div>
                );

            case 'advisory':
                return <div className="view-content"><h2>🤵 Advisory Agent</h2><p>Coming soon...</p></div>;
            case 'expense':
                return <div className="view-content"><h2>💸 Expense Agent</h2><p>Coming soon...</p></div>;
            case 'savings':
                return <div className="view-content"><h2>🐷 Savings Agent</h2><p>Coming soon...</p></div>;
            case 'notifications':
                return <div className="view-content"><h2>🔔 Alerts</h2><p>No new notifications.</p></div>;
            default:
                return null;
        }
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
                        <FaUser /> <span>Profile</span>
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
                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;