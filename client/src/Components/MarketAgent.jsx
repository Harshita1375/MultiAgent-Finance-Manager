import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRobot, FaExternalLinkAlt, FaChartLine, FaRegClock, FaArrowDown } from 'react-icons/fa';
import './MarketAgent.css';
import SavingAgent from './SavingAgent';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MarketAgent = () => {
    const [insights, setInsights] = useState({ marketNews: [], personalAlerts: [] });
    const [loading, setLoading] = useState(true);
    const [showSavings, setShowSavings] = useState(false);

    useEffect(() => {
        const getInsights = async () => {
            try {
                const res = await axios.get(
                    `${API_URL}/api/agent/market/analysis?userId=dummy_user`
                );

                console.log("API DATA:", res.data);

                setInsights(res.data);
            } catch (err) {
                console.error("Agent error", err);
            } finally {
                setLoading(false);
            }
        };

        getInsights();
    }, []);

    const getSentiment = (text) => {
        if (!text) return 'neutral';
        const lowerText = text.toLowerCase();

        if (
            lowerText.includes('rise') ||
            lowerText.includes('gain') ||
            lowerText.includes('bullish') ||
            lowerText.includes('positive')
        ) return 'positive';

        if (
            lowerText.includes('fall') ||
            lowerText.includes('drop') ||
            lowerText.includes('bearish') ||
            lowerText.includes('negative')
        ) return 'negative';

        return 'neutral';
    };

    if (loading) {
        return (
            <div className="agent-loader">
                <div className="spinner"></div>
                <p>FinSync Agent is scanning Indian Markets...</p>
            </div>
        );
    }
    if (showSavings) {
        return (
            <div>
                <button 
                    onClick={() => setShowSavings(false)} 
                    style={{ marginBottom: '20px', padding: '10px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc' }}
                >
                    ← Back to Market Insights
                </button>
                <SavingAgent />
            </div>
        );
    }

    return (
        <div className="market-agent-container">

            {/* HEADER */}
            <div className="agent-header">
                <div className="header-left">
                    <FaRobot className="bot-icon-animated" />
                    <div>
                        <h3 style={{ color: 'black' }}>Market Intelligence Agent</h3>
                        <span className="live-tag">● LIVE: NSE/BSE Intel</span>
                    </div>
                </div>

                <div className="market-time">
                    <FaRegClock /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                </div>
            </div>

            {/* 📰 MARKET NEWS GRID */}
            <div className="insights-grid">
                {insights.marketNews?.length > 0 ? (
                    insights.marketNews.map((item, index) => {
                        const sentiment = getSentiment(item.insight + item.title);

                        return (
                            <div key={index} className={`insight-card ${sentiment}`}>
                                <div className="sentiment-bar"></div>

                                <div className="card-content">
                                    <div className="source-row">
                                        <span className="source-badge">{item.source}</span>

                                        {sentiment === 'positive' ? (
                                            <FaChartLine className="trend-up" />
                                        ) : (
                                            <FaArrowDown className="trend-down" />
                                        )}
                                    </div>

                                    <h4>{item.title}</h4>

                                    <p className="ai-insight-text">
                                        <span className="ai-label">AGENT ANALYSIS:</span> {item.insight}
                                    </p>

                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="source-link"
                                    >
                                        Read Full Report <FaExternalLinkAlt />
                                    </a>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-data">
                        No market shifts detected in the last hour.
                    </div>
                )}
            </div>

            {/* ⚠️ PERSONAL IMPACT (ONLY ONCE) */}
            {insights.personalAlerts?.length > 0 && (
                <div className="personal-impact-section">
                    <h4 className="impact-title">Your Financial Impact</h4>

                    {insights.personalAlerts.map((alert, i) => (
                        <div key={i} className="personal-impact-banner">
                            <div className="impact-left">
                                <span className="alert-icon">⚠️</span>

                                <div>
                                    <h4 style={{ color: 'black', margin: 0 }}>
                                        Budget Risk: {alert.category}
                                    </h4>

                                    <p style={{ color: '#333', fontSize: '0.9rem', margin: '5px 0' }}>
                                        {alert.action}
                                    </p>
                                </div>
                            </div>

                            <div className="impact-right">
                                <span className="loss-text">
                                    Potential Extra Cost
                                </span>
                                <button className="save-btn" onClick={() => setShowSavings(true)}>
                                    Adjust Savings
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default MarketAgent;