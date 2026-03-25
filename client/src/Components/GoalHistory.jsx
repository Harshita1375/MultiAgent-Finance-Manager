import React, { useState } from 'react';
import { FaHistory, FaCheckCircle, FaFilter, FaExclamationTriangle } from 'react-icons/fa';
import './GoalHistory.css';

const GoalHistory = ({ goals }) => {
    const [filter, setFilter] = useState('All');

    try {
        // 1. Define categories
        const categories = ['All', 'Short-Term', 'Long-Term', 'Retirement'];

        // 2. Safely access history
        const allCompleted = goals?.history || [];

        // 3. Apply filtering
        const filteredGoals = filter === 'All'
            ? allCompleted
            : allCompleted.filter(g => g.category === filter);

        return (
            <div className="history-container">
                <div className="history-header">
                    <h3><FaHistory /> Accomplished Milestones</h3>
                    <div className="filter-bar">
                        <FaFilter />
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="history-grid">
                    {filteredGoals.length > 0 ? (
                        filteredGoals.map(goal => (
                            <div key={goal._id} className="history-card">
                                <div className="success-badge">
                                    <FaCheckCircle /> 🏆 Achieved
                                </div>
                                <h4>{goal.title}</h4>
                                <p className="history-amount">
                                    ₹{Number(goal.targetAmount || 0).toLocaleString()}
                                </p>
                                <small>
                                    Target hit on: {
                                        goal.updatedAt
                                            ? new Date(goal.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : new Date(goal.date).toLocaleDateString('en-IN') // Fallback to creation date if updatedAt is missing
                                    }
                                </small>
                            </div>
                        ))
                    ) : (
                        <div className="empty-history">
                            No completed goals in the {filter} category yet.
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        // This is where the magic happens! 
        // If the code above fails, it will print the error here.
        console.error("Error rendering GoalHistory:", error);

        return (
            <div className="error-fallback">
                <FaExclamationTriangle style={{ color: '#ff4d4d', fontSize: '2rem' }} />
                <h4>Something went wrong loading history</h4>
                <p>Check the console (F12) for details.</p>
            </div>
        );
    }
};

export default GoalHistory;