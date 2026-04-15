import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RetirementAgent.css';

const RetirementAgent = () => {
    const [data, setData] = useState(null);

    const [form, setForm] = useState({
        currentAge: '',
        targetAge: 60,
        inflationRate: 6,
        expectedReturns: 12
    });

    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchData = async (customData = null) => {
        const token = localStorage.getItem('token');

        try {
            setLoading(true);

            const res = await axios.post(
                `${API_URL}/api/retirement/analyze`,
                customData,
                {
                    headers: { 'x-auth-token': token }
                }
            );

            setData(res.data);

        } catch (err) {
            console.log("❌ ERROR:", err.response?.data);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return <div className="loader">Analyzing your finances...</div>;
    }

    if (!data) {
        return (
            <div className="retirement-form">
                <h3>Setup Your Retirement Plan</h3>

                <input
                    type="number"
                    placeholder="Current Age"
                    value={form.currentAge}
                    onChange={(e) =>
                        setForm({ ...form, currentAge: e.target.value })
                    }
                />

                <input
                    type="number"
                    placeholder="Target Age"
                    value={form.targetAge}
                    onChange={(e) =>
                        setForm({ ...form, targetAge: e.target.value })
                    }
                />

                <input
                    type="number"
                    placeholder="Inflation Rate (%)"
                    value={form.inflationRate}
                    onChange={(e) =>
                        setForm({ ...form, inflationRate: e.target.value })
                    }
                />

                <input
                    type="number"
                    placeholder="Expected Returns (%)"
                    value={form.expectedReturns}
                    onChange={(e) =>
                        setForm({ ...form, expectedReturns: e.target.value })
                    }
                />

                <button
                    onClick={() => {
                        if (!form.currentAge) {
                            alert("Please enter your current age");
                            return;
                        }

                        fetchData({
                            currentAge: Number(form.currentAge),
                            targetAge: Number(form.targetAge),
                            inflationRate: Number(form.inflationRate),
                            expectedReturns: Number(form.expectedReturns)
                        });
                    }}
                >
                    Analyze Retirement
                </button>
            </div>
        );
    }

    const { analysis, currentMonthlySavings } = data;

    // 🔥 Derived calculations for explanation
    const monthlyExpenseToday = (analysis.requiredCorpus / 25) / 12;
    const yearsToRetirement = 60 - 25; // adjust if dynamic

    return (
        <div className="retirement-container">

            {/* HEADER */}
            <header className="agent-header">
                <h2 style={{ color: 'black' }}>AI Retirement Strategist</h2>
                <span className={`status-badge ${analysis.status.toLowerCase()}`}>
                    {analysis.status}
                </span>
            </header>

            {/* MAIN STATS */}
            <div className="stats-grid">
                <div className="stat-card">
                    <p>Required Corpus</p>
                    <h3>₹{(analysis.requiredCorpus / 10000000).toFixed(2)} Cr</h3>
                </div>

                <div className="stat-card">
                    <p>Monthly Investment Needed</p>
                    <h3>₹{analysis.monthlyInvestmentNeeded.toFixed(0)}</h3>
                </div>

                <div className="stat-card shortfall">
                    <p>Monthly Gap</p>
                    <h3>₹{analysis.currentShortfall.toFixed(0)}</h3>
                </div>
            </div>

            {/* 🔥 EXPLANATION SECTION */}
            <section className="explanation-box">
                <h4>🧠 How this is calculated</h4>

                <p>
                    👉 Your current monthly lifestyle ≈ <b>₹{monthlyExpenseToday.toFixed(0)}</b>
                </p>

                <p>
                    👉 After inflation, this becomes much higher in future
                </p>

                <p>
                    👉 We estimate you need <b>25× yearly expenses</b> for retirement
                </p>

                <p>
                    👉 That’s why your total target becomes:
                    <br />
                    <b>₹{(analysis.requiredCorpus / 10000000).toFixed(2)} Cr</b>
                </p>
            </section>

            {/* 🔥 KEY INSIGHTS */}
            <section className="ai-insights">
                <h4>💡 Smart Insights</h4>

                <ul>
                    {analysis.aiSuggestions?.map((s, i) => (
                        <li key={i}>{s}</li>
                    ))}
                </ul>

                <div className="keywords">
                    <span><li>📌 Inflation Impact</li></span>
                    <span><li>📌 SIP Growth</li></span>
                    <span><li>📌 Compounding</li></span>
                    <span><li>📌 Expense Control</li></span>
                    <span><li>📌 Early Investing</li></span>
                </div>
            </section>

            {/* 🔥 ACTION BOX */}
            <section className="action-box">
                <h4>🚀 What you should do</h4>

                {analysis.status === 'Critical' && (
                    <>
                        <p>⚠️ You are behind your retirement goal.</p>
                        <ul>
                            <li>Increase SIP amount</li>
                            <li>Reduce unnecessary spending</li>
                            <li>Start investing immediately</li>
                        </ul>
                    </>
                )}

                {analysis.status === 'Lagging' && (
                    <>
                        <p>⚡ You're slightly behind.</p>
                        <ul>
                            <li>Boost monthly investments</li>
                            <li>Avoid lifestyle inflation</li>
                        </ul>
                    </>
                )}

                {analysis.status === 'On Track' && (
                    <>
                        <p>✅ You are doing great!</p>
                        <ul>
                            <li>Stay consistent with SIP</li>
                            <li>Review yearly</li>
                        </ul>
                    </>
                )}
            </section>

        </div>
    );
};

export default RetirementAgent;