import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
    FaHome, FaUser, FaRobot, FaWallet, FaPiggyBank, FaBell, FaBars, FaSignOutAlt 
} from 'react-icons/fa';
import './Dashboard.css'; 

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // --- STATE ---
    const [user, setUser] = useState({ name: 'User' });
    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [activeTab, setActiveTab] = useState('overview'); // Controls which view is shown
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // --- AUTH & FETCH LOGIC ---
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

    // --- COMPONENT RENDERERS ---
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="view-content">
                        <h2>📊 Financial Overview</h2>
                        <div className="stats-grid">
                            <div className="card">
                                <h3>Total Balance</h3>
                                {/* Assuming a static income for now until Profile is connected */}
                                <p className="amount">${(5000 - totalExpenses).toFixed(2)}</p>
                                <small>Based on $5000 income</small>
                            </div>
                            <div className="card">
                                <h3>Total Expenses</h3>
                                <p className="amount text-danger">${totalExpenses.toFixed(2)}</p>
                            </div>
                            <div className="card">
                                <h3>Active Savings</h3>
                                <p className="amount text-success">$1,200.00</p>
                            </div>
                        </div>
                        <div className="recent-activity">
                            <h3>Recent Transactions</h3>
                            {expenses.length > 0 ? (
                                <ul className="transaction-list">
                                    {expenses.slice(0, 5).map(exp => (
                                        <li key={exp._id} className="transaction-item">
                                            <span>{exp.title}</span>
                                            <span className="minus">-${exp.amount}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No transactions yet.</p>}
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="view-content">
                        <h2>👤 User Profile</h2>
                        <div className="card profile-card">
                            <p>Update your financial details here to help the agents analyze better.</p>
                            <form className="profile-form">
                                <div className="form-group">
                                    <label>Monthly Income</label>
                                    <input type="number" placeholder="5000" />
                                </div>
                                <div className="form-group">
                                    <label>Savings Goal</label>
                                    <input type="text" placeholder="Buy a Car" />
                                </div>
                                <div className="form-group">
                                    <label>Risk Tolerance</label>
                                    <select>
                                        <option>Low</option>
                                        <option>Moderate</option>
                                        <option>High</option>
                                    </select>
                                </div>
                                <button className="btn-primary">Save Profile</button>
                            </form>
                        </div>
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
            {/* --- SIDEBAR --- */}
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

            {/* --- MAIN CONTENT --- */}
            <div className="main-content-wrapper">
                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;