import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaList, FaChartPie, FaLayerGroup, FaCalendarAlt } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import './ExpenseAgent.css';

const ExpenseAgent = () => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // VIEW STATE (Default to current month)
    const [viewMode, setViewMode] = useState('month'); 
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchAnalysis = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Decide what to send to backend
        const queryParam = viewMode === 'all' ? 'all' : selectedMonth;

        try {
            const res = await axios.get(`${API_URL}/api/records/analyze?month=${queryParam}`, {
                headers: { 'x-auth-token': token }
            });
            setAnalysis(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // Refetch whenever the user toggles the view or changes the date
    useEffect(() => { fetchAnalysis(); }, [viewMode, selectedMonth]);

    if (loading) return <div className="agent-loading">🕵️ Agent is analyzing data...</div>;
    
    // Safety check for empty data
    if (!analysis) return <div className="agent-empty">No data found.</div>;

    // Destructure data (with defaults to prevent crashes)
    const { breakdown = {}, limits = {}, alerts = [], transactions = [], categories = {} } = analysis;

    // Prepare Chart Data
    const chartData = {
        labels: Object.keys(categories),
        datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'],
            borderWidth: 0
        }]
    };

    return (
        <div className="agent-container">
            
            {/* HEADER ROW WITH CONTROLS */}
            <div className="agent-header-row">
                <div className="agent-title-block">
                    <FaShieldAlt className="agent-icon-main" />
                    <div>
                        <h2>Expense Guardian</h2>
                        <p>{viewMode === 'all' ? 'Lifetime Analysis' : `Report for ${selectedMonth}`}</p>
                    </div>
                </div>

                {/* TOGGLE BUTTONS */}
                <div className="view-controls">
                    <button 
                        className={`view-btn ${viewMode === 'all' ? 'active' : ''}`} 
                        onClick={() => setViewMode('all')}
                    >
                        <FaLayerGroup /> All-Time
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'month' ? 'active' : ''}`} 
                        onClick={() => setViewMode('month')}
                    >
                        <FaCalendarAlt /> Month
                    </button>
                    
                    {/* Show Date Picker ONLY if 'Month' is selected */}
                    {viewMode === 'month' && (
                        <input 
                            type="month" 
                            className="month-picker-small"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    )}
                </div>
            </div>

            {/* ALERTS SECTION */}
            <div className="agent-alerts">
                {alerts.length > 0 ? alerts.map((alert, idx) => (
                    <div key={idx} className={`alert-card ${alert.type}`}>
                        <FaExclamationTriangle /> <span>{alert.msg}</span>
                    </div>
                )) : (
                    <div className="alert-card success"><FaCheckCircle /> <span>Spending is within safe limits for this period.</span></div>
                )}
            </div>

            {/* VISUALS GRID */}
            <div className="visuals-grid">
                
                {/* LIMIT TRACKER */}
                <div className="limits-card">
                    <h3><FaList /> Limit Tracker</h3>
                    
                    <div className="limit-row">
                        <div className="limit-label">
                            <span>Needs (Target: 50%)</span>
                            <small>₹{breakdown.needs || 0} / ₹{limits.needs || 0}</small>
                        </div>
                        <div className="progress-bg">
                            <div className="progress-fill fill-needs" 
                                 style={{width: `${Math.min(((breakdown.needs || 0) / (limits.needs || 1))*100, 100)}%`}}></div>
                        </div>
                    </div>

                    <div className="limit-row">
                        <div className="limit-label">
                            <span>Wants (Target: 30%)</span>
                            <small>₹{breakdown.wants || 0} / ₹{limits.wants || 0}</small>
                        </div>
                        <div className="progress-bg">
                            <div className="progress-fill fill-wants" 
                                 style={{width: `${Math.min(((breakdown.wants || 0) / (limits.wants || 1))*100, 100)}%`}}></div>
                        </div>
                    </div>
                </div>

                {/* PIE CHART */}
                <div className="chart-card-mini">
                    <h3><FaChartPie /> Category Split</h3>
                    <div className="doughnut-wrapper">
                        <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
            </div>

            {/* --- TRANSACTION TABLE --- */}
            <div className="table-section">
                <h3>
                    📜 {viewMode === 'all' ? 'All Transactions (History)' : 'Monthly Transactions'}
                </h3>
                
                {transactions && transactions.length > 0 ? (
                    <table className="expense-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t, index) => (
                                <tr key={index}>
                                    {/* Format Date nicely */}
                                    <td>{new Date(t.date).toLocaleDateString()}</td>
                                    <td>{t.title}</td>
                                    <td><span className="badge-cat">{t.category}</span></td>
                                    <td>
                                        <span className={`badge-type ${t.type}`}>
                                            {t.type ? t.type.toUpperCase() : 'EXPENSE'}
                                        </span>
                                    </td>
                                    <td className="amount-col">₹{t.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-trans">No variable expenses found for this period.</p>
                )}
            </div>
        </div>
    );
};

export default ExpenseAgent;