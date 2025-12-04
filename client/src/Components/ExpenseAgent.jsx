import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaList, FaChartPie, FaLayerGroup, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import './ExpenseAgent.css';

const ExpenseAgent = () => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('month'); 
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [customLimits, setCustomLimits] = useState({ needs: 50, wants: 30 }); 

    const API_URL = process.env.REACT_APP_API_URL;

    const fetchAnalysis = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
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

    useEffect(() => { fetchAnalysis(); }, [viewMode, selectedMonth]);

    const handleLimitChange = (e) => {
        const { name, value } = e.target;
        setCustomLimits(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    if (loading) return <div className="agent-loading">🕵️ Agent is analyzing data...</div>;
    if (!analysis) return <div className="agent-empty">No data found.</div>;

    const { breakdown = {}, transactions = [], categories = {} } = analysis;
    const income = analysis.limits ? (analysis.limits.needs / 0.5) : 0; 

    const dynamicLimits = {
        needs: income * (customLimits.needs / 100),
        wants: income * (customLimits.wants / 100)
    };

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
            <div className="agent-header-row">
                <div className="agent-title-block">
                    <FaShieldAlt className="agent-icon-main" />
                    <div>
                        <h2>Expense Guardian</h2>
                        <p>{viewMode === 'all' ? 'Lifetime Analysis' : `Report for ${selectedMonth}`}</p>
                    </div>
                </div>

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

            <div className="agent-alerts">
                {breakdown.needs > dynamicLimits.needs && (
                    <div className="alert-card warning">
                        <FaExclamationTriangle /> <span>Needs exceeded {customLimits.needs}% limit.</span>
                    </div>
                )}
                {breakdown.wants > dynamicLimits.wants && (
                    <div className="alert-card danger">
                        <FaExclamationTriangle /> <span>Wants exceeded {customLimits.wants}% limit.</span>
                    </div>
                )}
                {breakdown.needs <= dynamicLimits.needs && breakdown.wants <= dynamicLimits.wants && (
                    <div className="alert-card success"><FaCheckCircle /> <span>Spending is within your custom limits.</span></div>
                )}
            </div>

            <div className="visuals-grid">
                <div className="limits-card">
                    <h3><FaList /> Custom Limit Tracker</h3>
                    
                    <div className="slider-container">
                        <label>Needs Limit: {customLimits.needs}%</label>
                        <input 
                            type="range" 
                            name="needs" 
                            min="10" max="80" 
                            value={customLimits.needs} 
                            onChange={handleLimitChange} 
                            className="slider"
                        />
                    </div>
                    <div className="limit-row">
                        <div className="limit-label">
                            <span>Actual Needs</span>
                            <small>₹{breakdown.needs || 0} / ₹{dynamicLimits.needs.toFixed(0)}</small>
                        </div>
                        <div className="progress-bg">
                            <div className="progress-fill fill-needs" 
                                 style={{width: `${Math.min(((breakdown.needs || 0) / (dynamicLimits.needs || 1))*100, 100)}%`}}></div>
                        </div>
                    </div>

                    <div className="slider-container">
                        <label>Wants Limit: {customLimits.wants}%</label>
                        <input 
                            type="range" 
                            name="wants" 
                            min="5" max="50" 
                            value={customLimits.wants} 
                            onChange={handleLimitChange} 
                            className="slider"
                        />
                    </div>
                    <div className="limit-row">
                        <div className="limit-label">
                            <span>Actual Wants</span>
                            <small>₹{breakdown.wants || 0} / ₹{dynamicLimits.wants.toFixed(0)}</small>
                        </div>
                        <div className="progress-bg">
                            <div className="progress-fill fill-wants" 
                                 style={{width: `${Math.min(((breakdown.wants || 0) / (dynamicLimits.wants || 1))*100, 100)}%`}}></div>
                        </div>
                    </div>
                </div>

                <div className="chart-card-mini">
                    <h3><FaChartPie /> Category Split</h3>
                    <div className="doughnut-wrapper">
                        <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
            </div>

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
                    <p className="no-trans">No expenses found for this period.</p>
                )}
            </div>
        </div>
    );
};

export default ExpenseAgent;