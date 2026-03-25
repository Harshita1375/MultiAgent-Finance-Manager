import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Replace your current react-icons/fa import with this:
import { 
    FaRobot, 
    FaExternalLinkAlt, 
    FaChartLine,      // Use this for Positive trends
    FaRegClock, 
    FaArrowDown       // Use this for Negative trends
} from 'react-icons/fa';import './MarketAgent.css';

// 1. Move this OUTSIDE the MarketAgent function component
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MarketAgent = () => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getInsights = async () => {
            try {
                // Now using the stable API_URL from outside
                const res = await axios.get(`${API_URL}/api/agent/market/analysis`);
                setInsights(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Agent error", err);
                setLoading(false);
            }
        };
        getInsights();
        
        // 2. Keep this array EMPTY if you only want it to run once on mount
    }, []); 

    // ... rest of your component

    // Simple Sentiment Logic for UI polish
    const getSentiment = (text) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('rise') || lowerText.includes('gain') || lowerText.includes('bullish') || lowerText.includes('positive')) return 'positive';
        if (lowerText.includes('fall') || lowerText.includes('drop') || lowerText.includes('bearish') || lowerText.includes('negative')) return 'negative';
        return 'neutral';
    };

    if (loading) return (
        <div className="agent-loader">
            <div className="spinner"></div>
            <p>FinSync Agent is scanning Indian Markets...</p>
        </div>
    );

    return (
        <div className="market-agent-container">
            <div className="agent-header">
                <div className="header-left">
                    <FaRobot className="bot-icon-animated" />
                    <div>
                        <h3 text-color="white">Market Intelligence Agent</h3>
                        <span className="live-tag">● LIVE: NSE/BSE Intel</span>
                    </div>
                </div>
                <div className="market-time">
                    <FaRegClock /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                </div>
            </div>

            <div className="insights-grid">
                {insights.length > 0 ? insights.map((item, index) => {
                    const sentiment = getSentiment(item.insight + item.title);
                    return (
                        <div key={index} className={`insight-card ${sentiment}`}>
                            <div className="sentiment-bar"></div>
                            <div className="card-content">
                                <div className="source-row">
                                    <div className="source-row">
    <span className="source-badge">{item.source}</span>
    {/* Updated icons here */}
    {sentiment === 'positive' ? (
        <FaChartLine className="trend-up" /> 
    ) : (
        <FaArrowDown className="trend-down" />
    )}
</div>
                                </div>
                                <h4>{item.title}</h4>
                                <p className="ai-insight-text">
                                    <span className="ai-label">AGENT ANALYSIS:</span> {item.insight}
                                </p>
                                <a href={item.url} target="_blank" rel="noreferrer" className="source-link">
                                    Read Full Report <FaExternalLinkAlt />
                                </a>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="no-data">No market shifts detected in the last hour.</div>
                )}
            </div>
        </div>
    );
};

export default MarketAgent;