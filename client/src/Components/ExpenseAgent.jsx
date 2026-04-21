import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaShieldAlt, FaList, FaChartPie, FaLightbulb, FaExclamationCircle, FaTrophy, FaChartLine, FaHourglassHalf, FaWallet } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import DateFilter from './DateFilter';
import './ExpenseAgent.css';
import InsuranceAlert from './InsuranceAlert';
import RetirementAgent from './RetirementAgent';
import RetirementForm from './RetirementForm';

const ExpenseAgent = ({ setActiveTab }) => {

    const [analysis, setAnalysis] = useState(null);
    const [retirementData, setRetirementData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('month');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [customLimits, setCustomLimits] = useState({ needs: 50, wants: 30 });
    const [showForm, setShowForm] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

    const fetchRetirement = async (formData = {}) => {
        const token = localStorage.getItem('token');

        try {
            const res = await axios.post(
                `${API_URL}/api/retirement/analyze`,
                formData,
                {
                    headers: { 'x-auth-token': token }
                }
            );

            console.log("✅ RESPONSE:", res.data);

            // 🔥 HANDLE NO EXPENSE CASE
            if (res.data.needsInput) {
                setRetirementData(null);
                setShowForm(true); // show form
                return;
            }

            setRetirementData(res.data);
            setShowForm(false);

        } catch (err) {
            const errorMsg = err.response?.data?.message;

            console.log("❌ ERROR:", errorMsg);

            if (errorMsg === "PLAN_REQUIRED") {
                setRetirementData(null);
                setShowForm(true);
            }
        }
    };
    useEffect(() => {
        fetchRetirement();
    }, []);


    const getAlertIcon = (type) => {
        if (type === 'danger') return <FaExclamationCircle />;
        if (type === 'warning') return <FaLightbulb />;
        if (type === 'success') return <FaTrophy />;
        return <FaChartLine />;
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
                    <DateFilter
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                    />
                </div>
            </div>



            <div className="ai-feedback-section">
                <h3>🤖 AI Spending Feedback</h3>
                {(!analysis || transactions.length === 0) && (
                    <div className="feedback-card warning">
                        <div className="feedback-icon"><FaLightbulb /></div>
                        <div className="feedback-content">
                            <h4>Setup Recommended</h4>
                            <p>No expense data found. Please configure your <b>Custom Limit Tracker</b> below to begin analysis.</p>
                        </div>
                    </div>
                )}

                {retirementData && retirementData.analysis.status === 'Critical' && (
                    <div className="feedback-card danger">
                        <div className="feedback-icon"><FaHourglassHalf /></div>
                        <div className="feedback-content">
                            <h4>Retirement Warning</h4>
                            <p>Current spending on <b>Wants (₹{breakdown.wants})</b> is delaying your retirement corpus by approx. 4 years. Increase SIP to bridge the gap.</p>
                            <button className="action-link" onClick={() => setActiveTab('retirement')}>View Plan →</button>
                        </div>
                    </div>
                )}

                <InsuranceAlert message="Add your insurance plan" setActiveTab={setActiveTab} />
                <div className="feedback-grid">
                    {analysis.alerts && analysis.alerts.map((alert, idx) => (
                        <div key={idx} className={`feedback-card ${alert.type}`}>
                            <div className="feedback-icon">{getAlertIcon(alert.type)}</div>
                            <div className="feedback-content">
                                <h4>{alert.title}</h4>
                                <p>{alert.msg}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="visuals-grid">
                <div className="limits-card">
                    <h3><FaList /> Custom Limit Tracker</h3>

                    <div className="slider-container">
                        <label>Needs Limit: {customLimits.needs}%</label>
                        <input
                            type="range" name="needs" min="10" max="80"
                            value={customLimits.needs} onChange={handleLimitChange} className="slider"
                        />
                    </div>
                    <div className="limit-row">
                        <div className="limit-label"><span>Actual Needs</span><small>₹{breakdown.needs || 0} / ₹{dynamicLimits.needs.toFixed(0)}</small></div>
                        <div className="progress-bg"><div className="progress-fill fill-needs" style={{ width: `${Math.min(((breakdown.needs) / (dynamicLimits.needs || 1)) * 100, 100)}%` }}></div></div>
                    </div>

                    <div className="slider-container">
                        <label>Wants Limit: {customLimits.wants}%</label>
                        <input
                            type="range" name="wants" min="5" max="50"
                            value={customLimits.wants} onChange={handleLimitChange} className="slider"
                        />
                    </div>
                    <div className="limit-row">
                        <div className="limit-label"><span>Actual Wants</span><small>₹{breakdown.wants || 0} / ₹{dynamicLimits.wants.toFixed(0)}</small></div>
                        <div className="progress-bg"><div className="progress-fill fill-wants" style={{ width: `${Math.min(((breakdown.wants) / (dynamicLimits.wants || 1)) * 100, 100)}%` }}></div></div>
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
                <h3>📜 {viewMode === 'all' ? 'All Transactions (History)' : 'Monthly Transactions'}</h3>
                {transactions && transactions.length > 0 ? (
                    <div className="table-wrapper">
                        <table className="expense-table">
                            <thead>
                                <tr><th>Date</th><th>Item</th><th>Category</th><th>Type</th><th>Amount</th></tr>
                            </thead>
                            <tbody>
                                {transactions.map((t, index) => (
                                    <tr key={index}>
                                        <td>{new Date(t.date).toLocaleDateString()}</td>
                                        <td>{t.title} {t.isFixed && <span className="fixed-tag">(Fixed)</span>}</td>
                                        <td><span className="badge-cat">{t.category}</span></td>
                                        <td><span className={`badge-type ${t.type}`}>{t.type ? t.type.toUpperCase() : 'EXPENSE'}</span></td>
                                        <td className="amount-col">₹{t.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="no-trans">No expenses found for this period.</p>}
            </div>
            <div className="retirement-mini-card">
                <h3><FaWallet /> Retirement Forecast</h3>

                {retirementData ? (
                    <div className="ret-content">

                        <div className="ret-stat">
                            <span>Target Corpus</span>
                            <strong>
                                ₹{(retirementData.analysis.requiredCorpus / 10000000).toFixed(2)} Cr
                            </strong>
                        </div>

                        <div className="progress-bg">
                            <div
                                className="progress-fill fill-ret"
                                style={{
                                    width: `${Math.min(
                                        (retirementData.currentMonthlySavings / retirementData.analysis.monthlyInvestmentNeeded) * 100,
                                        100
                                    )}%`
                                }}
                            ></div>
                        </div>

                        <small>
                            {retirementData.analysis.status === 'On Track'
                                ? '✅ On schedule'
                                : '⚠️ Monthly shortfall detected'}
                        </small>

                    </div>
                ) : (
                    <div>
                        <p>⚠️ Retirement plan not set</p>
                        <button onClick={() => setShowForm(true)}>
                            Setup Plan →
                        </button>
                    </div>
                )}
            </div>
            {showForm && (
                <RetirementForm
                    onSubmit={fetchRetirement}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default ExpenseAgent;