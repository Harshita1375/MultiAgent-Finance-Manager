import React from 'react';
import { FaLayerGroup, FaCalendarAlt } from 'react-icons/fa';
import './DateFilter.css'; // We will add specific styles

const DateFilter = ({ viewMode, setViewMode, selectedMonth, setSelectedMonth, showAllOption = true }) => {
    return (
        <div className="view-toggle-capsule">
            {showAllOption && (
                <button 
                    className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`} 
                    onClick={() => setViewMode('all')}
                >
                    <FaLayerGroup /> All-Time
                </button>
            )}
            
            <button 
                className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`} 
                onClick={() => setViewMode('month')}
            >
                <FaCalendarAlt /> Month
            </button>
            
            {viewMode === 'month' && (
                <input 
                    type="month" 
                    className="header-date-picker"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                />
            )}
        </div>
    );
};

export default DateFilter;