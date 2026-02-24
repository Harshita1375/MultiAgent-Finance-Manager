import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { 
    FaPiggyBank, FaLightbulb, FaSpinner, FaCalculator, FaArrowUp, FaArrowDown, 
    FaChartLine, FaLandmark, FaCoins 
} from 'react-icons/fa';
import DateFilter from './DateFilter';
import './SavingAgent.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SavingAgent = () => {
    const [data, setData] = useState(null);
    const [tradingData, setTradingData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [viewMode, setViewMode] = useState('all'); 
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); 
    const [assetType, setAssetType] = useState('house');
    const [assetValue, setAssetValue] = useState('');
    const [assetResult, setAssetResult] = useState(null);
    const [loanDetails, setLoanDetails] = useState({
        emiAmount: '',
        tenure: ''
    });

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchSavingsData = async () => {
            setLoading(true); 
            const token = localStorage.getItem('token');
            
            let queryParams = {};
            if (viewMode === 'month' && selectedMonth) {
                const [year, month] = selectedMonth.split('-');
                queryParams = { month, year };
            }

            try {
                const res = await axios.get(`${API_URL}/api/agent/savings/analyze`, {
                    headers: { 'x-auth-token': token },
                    params: queryParams 
                });
                setData(res.data);

                const resTrade = await axios.get(`${API_URL}/api/agent/savings/trading`, {
                    headers: { 'x-auth-token': token },
                    params: { 
                        type: viewMode, 
                        ...queryParams 
                    } 
                });
                setTradingData(resTrade.data);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchSavingsData();
    }, [viewMode, selectedMonth]); 

    const handleInputChange = (e) => {
        setLoanDetails({ ...loanDetails, [e.target.name]: e.target.value });
    };

    const handleAssetAudit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`${API_URL}/api/agent/savings/asset-audit`, {
                type: assetType,
                value: Number(assetValue),
                emiAmount: Number(loanDetails.emiAmount), 
                tenureYears: Number(loanDetails.tenure),
                location: 'Tier-1 City' 
            }, { headers: { 'x-auth-token': token } });
            setAssetResult(res.data);
        } catch (err) {
            alert("Error analyzing asset.");
        }
    };

    if (loading) return <div className="agent-loading"><FaSpinner className="spin" /> Analyzing your wealth...</div>;
    
    if (!data || (!data.currentSavings && viewMode === 'all')) return (
        <div className="agent-empty">
            <h3>No Savings Data Found</h3>
            <p>Please go to the <strong>Profile</strong> tab and enter your SIP, Gold, or FD details first.</p>
        </div>
    );

    const currentSavings = data.currentSavings || { sip: 0, fdRd: 0, gold: 0 };
    const presentSavings = data.presentSavings || { sip: 0, fdRd: 0, gold: 0 }; 
    const { projection, suggestions, marketStatus, hasEMI } = data;

    const growthChartData = {
        labels: ['Today', '5 Years', '10 Years', '20 Years'],
        datasets: [{
            label: 'Projected Net Worth (₹)',
            data: [
                (currentSavings.sip + currentSavings.fdRd + currentSavings.gold),
                projection?.years5 || 0,
                projection?.years10 || 0,
                projection?.years20 || 0
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
        plugins: { legend: { display: false } },
        scales: {
            y: { ticks: { callback: (val) => '₹' + (val / 100000).toFixed(1) + 'L' } }
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

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <DateFilter 
                    viewMode={viewMode} 
                    setViewMode={setViewMode} 
                    selectedMonth={selectedMonth} 
                    setSelectedMonth={setSelectedMonth} 
                />
            </div>

            <div className="monthly-commitments-section">
                <h4><FaCoins /> Present Monthly Investments</h4>
                <div className="commitment-grid">
                    <div className="commitment-card sip">
                        <div className="c-icon"><FaChartLine /></div>
                        <div className="c-info">
                            <span>Monthly SIP</span>
                            <strong>₹{presentSavings.sip.toLocaleString()}</strong>
                        </div>
                    </div>
                    <div className="commitment-card fd">
                        <div className="c-icon"><FaLandmark /></div>
                        <div className="c-info">
                            <span>Monthly FD/RD</span>
                            <strong>₹{presentSavings.fdRd.toLocaleString()}</strong>
                        </div>
                    </div>
                    <div className="commitment-card gold">
                        <div className="c-icon"><FaCoins /></div>
                        <div className="c-info">
                            <span>Digital Gold</span>
                            <strong>₹{presentSavings.gold.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div className="projection-card">
                <div className="card-header">
                    <h3>📈 Your Financial Future</h3>
                    <span className="subtitle">
                        {viewMode === 'all' ? "Based on real-time market rates" : `Snapshot for ${selectedMonth}`}
                    </span>
                </div>
                <div className="chart-wrapper-large">
                    <Line data={growthChartData} options={chartOptions} />
                </div>
                
                 <div className="projection-stats">
                    {[5, 10, 20].map((years) => {
                        const totalValue = projection ? projection[`years${years}`] : 0;
                        const invested = (currentSavings.fdRd + currentSavings.gold) + (currentSavings.sip * 12 * years);
                        const profit = totalValue - invested;
                        return (
                            <div key={years} className={`stat-box ${years === 20 ? 'highlight' : ''}`}>
                                <span>In {years} Years</span>
                                <strong>
                                    {totalValue > 10000000 ? `₹${(totalValue / 10000000).toFixed(2)} Cr` : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalValue)}
                                </strong>
                                <small style={{ color: '#10b981', display: 'block', marginTop: '4px', fontSize: '0.85rem' }}>
                                    (+{profit > 10000000 ? `₹${(profit / 10000000).toFixed(2)} Cr` : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(profit)} Profit)
                                </small>
                            </div>
                        );
                    })}
                </div>
            </div>

            {tradingData && tradingData.plans && tradingData.plans.length > 0 && (
                <div className="trading-section">
                    <div className="section-header-trade">
                        <h3>📊 Smart Trading Plans</h3>
                        <p>Based on Free Cash: <strong style={{color:'#10b981'}}>₹{Math.round(tradingData.freeCash).toLocaleString()}</strong></p>
                    </div>
                    
                    <div className="chart-wrapper-large" style={{height: '200px', marginBottom: '25px'}}>
                        <Bar 
                            data={{
                                labels: tradingData.plans.map(p => p.name),
                                datasets: [{
                                    label: 'Investment Amount (₹)',
                                    data: tradingData.plans.map(p => p.totalCost),
                                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                                    borderColor: '#3b82f6',
                                    borderWidth: 1,
                                    borderRadius: 4
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true } }
                            }}
                        />
                    </div>

                    <div className="trading-grid">
                        {tradingData.plans.slice(0, 4).map((plan, idx) => (
                            <div key={idx} className="trade-card">
                                <div className="trade-header">
                                    <span className={`badge ${plan.type.toLowerCase()}`}>{plan.type}</span>
                                    <span className={plan.change >= 0 ? "stock-up" : "stock-down"}>
                                        {plan.change >= 0 ? <FaArrowUp /> : <FaArrowDown />} 
                                        {plan.change.toFixed(2)}%
                                    </span>
                                </div>
                                <h4>{plan.name}</h4>
                                <div className="trade-details">
                                    <div className="trade-row">
                                        <span>Price</span>
                                        <strong>₹{plan.price.toFixed(0)}</strong>
                                    </div>
                                    <div className="trade-row">
                                        <span>Action</span>
                                        <strong className="action-text">{plan.recommendation}</strong>
                                    </div>
                                </div>
                                <div className="trade-footer">
                                    <span>Invest: ₹{Math.round(plan.totalCost).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="suggestions-section">
                <h3>💡 AI Investment Advice</h3>
                <div className="suggestion-grid">
                    {suggestions && suggestions.length > 0 ? suggestions.map((tip, idx) => (
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
                            <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                                <option value="house">House Loan</option>
                                <option value="car">Car Loan</option>
                            </select>
                        </div>
                        <div className="form-group-audit">
                            <label>Current Asset Value (₹)</label>
                            <input type="number" placeholder="Total Price" value={assetValue} onChange={(e) => setAssetValue(e.target.value)} required />
                        </div>
                        <div className="form-group-audit">
                            <label>Monthly EMI (₹)</label>
                            <input type="number" name="emiAmount" placeholder="e.g. 25000" value={loanDetails.emiAmount} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group-audit">
                            <label>Tenure (Years)</label>
                            <input type="number" name="tenure" placeholder="e.g. 20" value={loanDetails.tenure} onChange={handleInputChange} required />
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