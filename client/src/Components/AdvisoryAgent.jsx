import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoalHistory from './GoalHistory';
import {
    FaRobot, FaBullseye, FaPlus, FaCheck, FaArrowRight,
    FaMagic, FaRegLightbulb, FaCalendarAlt, FaHistory, FaPiggyBank, FaShoppingCart
} from 'react-icons/fa';
import './AdvisoryAgent.css';

const AdvisoryAgent = () => {
    const [data, setData] = useState(null);
    const [plan, setPlan] = useState(null);
    const [view, setView] = useState('dashboard');
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [addAmount, setAddAmount] = useState('');
    const [simCost, setSimCost] = useState('');
    const [simResult, setSimResult] = useState(null);
    const [editGoalData, setEditGoalData] = useState(null);
    const [reward, setReward] = useState(null);
    const openEditGoal = (goal) => {
        setEditingGoal(null); 
        setEditGoalData(goal);
        setView('editGoal');
    };
    const [newGoal, setNewGoal] = useState({
        title: '',
        targetAmount: '',
        deadline: '',
        category: 'Short-Term',
        priority: 'Medium'
    });

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => { fetchAdvisoryData(); }, []);

    const fetchAdvisoryData = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_URL}/api/agent/advisory/analysis`, {
                headers: { 'x-auth-token': token }
            });
            setData(res.data);
        } catch (err) { console.error("Data fetch failed", err); }
    };
    useEffect(() => {
        // This creates the script tag dynamically
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script); // Cleanup when component unmounts
        }
    }, []);
    const handleDeleteGoal = async (id) => {
        const token = localStorage.getItem('token');

        if (!window.confirm("Delete this goal?")) return;

        try {
            await axios.delete(`${API_URL}/api/agent/advisory/goals/${id}`, {
                headers: { 'x-auth-token': token }
            });

            fetchAdvisoryData();
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
        } catch (err) { alert("Insufficient data for blueprint"); }
        setLoadingPlan(false);
    };
    const handleUpdateGoal = async () => {
        const token = localStorage.getItem('token');

        try {
            await axios.put(
                `${API_URL}/api/agent/advisory/goals/${editGoalData._id}`,
                editGoalData,
                { headers: { 'x-auth-token': token } }
            );

            setView('dashboard');
            fetchAdvisoryData();
        } catch (err) {
            console.error(err);
        }
    };

    const renderGoalCard = (goal) => {
        const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
        const remaining = goal.targetAmount - goal.savedAmount;

        return (
            <div key={goal._id} className="goal-card">
                <div className="goal-card-top">
                    <div className="goal-meta">
                        <span className="goal-title">{goal.title}</span>
                        <span className="goal-remaining">
                            {remaining > 0
                                ? `₹${remaining.toLocaleString()} left`
                                : 'Goal Hit! 🎉'}
                        </span>
                    </div>

                    <div className="goal-actions">
                        <button
                            className="add-money-btn"
                            onClick={() => {
                                setView('dashboard'); // Ensure we aren't in 'editGoal' view
                                setEditingGoal(goal);
                            }}
                        >
                            💰
                        </button>

                        <button className="add-money-btn" onClick={() => openEditGoal(goal)}>✏️</button>
                        <button className="add-money-btn" onClick={() => handleDeleteGoal(goal._id)}>🗑️</button>
                    </div>
                </div>

                <div className="goal-amount-display">
                    ₹{goal.savedAmount.toLocaleString()}
                </div>

                <div className="goal-progress-container">
                    <div className="progress-track">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="progress-stats">
                        <span>{Math.round(progress)}%</span>
                        <span>Target: ₹{goal.targetAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    };
    const handleSimulate = async () => {
        if (!simCost || Number(simCost) <= 0) {
            alert("Enter a valid amount");
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const res = await axios.post(
                `${API_URL}/api/agent/advisory/affordability`,
                { cost: Number(simCost) },
                { headers: { 'x-auth-token': token } }
            );

            setSimResult(res.data);

        } catch (err) {
            console.error(err);
            alert("Simulation failed");
        }
    };
    const handleAddGoal = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/api/agent/advisory/goals`, newGoal, {
                headers: { 'x-auth-token': token }
            });

            setView('dashboard');   // go back
            fetchAdvisoryData();    // refresh data

            // reset form
            setNewGoal({
                title: '',
                targetAmount: '',
                deadline: '',
                category: 'Short-Term',
                priority: 'Medium'
            });

        } catch (err) {
            console.error(err);
            alert("Failed to add goal");
        }
    };
    const handleAddMoney = async () => {
        const token = localStorage.getItem('token');
        const amountToSend = Number(addAmount);
        const oldProgress = (editingGoal.savedAmount / editingGoal.targetAmount) * 100;

        try {
            await axios.patch(`${API_URL}/api/agent/advisory/goals/progress`,
                { goalId: editingGoal._id, amount: amountToSend },
                { headers: { 'x-auth-token': token } }
            );

            const newTotal = editingGoal.savedAmount + amountToSend;
            const newProgress = (newTotal / editingGoal.targetAmount) * 100;

            // Check for milestones and trigger the shower
            if (newProgress >= 100 && oldProgress < 100) {
                triggerShower('100');
            } else if (newProgress >= 75 && oldProgress < 75) {
                triggerShower('75');
            } else if (newProgress >= 50 && oldProgress < 50) {
                triggerShower('50');
            }

            setEditingGoal(null);
            setAddAmount('');
            fetchAdvisoryData();
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    // Helper function for the Chocolate & Sparkle shower
    const triggerShower = (milestone) => {
        setReward(milestone);

        if (!window.confetti) return;

        const duration = 3 * 1000;
        const end = Date.now() + duration;

        // We define our "Celebration Items" here
        const scalar = 2.5; // This makes the emojis big and clear
        const items = ['🍫', '✨', '💰', '⭐', '🎉'];

        (function frame() {
            // Launch from the left
            window.confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: ['#ffd700', '#ffffff'], // Gold and White sparkles
                ticks: 200
            });

            // Launch from the right
            window.confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: ['#ffd700', '#ffffff'],
                ticks: 200
            });

            if (Math.random() < 0.2) { 
                window.confetti({
                    particleCount: 1,
                    startVelocity: 0,
                    ticks: 100,
                    origin: {
                        x: Math.random(),
                        y: Math.random() - 0.2 
                    },
                    shapes: ['circle'],
 
                });
            }

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };
    if (!data) return <div className="loading">Consulting Advisor...</div>;

    return (
        <div className="advisory-parent-wrapper">
            {/* 1. Reward Pop-up Logic */}
            {reward && (
                <div className="modal-overlay reward-animation">
                    <div className="modal-box reward-box">
                        <div className="reward-glow"></div> {/* Animated background glow */}
                        <div className="reward-icon">
                            {reward === '100' ? '🏆' : reward === '75' ? '🌟' : '🌗'}
                        </div>
                        <h2 className="reward-title">{reward}% Milestone!</h2>
                        <p className="reward-text">
                            {reward === '100'
                                ? "Incredible! You've fully funded this goal. Time for a real-life chocolate! 🍫"
                                : "You're making amazing progress. Keep that momentum going! ✨"}
                        </p>
                        <button
                            className="primary-btn reward-btn"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevents the click from bubbling up
                                setReward(null);     // This is the key line
                            }}
                        >
                            Awesome!
                        </button>
                    </div>
                </div>
            )}
            <div className="advisory-container">
                <div className="agent-header">
                    <div className="brand">
                        <FaRobot className="robot-icon" />
                        <div><h2>Advisory Agent</h2><p>Smart Strategy & Goal Tracking</p></div>
                    </div>
                    <div className="view-switcher">
                        <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Overview</button>
                        <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>Past Goals</button>
                        <button className={view === 'planner' ? 'active' : ''} onClick={generatePlan}>
                            {loadingPlan ? 'Analyzing...' : <><FaMagic /> AI Planner</>}
                        </button>
                    </div>
                </div>
                {view === 'history' && (
                    <GoalHistory goals={data.goals} />
                )}

                {view === 'dashboard' && (
                    <div className="advisory-grid">
                        <div className="advice-section">
                            <h3>📢 Priority Insights</h3>
                            {data.advice.map((item, i) => (
                                <div key={i} className={`advice-card ${item.type}`}>
                                    <h4>{item.text}</h4><p>{item.detail}</p>
                                </div>
                            ))}
                        </div>

                        <div className="goal-section">
                            <div className="goal-header">
                                <h3><FaBullseye /> Targeted Savings</h3>
                                <button className="add-goal-btn-circle" onClick={() => setView('addGoal')}><FaPlus /></button>
                            </div>
                            <div className="category-group">
                                <h5><FaCalendarAlt /> Short-Term</h5>
                                <div className="goals-grid-container">{data.goals.shortTerm.map(renderGoalCard)}</div>
                            </div>
                            <div className="category-group">
                                <h5><FaHistory /> Long-Term</h5>
                                <div className="goals-grid-container">{data.goals.longTerm.map(renderGoalCard)}</div>
                            </div>
                            <div className="category-group">
                                <h5><FaHistory /> Retirement</h5>
                                <div className="goals-grid-container">{data.goals.retirement.map(renderGoalCard)}</div>
                            </div>
                        </div>

                        <div className="simulator-section">
                            <h3><FaShoppingCart /> Affordability Check</h3>
                            <div className="sim-box">
                                <input type="number" placeholder="Enter Price (₹)" value={simCost} onChange={e => setSimCost(e.target.value)} />
                                <button onClick={handleSimulate}>Analyze</button>
                                {simResult && (
                                    <div className="sim-result">
                                        <h3>{simResult.message}</h3>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {view === 'addGoal' && (
                    <div className="add-goal-container">
                        <h2>🎯</h2>

                        <input
                            type="text"
                            placeholder="Goal Title"
                            value={newGoal.title}
                            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        />

                        <input
                            type="number"
                            placeholder="Target Amount (₹)"
                            value={newGoal.targetAmount}
                            onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                        />

                        <input
                            type="date"
                            value={newGoal.deadline}
                            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />

                        <select
                            value={newGoal.category}
                            onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                        >
                            <option>Short-Term</option>
                            <option>Long-Term</option>
                            <option>Retirement</option>
                        </select>

                        <select
                            value={newGoal.priority}
                            onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>

                        <button onClick={handleAddGoal}>Save Goal</button>
                        <button onClick={() => setView('dashboard')}>Cancel</button>
                    </div>
                )}
                {view === 'editGoal' && editGoalData && (
                    <div className="add-goal-container">
                        <h2>Edit Goal ✏️</h2>

                        <input
                            value={editGoalData.title}
                            onChange={(e) => setEditGoalData({ ...editGoalData, title: e.target.value })}
                        />

                        <input
                            type="number"
                            value={editGoalData.targetAmount}
                            onChange={(e) => setEditGoalData({ ...editGoalData, targetAmount: e.target.value })}
                        />

                        <input
                            type="date"
                            value={editGoalData.deadline?.slice(0, 10)}
                            onChange={(e) => setEditGoalData({ ...editGoalData, deadline: e.target.value })}
                        />

                        <select
                            value={editGoalData.category}
                            onChange={(e) => setEditGoalData({ ...editGoalData, category: e.target.value })}
                        >
                            <option>Short-Term</option>
                            <option>Long-Term</option>
                            <option>Retirement</option>
                        </select>

                        <button onClick={handleUpdateGoal}>Update Goal</button>
                        <button onClick={() => setView('dashboard')}>Cancel</button>
                    </div>
                )}
                {editingGoal && (
                    <div className="modal-overlay">
                        <div className="modal-box">
                            <h2>Add Money 💰</h2>

                            <p>{editingGoal.title}</p>

                            <input
                                type="number"
                                placeholder="Enter amount"
                                value={addAmount}
                                onChange={(e) => setAddAmount(e.target.value)}
                            />

                            <div className="modal-actions">
                                <button className="primary-btn" onClick={handleAddMoney}>
                                    Add
                                </button>

                                <button
                                    className="cancel-btn"
                                    onClick={() => setEditingGoal(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {view === 'planner' && plan && (
                    <div className="planner-container">
                        <div className="planner-header">
                            <h2>🗓️ Next Month's Optimized Blueprint</h2>
                            <p>A data-driven strategy to maximize your savings potential.</p>
                        </div>
                        <div className="plan-comparison-grid">
                            <div className="plan-card">
                                <h4>Current Reality</h4>
                                <div className="plan-row"><span>Rent/EMI (Fixed)</span><b>₹{plan.breakdown.hardFixed.toLocaleString()}</b></div>
                                <div className="plan-row"><span>Bills/Grocery</span><b>₹{plan.breakdown.softFixed.current.toLocaleString()}</b></div>
                                <div className="plan-row"><span>Wants/Lifestyle</span><b>₹{plan.breakdown.wants.current.toLocaleString()}</b></div>
                                <div className="plan-row"><span>Daily Wallet</span><b>₹{plan.breakdown.wallet.current.toLocaleString()}</b></div>
                                <div className="plan-footer"><span>Potential Savings</span><span>₹{plan.savings.current.toLocaleString()}</span></div>
                            </div>
                            <FaArrowRight className="arrow-icon" />
                            <div className="plan-card optimized">
                                <div className="badge-ai">AI Plan</div>
                                <h4>AI Recommended Target</h4>
                                <div className="plan-row"><span>Rent/EMI (Fixed)</span><b>₹{plan.breakdown.hardFixed.toLocaleString()}</b></div>
                                <div className="plan-row"><span>Bills/Grocery</span><b>₹{plan.breakdown.softFixed.target.toLocaleString()}</b></div>
                                <div className="plan-row"><span>Wants/Lifestyle</span><b>₹{plan.breakdown.wants.target.toLocaleString()}</b></div>
                                <div className="plan-row"><span>Daily Wallet</span><b>₹{plan.breakdown.wallet.target.toLocaleString()}</b></div>
                                <div className="plan-footer"><span>Projected Savings</span><span>₹{plan.savings.projected.toLocaleString()}</span></div>
                            </div>
                        </div>
                        <div className="plan-impact-summary">
                            <div className="strategy-list">
                                <h5><FaRegLightbulb /> Optimization Strategies:</h5>
                                <ul>{plan.improvement.steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                            <div className="impact-stat-card"><small>Extra Savings</small><h2>+ ₹{plan.improvement.savedAmount.toLocaleString()}</h2></div>
                            <div className="impact-stat-card"><small>Efficiency Boost</small><h2 className="stat-green">+{plan.improvement.percentage}%</h2></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

export default AdvisoryAgent;