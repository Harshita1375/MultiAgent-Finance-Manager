import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const InsuranceAlert = ({ message, setActiveTab }) => {
    return (
        <div className="insurance-prompt-card">
            <div className="insurance-prompt-content">
                <FaShieldAlt className="insurance-prompt-icon" />
                <div>
                    <p className="insurance-prompt-text">{message}</p>
                    <button 
                        className="insurance-prompt-btn" 
                        onClick={() => setActiveTab('profile-edit')}
                    >
                        Add Insurance Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InsuranceAlert;