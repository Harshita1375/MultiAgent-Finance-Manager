import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { 
    FaPiggyBank, FaLightbulb, FaSpinner 
} from 'react-icons/fa';
import './SavingAgent.css';

// --- 1. IMPORT CHART.JS MODULES ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Needed for the area fill under the line
} from 'chart.js';

// --- 2. REGISTER THEM ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SavingAgent = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [assetType, setAssetType] = useState('house');
    const [assetValue, setAssetValue] = useState('');
    const [assetResult, setAssetResult] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchSavingsData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${API_URL}/api/agent/savings/analyze`, {
                    headers: { 'x-auth-token': token }
                });
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching savings analysis", err);
                setLoading(false);
            }
        };
        fetchSavingsData();
    }, []);

    const handleAssetAudit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`${API_URL}/api/agent/savings/asset-audit`, {
                type: assetType,
                value: assetValue,
                emiAmount: 20000, 
                tenureYears: 20,
                location: 'Tier-1 City' 
            }, { headers: { 'x-auth-token': token } });
            setAssetResult(res.data);
        } catch (err) {
            alert("Error analyzing asset");
        }
    };

    if (loading) return <div className="agent-loading"><FaSpinner className="spin" /> Analyzing your wealth...</div>;
    
    if (!data || !data.currentSavings) return (
        <div className="agent-empty">
            <h3>No Savings Data Found</h3>
            <p>Please go to the <strong>Profile</strong> tab and enter your SIP, Gold, or FD details first.</p>
        </div>
    );

    const { currentSavings, projection, suggestions, marketStatus, hasEMI } = data;

    // Chart Configuration
    const growthChartData = {
        labels: ['Today', '5 Years', '10 Years', '20 Years'],
        datasets: [{
            label: 'Projected Net Worth (₹)',
            data: [
                (currentSavings.sip + currentSavings.fdRd + currentSavings.gold),
                projection.years5,
                projection.years10,
                projection.years20
            ],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#10b981'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, // Hide legend for cleaner look
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    // Format Y-axis as Currency (e.g. 5L)
                    callback: function(value) {
                        return '₹' + (value / 100000).toFixed(1) + 'L';
                    }
                }
            }
        }
    };

    return (
        <div className="saving-container">
            {/* HEADER */}
            <div className="saving-header">
                <FaPiggyBank className="saving-icon-main" />
                <div>
                    <h2>Wealth Builder Agent</h2>
                    <p>AI Wealth Projection & Asset Management</p>
                    {marketStatus && <span className="market-badge">Market Status: {marketStatus}</span>}
                </div>
            </div>

            {/* WEALTH PROJECTION CARD */}
            <div className="projection-card">
                <div className="card-header">
                    <h3>📈 Your Financial Future</h3>
                    <span className="subtitle">Based on real-time market rates</span>
                </div>
                
                <div className="chart-wrapper-large">
                    <Line data={growthChartData} options={chartOptions} />
                </div>

                <div className="projection-stats">
                    <div className="stat-box">
                        <span>In 5 Years</span>
                        <strong>₹{(projection.years5 / 100000).toFixed(1)} Lakhs</strong>
                    </div>
                    <div className="stat-box">
                        <span>In 10 Years</span>
                        <strong>₹{(projection.years10 / 100000).toFixed(1)} Lakhs</strong>
                    </div>
                    <div className="stat-box highlight">
                        <span>In 20 Years</span>
                        <strong>₹{(projection.years20 / 10000000).toFixed(2)} Crores</strong>
                    </div>
                </div>
            </div>

            {/* AI SUGGESTIONS */}
            <div className="suggestions-section">
                <h3>💡 AI Investment Advice</h3>
                <div className="suggestion-grid">
                    {suggestions.length > 0 ? suggestions.map((tip, idx) => (
                        <div key={idx} className="suggestion-card">
                            <FaLightbulb className="tip-icon" />
                            <p>{tip}</p>
                        </div>
                    )) : <p>Your portfolio looks perfectly balanced!</p>}
                </div>
            </div>

            {/* ASSET AUDITOR */}
            {hasEMI && (
                <div className="asset-auditor">
                    <div className="audit-header">
                        <h3>🏠 Loan Analyzer</h3>
                        <p>We detected an EMI. Is this for a House or a Car? Let's check if it's a good investment.</p>
                    </div>

                    <form onSubmit={handleAssetAudit} className="audit-form">
                        <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                            <option value="house">House Loan</option>
                            <option value="car">Car Loan</option>
                        </select>
                        <input 
                            type="number" 
                            placeholder="Current Asset Value (₹)" 
                            value={assetValue}
                            onChange={(e) => setAssetValue(e.target.value)}
                            required
                        />
                        <button type="submit" className="audit-btn">Analyze ROI</button>
                    </form>

                    {assetResult && (
                        <div className="audit-result">
                            <h4>{assetResult.verdict}</h4>
                            <p>{assetResult.message}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SavingAgent;