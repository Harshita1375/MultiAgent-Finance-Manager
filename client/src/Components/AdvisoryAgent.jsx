import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    const openEditGoal = (goal) => {
    setEditingGoal(null); // Close the "Add Money" modal if it's open
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
                        💰 Add Money
                    </button>

                    <button onClick={() => openEditGoal(goal)}>✏️</button>
                    <button onClick={() => handleDeleteGoal(goal._id)}>🗑️</button>
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
    
    // Ensure we have a valid number
    const amountToSend = Number(addAmount);
    if (isNaN(amountToSend) || amountToSend <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    try {
        await axios.patch(
            `${API_URL}/api/agent/advisory/goals/progress`,
            {
                goalId: editingGoal._id,
                amount: amountToSend // Sent as a Number
            },
            {
                headers: { 'x-auth-token': token }
            }
        );

        setEditingGoal(null);
        setAddAmount('');
        fetchAdvisoryData(); // Refresh the UI

    } catch (err) {
        console.error("Patch Error:", err.response?.data || err.message);
        alert("Failed to update progress: " + (err.response?.data?.msg || "Server Error"));
    }
};
    if (!data) return <div className="loading">Consulting Advisor...</div>;

    return (
        <div className="advisory-container">
            <div className="agent-header">
                <div className="brand">
                    <FaRobot className="robot-icon" />
                    <div><h2>Advisory Agent</h2><p>Smart Strategy & Goal Tracking</p></div>
                </div>
                <div className="view-switcher">
                    <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Overview</button>
                    <button className={view === 'planner' ? 'active' : ''} onClick={generatePlan}>
                        {loadingPlan ? 'Analyzing...' : <><FaMagic /> AI Planner</>}
                    </button>
                </div>
            </div>

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
                <h2>Add New Goal 🎯</h2>

                <input
                    type="text"
                    placeholder="Goal Title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                />

                <input
                    type="number"
                    placeholder="Target Amount (₹)"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                />

                <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                />

                <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                >
                    <option>Short-Term</option>
                    <option>Long-Term</option>
                    <option>Retirement</option>
                </select>

                <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
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
            onChange={(e) => setEditGoalData({...editGoalData, title: e.target.value})}
        />

        <input
            type="number"
            value={editGoalData.targetAmount}
            onChange={(e) => setEditGoalData({...editGoalData, targetAmount: e.target.value})}
        />

        <input
            type="date"
            value={editGoalData.deadline?.slice(0,10)}
            onChange={(e) => setEditGoalData({...editGoalData, deadline: e.target.value})}
        />

        <select
            value={editGoalData.category}
            onChange={(e) => setEditGoalData({...editGoalData, category: e.target.value})}
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
    );
};

export default AdvisoryAgent;