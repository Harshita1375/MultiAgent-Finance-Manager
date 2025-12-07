import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    FaChartLine, FaWallet, FaPiggyBank, FaArrowUp, FaRegLightbulb,
    FaArrowDown, FaClock, FaReceipt 
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './Analytics.css'; 

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, ArcElement, Filler
);

const Analytics = ({ viewMode, selectedMonth }) => {
    const [stats, setStats] = useState(null);
    const [advisoryPlan, setAdvisoryPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchDashboardData();
    }, [viewMode, selectedMonth]);

    const fetchDashboardData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const params = viewMode === 'month' ? `?month=${selectedMonth}` : '';

        try {
            const resStats = await axios.get(`${API_URL}/api/analytics${params}`, {
                headers: { 'x-auth-token': token }
            });
            let planData = null;
            try {
                const resPlan = await axios.get(`${API_URL}/api/agent/advisory/plan`, {
                    headers: { 'x-auth-token': token }
                });
                planData = resPlan.data;
            } catch (e) { console.log("No advisory plan yet"); }

            setStats(resStats.data);
            setAdvisoryPlan(planData);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Loading Command Center...</div>;
    if (!stats) return <div className="loading-state">No Data Available</div>;

    const breakdown = stats.breakdown || { fixed: 0, wants: 0, savings: 0 };
    const walletHistory = stats.walletHistory || [0,0,0,0,0,0,0];
    const income = stats.totalIncome || 0;
    const spent = stats.totalSpent || 0;
    const saved = stats.totalSaved || 0;
    const recentTransactions = stats.recentTransactions || [];
    const upcomingTransactions = stats.upcomingTransactions || [];

    const getLast7DaysLabels = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const labels = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(days[d.getDay()]);
        }
        return labels;
    };

    const walletChartData = {
        labels: getLast7DaysLabels(),
        datasets: [{
            label: 'Daily Spend',
            data: walletHistory, 
            backgroundColor: '#f59e0b',
            borderRadius: 6,
            barThickness: 20
        }]
    };

    const cashFlowData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], 
        datasets: [
            { label: 'Income', data: Array(4).fill(income), borderColor: '#10b981', tension: 0.4 },
            { label: 'Expenses', data: [spent * 0.2, spent * 0.3, spent * 0.25, spent * 0.25], borderColor: '#ef4444', tension: 0.4 },
            { label: 'Savings', data: [saved * 0.2, saved * 0.25, saved * 0.25, saved * 0.3], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true }
        ]
    };

    const distributionData = {
        labels: ['Fixed Needs', 'Wallet/Wants', 'Savings'],
        datasets: [{
            data: [breakdown.fixed, breakdown.wants, breakdown.savings],
            backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
            borderWidth: 0
        }]
    };

    const efficiency = advisoryPlan?.improvement?.percentage || 0;
    const potentialSave = advisoryPlan?.improvement?.savedAmount || 0;

    const formatDate = (dateString) => {
        if (dateString === 'Due soon') return dateString;
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="analytics-container">
            
            <div className="kpi-grid">
                <div className="kpi-card glass-blue">
                    <div className="kpi-icon"><FaChartLine /></div>
                    <div className="kpi-info">
                        <small>Total Net Flow</small>
                        <h3>₹{(income - spent).toLocaleString()}</h3>
                        <span className="badge positive"><FaArrowUp /> Cash Positive</span>
                    </div>
                </div>
                <div className="kpi-card glass-purple">
                    <div className="kpi-icon"><FaRegLightbulb /></div>
                    <div className="kpi-info">
                        <small>Efficiency Gain</small>
                        <h3>+{efficiency}%</h3>
                        <span className="sub-text">Potential: +₹{potentialSave.toLocaleString()}</span>
                    </div>
                </div>
                <div className="kpi-card glass-orange">
                    <div className="kpi-icon"><FaWallet /></div>
                    <div className="kpi-info">
                        <small>Wallet Burn</small>
                        <h3>₹{breakdown.wants.toLocaleString()}</h3>
                        <span className="badge neutral">Real-time</span>
                    </div>
                </div>
                <div className="kpi-card glass-green">
                    <div className="kpi-icon"><FaPiggyBank /></div>
                    <div className="kpi-info">
                        <small>Savings Rate</small>
                        <h3>{Math.round((saved / (income || 1)) * 100)}%</h3>
                        <span className="sub-text">Target: 20%</span>
                    </div>
                </div>
            </div>

            <div className="charts-grid-main">
                <div className="chart-card large">
                    <div className="card-header"><h4>Cash Flow Trends</h4></div>
                    <div className="chart-container-lg">
                        <Line data={cashFlowData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { grid: { borderDash: [5, 5] } } } }} />
                    </div>
                </div>
                <div className="side-charts-col">
                    <div className="chart-card small">
                        <h4>Wallet Pulse (Last 7 Days)</h4>
                        <div className="chart-container-sm">
                            <Bar data={walletChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } } } }} />
                        </div>
                    </div>
                    <div className="chart-card small row-flex">
                        <div className="doughnut-wrapper">
                            <Doughnut data={distributionData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
                            <div className="doughnut-center"><span>Total</span><strong>₹{(income/1000).toFixed(0)}k</strong></div>
                        </div>
                        <div className="legend-list">
                            <div className="legend-item"><span className="dot blue"></span> Needs</div>
                            <div className="legend-item"><span className="dot orange"></span> Wallet</div>
                            <div className="legend-item"><span className="dot green"></span> Savings</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="transactions-grid">
                
                <div className="transaction-card">
                    <div className="card-header">
                        <h4><FaReceipt /> Recent Activity</h4>
                    </div>
                    <div className="transaction-list">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map(tx => (
                                <div key={tx.id} className="transaction-item">
                                    <div className={`tx-icon ${tx.type || 'want'}`}>
                                        <FaArrowDown />
                                    </div>
                                    <div className="tx-details">
                                        <span className="tx-title">{tx.title}</span>
                                        <span className="tx-date">{formatDate(tx.date)}</span>
                                    </div>
                                    <div className="tx-amount expense">
                                        -₹{tx.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : <p className="no-data-text">No recent transactions.</p>}
                    </div>
                </div>

                <div className="transaction-card">
                    <div className="card-header">
                        <h4><FaClock /> Upcoming Payments</h4>
                    </div>
                    <div className="transaction-list">
                        {upcomingTransactions.length > 0 ? (
                            upcomingTransactions.map(tx => (
                                <div key={tx.id} className="transaction-item">
                                    <div className="tx-icon upcoming">
                                        <FaClock />
                                    </div>
                                    <div className="tx-details">
                                        <span className="tx-title">{tx.title}</span>
                                        <span className="tx-date">{tx.date}</span>
                                    </div>
                                    <div className="tx-amount">
                                        ₹{tx.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : <p className="no-data-text">No upcoming payments scheduled.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;