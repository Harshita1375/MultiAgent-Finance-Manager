import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRobot, FaBullseye, FaShoppingCart, FaPlus, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './AdvisoryAgent.css'; 

const AdvisoryAgent = () => {
    const [data, setData] = useState(null);
    const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '' });
    const [simCost, setSimCost] = useState('');
    const [simResult, setSimResult] = useState(null);
    const [view, setView] = useState('dashboard'); 

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
                <FaRobot className="robot-icon" />
                <div>
                    <h2>Advisory Agent</h2>
                    <p>Your Strategic Financial Planner</p>
                </div>
            </div>

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
                        <button className="add-goal-btn" onClick={() => setView(view === 'addGoal' ? 'dashboard' : 'addGoal')}>
                            {view === 'addGoal' ? 'Cancel' : <FaPlus />}
                        </button>
                    </div>

                    {view === 'addGoal' ? (
                        <div className="add-goal-form">
                            <input 
                                type="text" placeholder="Goal Name (e.g. iPhone)" 
                                value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                            />
                            <input 
                                type="number" placeholder="Target Amount (₹)" 
                                value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
                            />
                            <button onClick={handleAddGoal}>Save Goal</button>
                        </div>
                    ) : (
                        <div className="goals-list">
                            {data.goals.map(goal => {
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
                            })}
                            {data.goals.length === 0 && <p className="no-goals">No active goals. Set one!</p>}
                        </div>
                    )}
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
        </div>
    );
};

export default AdvisoryAgent;