import React, { useState } from "react";
import "./RetirementForm.css";

const RetirementForm = ({ onSubmit,onClose }) => {
    const [form, setForm] = useState({
        currentAge: 25,
        targetAge: 60,
        inflationRate: 6,
        expectedReturns: 12
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(form);
        onClose();
    };

    return (
        <div className="ret-form-overlay">
            <div className="ret-form-card">
                <button onClick={onClose} className="close-btn">✖</button>
<h2 className="heading">AI Retirement Strategist</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Current Age</label>
                        <input
                            type="number"
                            name="currentAge"
                            value={form.currentAge}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Target Retirement Age</label>
                        <input
                            type="number"
                            name="targetAge"
                            value={form.targetAge}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Inflation Rate (%)</label>
                        <input
                            type="number"
                            name="inflationRate"
                            value={form.inflationRate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Expected Returns (%)</label>
                        <input
                            type="number"
                            name="expectedReturns"
                            value={form.expectedReturns}
                            onChange={handleChange}
                        />
                    </div>

                    <button className="submit-btn">Generate Plan 🚀</button>
                </form>
            </div>
        </div>
    );
};

export default RetirementForm;