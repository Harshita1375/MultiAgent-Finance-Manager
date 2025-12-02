import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import './Analytics.css';

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const API_URL = process.env.REACT_APP_API_URL;

    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${API_URL}/api/analytics`, {
                    headers: { 'x-auth-token': token }
                });
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching analytics", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading">Analyzing Financial DNA...</div>;
    if (!data) return <div className="no-data">Please fill out your Profile first!</div>;

    const { totals, scores, insight } = data;

    const doughnutData = {
        labels: ['Fixed Bills', 'Lifestyle', 'Investments', 'Free Cash'],
        datasets: [{
            data: [totals.fixedExpenses, totals.lifestyleExpenses, totals.savings, totals.freeCash],
            backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
            borderWidth: 0,
        }],
    };

    const radarData = {
        labels: ['Savings Rate', 'Expense Control', 'Lifestyle Balance', 'Risk Safety', 'Liquidity'],
        datasets: [{
            label: 'Financial Score',
            data: [
                scores.savingsRate * 2, 
                scores.expenseControl,
                100 - scores.luxuryScore, 
                85, 
                totals.freeCash > 0 ? 80 : 30 
            ],
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: '#6366f1',
            pointBackgroundColor: '#6366f1',
            borderWidth: 2,
            fill: true
        }],
    };

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h2>📈 Financial DNA</h2>
                <p>AI-Powered breakdown of your profile.</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card income">
                    <h4>Monthly Income</h4>
                    <p>{formatINR(totals.income)}</p>
                </div>
                <div className="kpi-card burn">
                    <h4>Monthly Burn</h4>
                    <p>{formatINR(totals.fixedExpenses + totals.lifestyleExpenses)}</p>
                </div>
                <div className="kpi-card safe">
                    <h4>Safe-to-Spend</h4>
                    <p>{formatINR(totals.freeCash)}</p>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Rupee Breakdown</h3>
                    <div className="chart-wrapper">
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Health Score</h3>
                    <div className="chart-wrapper">
                        <Radar data={radarData} options={{
                            maintainAspectRatio: false,
                            scales: { r: { min: 0, max: 100, ticks: { display: false } } }
                        }} />
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