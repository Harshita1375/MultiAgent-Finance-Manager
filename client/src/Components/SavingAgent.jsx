import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { 
    FaPiggyBank, FaLightbulb, FaSpinner, FaCalculator 
} from 'react-icons/fa';
import './SavingAgent.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler 
} from 'chart.js';

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
    const [assetResult, setAssetResult] = useState(null);

    const [loanDetails, setLoanDetails] = useState({
        assetType: 'house',
        assetValue: '',
        emiAmount: '',
        tenure: ''
    });

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
                console.error(err);
                setLoading(false);
            }
        };
        fetchSavingsData();
    }, []);

    const handleInputChange = (e) => {
        setLoanDetails({ ...loanDetails, [e.target.name]: e.target.value });
    };

    const handleAssetAudit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`${API_URL}/api/agent/savings/asset-audit`, {
                type: loanDetails.assetType,
                value: Number(loanDetails.assetValue),
                emiAmount: Number(loanDetails.emiAmount), 
                tenureYears: Number(loanDetails.tenure),
                location: 'Tier-1 City' 
            }, { headers: { 'x-auth-token': token } });
            setAssetResult(res.data);
        } catch (err) {
            alert("Error analyzing asset. Please check values.");
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
            legend: { display: false }, 
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function(value) {
                        return '₹' + (value / 100000).toFixed(1) + 'L';
                    }
                }
            }
        }
    };

    return (
        <div className="saving-container">
            <div className="saving-header">
                <FaPiggyBank className="saving-icon-main" />
                <div>
                    <h2>Wealth Builder Agent</h2>
                    <p>AI Wealth Projection & Asset Management</p>
                    {marketStatus && <span className="market-badge">Market Status: {marketStatus}</span>}
                </div>
            </div>

            <div className="projection-card">
                <div className="card-header">
                    <h3>📈 Your Financial Future</h3>
                    <span className="subtitle">Based on real-time market rates</span>
                </div>
                
                <div className="chart-wrapper-large">
                    <Line data={growthChartData} options={chartOptions} />
                </div>

                <div className="projection-stats">
                    {[5, 10, 20].map((years) => {
                        const totalValue = projection[`years${years}`];
                        const invested = (currentSavings.fdRd + currentSavings.gold) + (currentSavings.sip * 12 * years);
                        const profit = totalValue - invested;
                        
                        return (
                            <div key={years} className={`stat-box ${years === 20 ? 'highlight' : ''}`}>
                                <span>In {years} Years</span>
                                
                                <strong>
                                    {totalValue > 10000000 
                                        ? `₹${(totalValue / 10000000).toFixed(2)} Cr` 
                                        : new Intl.NumberFormat('en-IN', {
                                            style: 'currency',
                                            currency: 'INR',
                                            maximumFractionDigits: 0
                                          }).format(totalValue)
                                    }
                                </strong>

                                <small style={{ color: '#10b981', display: 'block', marginTop: '4px', fontSize: '0.85rem' }}>
                                    (+{profit > 10000000 
                                        ? `₹${(profit / 10000000).toFixed(2)} Cr`
                                        : new Intl.NumberFormat('en-IN', { 
                                            style: 'currency', 
                                            currency: 'INR', 
                                            maximumFractionDigits: 0 
                                          }).format(profit)
                                    } Profit)
                                </small>
                            </div>
                        );
                    })}
                </div>
            </div>

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

            {hasEMI && (
                <div className="asset-auditor">
                    <div className="audit-header">
                        <h3><FaCalculator /> Loan Analyzer</h3>
                        <p>We detected an EMI. Enter details to check if this loan is building wealth.</p>
                    </div>

                    <form onSubmit={handleAssetAudit} className="audit-form">
                        <div className="form-group-audit">
                            <label>Loan Type</label>
                            <select name="assetType" value={loanDetails.assetType} onChange={handleInputChange}>
                                <option value="house">House Loan</option>
                                <option value="car">Car Loan</option>
                            </select>
                        </div>

                        <div className="form-group-audit">
                            <label>Current Asset Value (₹)</label>
                            <input 
                                type="number" 
                                name="assetValue"
                                placeholder="Total Property Price" 
                                value={loanDetails.assetValue}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group-audit">
                            <label>Monthly EMI (₹)</label>
                            <input 
                                type="number" 
                                name="emiAmount"
                                placeholder="e.g. 25000" 
                                value={loanDetails.emiAmount}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group-audit">
                            <label>Tenure (Years)</label>
                            <input 
                                type="number" 
                                name="tenure"
                                placeholder="e.g. 20" 
                                value={loanDetails.tenure}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

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