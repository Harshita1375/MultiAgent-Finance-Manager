import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import './Analytics.css';

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

const Analytics = ({ userName, viewMode, selectedMonth }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(amount);
    };

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParam = viewMode === 'all' ? 'all' : selectedMonth;
            
            try {
                const res = await axios.get(`${API_URL}/api/analytics?month=${queryParam}`, {
                    headers: { 'x-auth-token': token }
                });
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching analytics", err);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [viewMode, selectedMonth, API_URL]);

    if (loading) return <div className="loading">Crunching the numbers...</div>;
    if (!data || !data.totals) return <div className="no-data">No data found.</div>;

    const { totals, scores, insight } = data;

    const doughnutData = {
        labels: ['Expenses', 'Savings', 'Free Cash'],
        datasets: [{
            data: [totals.fixedExpenses, totals.savings, totals.freeCash],
            backgroundColor: ['#ef4444', '#10b981', '#f59e0b'],
            borderWidth: 0,
        }],
    };

    const radarData = {
        labels: ['Savings Rate', 'Expense Control', 'Risk Safety', 'Liquidity'],
        datasets: [{
            label: 'Financial Score',
            data: [scores.savingsRate * 2, scores.expenseControl, 85, scores.liquidity],
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: '#6366f1',
            borderWidth: 2,
            fill: true
        }],
    };

    return (
        <div className="analytics-container">
            <div className="kpi-grid">
                <div className="kpi-card income">
                    <h4>{viewMode === 'all' ? 'Total Earnings' : 'Monthly Income'}</h4>
                    <p>{formatINR(totals.income)}</p>
                </div>
                <div className="kpi-card burn">
                    <h4>{viewMode === 'all' ? 'Total Spent' : 'Monthly Burn'}</h4>
                    <p>{formatINR(totals.fixedExpenses)}</p>
                </div>
                <div className="kpi-card safe">
                    <h4>{viewMode === 'all' ? 'Total Saved' : 'Saved'}</h4>
                    <p style={{color: '#10b981'}}>{formatINR(totals.savings)}</p>
                </div>
            </div>

            <div className="charts-grid">
               <div className="chart-card">
                    <h3>Distribution</h3>
                    <div className="chart-wrapper">
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>Health Score</h3>
                    <div className="chart-wrapper">
                        <Radar data={radarData} options={{ maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { display: false } } } }} />
                    </div>
                </div>
            </div>

            <div className="ai-insight-box">
                <h3>💡 FinSync Insight</h3>
                <p>{insight}</p>
            </div>
        </div>
    );
};

export default Analytics;