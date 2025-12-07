import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaRobot, FaBullseye, FaShoppingCart, FaPlus, FaCheck, 
    FaExclamationTriangle, FaArrowRight, FaMagic, FaRegLightbulb 
} from 'react-icons/fa';
import './AdvisoryAgent.css';

const AdvisoryAgent = () => {
    const [data, setData] = useState(null);
    const [plan, setPlan] = useState(null); 
    const [view, setView] = useState('dashboard'); 
    const [loadingPlan, setLoadingPlan] = useState(false);
    
    const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '' });
    const [simCost, setSimCost] = useState('');
    const [simResult, setSimResult] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchAdvisoryData();
    }, []);

    const fetchAdvisoryData = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_URL}/api/agent/advisory/dashboard`, {
                headers: { 'x-auth-token': token }
            });
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const generatePlan = async () => {
        setLoadingPlan(true);
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_URL}/api/agent/advisory/plan`, {
                headers: { 'x-auth-token': token }
            });
            setPlan(res.data);
            setView('planner');
            setLoadingPlan(false);
        } catch (err) {
            alert("Could not generate plan. Ensure you have monthly data.");
            setLoadingPlan(false);
        }
    };

    const handleAddGoal = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/api/agent/advisory/goals`, newGoal, {
                headers: { 'x-auth-token': token }
            });
            fetchAdvisoryData();
            setView('dashboard');
            setNewGoal({ title: '', targetAmount: '' });
        } catch (err) {
            alert("Error adding goal");
        }
    };

    const handleSimulate = async () => {
        if(!simCost) return;
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`${API_URL}/api/agent/advisory/affordability`, {
                cost: simCost
            }, { headers: { 'x-auth-token': token } });
            setSimResult(res.data);
        } catch (err) {
            alert("Simulation failed");
        }
    };

    if (!data) return <div className="loading">Consulting the Oracle...</div>;

    return (
        <div className="advisory-container">
            <div className="agent-header">
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <FaRobot className="robot-icon" />
                    <div>
                        <h2>Advisory Agent</h2>
                        <p>Your Strategic Financial Planner</p>
                    </div>
                </div>
                
                <div className="view-switcher">
                    <button 
                        className={view === 'dashboard' ? 'active' : ''} 
                        onClick={() => setView('dashboard')}
                    >
                        Overview
                    </button>
                    <button 
                        className={view === 'planner' ? 'active' : ''} 
                        onClick={generatePlan}
                        disabled={loadingPlan}
                    >
                        {loadingPlan ? 'Thinking...' : <><FaMagic /> AI Planner</>}
                    </button>
                </div>
            </div>

            {view === 'dashboard' && (
                <div className="advisory-grid">
                    
                    <div className="advice-section">
                        <h3>📢 Priority Action Items</h3>
                        {data.advice.length === 0 ? (
                            <div className="good-job">
                                <FaCheck className="check-icon"/> 
                                <p>No critical issues! Your finances are optimized.</p>
                            </div>
                        ) : (
                            data.advice.map((item, idx) => (
                                <div key={idx} className={`advice-card ${item.type}`}>
                                    <h4>{item.text}</h4>
                                    <p>{item.detail}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="goal-section">
                        <div className="goal-header">
                            <h3><FaBullseye /> Financial Goals</h3>
                            <button className="add-goal-btn" onClick={() => setView('addGoal')}>
                                <FaPlus />
                            </button>
                        </div>

                        <div className="goals-list">
                            {data.goals.length > 0 ? data.goals.map(goal => {
                                const progress = (goal.savedAmount / goal.targetAmount) * 100;
                                return (
                                    <div key={goal._id} className="goal-card">
                                        <div className="goal-info">
                                            <strong>{goal.title}</strong>
                                            <span>₹{goal.savedAmount} / ₹{goal.targetAmount}</span>
                                        </div>
                                        <div className="progress-bg">
                                            <div className="progress-fill" style={{width: `${progress}%`}}></div>
                                        </div>
                                    </div>
                                )
                            }) : <p className="no-goals">No active goals. Set one!</p>}
                        </div>
                    </div>

                    <div className="simulator-section">
                        <h3><FaShoppingCart /> "Can I Afford It?"</h3>
                        <p>Enter price to check feasibility.</p>
                        <div className="sim-input">
                            <input 
                                type="number" placeholder="Price (₹)" 
                                value={simCost} onChange={e => setSimCost(e.target.value)}
                            />
                            <button onClick={handleSimulate}>Check</button>
                        </div>
                        
                        {simResult && (
                            <div className={`sim-result ${simResult.verdict}`}>
                                {simResult.verdict === 'danger' && <FaExclamationTriangle />}
                                <p>{simResult.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === 'addGoal' && (
                <div className="add-goal-container">
                    <h3>Create New Goal</h3>
                    <div className="add-goal-form">
                        <input 
                            type="text" placeholder="Goal Name (e.g. iPhone)" 
                            value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                        />
                        <input 
                            type="number" placeholder="Target Amount (₹)" 
                            value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
                        />
                        <div className="form-actions">
                            <button className="save-btn" onClick={handleAddGoal}>Save Goal</button>
                            <button className="cancel-btn" onClick={() => setView('dashboard')}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {view === 'planner' && plan && (
                <div className="planner-container">
                    <div className="planner-intro">
                        <h3>🗓️ Next Month's Optimized Blueprint</h3>
                        <p>I've analyzed your fixed and variable costs. Here is a strategy to squeeze out more savings.</p>
                    </div>

                    <div className="plan-grid">
                        <div className="plan-column">
                            <h4>Current Reality</h4>
                            <div className="p-card">
                                <div className="p-row">
                                    <span>Rent/EMI (Fixed)</span>
                                    <b>₹{plan.breakdown.hardFixed.toLocaleString()}</b>
                                </div>
                                <div className="p-row">
                                    <span>Bills/Grocery</span>
                                    <b>₹{plan.breakdown.softFixed.current.toLocaleString()}</b>
                                </div>
                                <div className="p-row">
                                    <span>Wants/Lifestyle</span>
                                    <b>₹{plan.breakdown.wants.current.toLocaleString()}</b>
                                </div>
                                <div className="p-row">
                                    <span>Daily Wallet</span>
                                    <b>₹{plan.breakdown.wallet.current.toLocaleString()}</b>
                                </div>
                                <div className="p-footer">
                                    <span>Potential Savings</span>
                                    <strong>₹{plan.savings.current.toLocaleString()}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="arrow-col"><FaArrowRight /></div>

                        <div className="plan-column">
                            <h4>AI Recommended Target</h4>
                            <div className="p-card optimized">
                                <div className="badge-ai">AI Plan</div>
                                <div className="p-row">
                                    <span>Rent/EMI (Fixed)</span>
                                    <b>₹{plan.breakdown.hardFixed.toLocaleString()}</b>
                                </div>
                                <div className="p-row highlight">
                                    <span>Bills/Grocery</span>
                                    <b>₹{plan.breakdown.softFixed.target.toLocaleString()}</b>
                                </div>
                                <div className="p-row highlight">
                                    <span>Wants/Lifestyle</span>
                                    <b>₹{plan.breakdown.wants.target.toLocaleString()}</b>
                                </div>
                                <div className="p-row highlight">
                                    <span>Daily Wallet</span>
                                    <b>₹{plan.breakdown.wallet.target.toLocaleString()}</b>
                                </div>
                                <div className="p-footer success">
                                    <span>Projected Savings</span>
                                    <strong>₹{plan.savings.projected.toLocaleString()}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="plan-impact-section">
                        <div className="strategies">
                            <h5><FaRegLightbulb /> Optimization <br/>Strategies Used:</h5>
                            <ul>
                                {plan.improvement.steps.length > 0 ? (
                                    plan.improvement.steps.map((step, i) => <li key={i}>{step}</li>)
                                ) : (
                                    <li>No major cuts needed. Maintain current discipline.</li>
                                )}
                            </ul>
                        </div>
                        <div className="impact-stats">
                            <div className="impact-box">
                                <small>Extra Savings</small>
                                <span>+₹{plan.improvement.savedAmount.toLocaleString()}</span>
                            </div>
                            <div className="impact-box">
                                <small>Efficiency Boost</small>
                                <span style={{color:'#4ade80'}}>+{plan.improvement.percentage}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvisoryAgent;