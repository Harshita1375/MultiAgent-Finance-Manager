import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';
import './Profile.css'; // We will create this next

const Profile = () => {
    const [formData, setFormData] = useState({
        // 1. Earnings
        netEarnings: '',
        
        // 2. Expenses
        emi: '',
        rent: '',
        grocery: '',
        electricity: '',
        otherBills: '', // Mobile/TV
        subscriptions: '', // OTT
        petrol: '',
        otherExpense: '',

        // 3. Demographics
        maritalStatus: 'single',
        hasChildren: 'no',
        schoolFees: '',

        // 4. Lifestyle
        partyBudget: '',

        // 5. Savings (Investments)
        sip: '',
        fdRd: '',
        gold: '',

        // 6. Other
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Profile Data to Save:", formData);
        // Later: axios.post(`${API_URL}/api/profile`, formData, config);
        alert("Profile data prepared! (Backend integration coming next)");
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>👤 Financial Profile</h2>
                <p>Complete this to help your AI Agents calculate your Safe-to-Spend limit.</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form-grid">
                
                {/* SECTION 1: INCOME */}
                <div className="form-section">
                    <h3>💰 Income Source</h3>
                    <div className="input-group">
                        <label>Monthly Net Earnings (Salary)</label>
                        <input 
                            type="number" 
                            name="netEarnings" 
                            placeholder="e.g. 50000" 
                            value={formData.netEarnings} 
                            onChange={handleChange} 
                            required
                        />
                    </div>
                </div>

                {/* SECTION 2: MONTHLY FIXED EXPENSES */}
                <div className="form-section">
                    <h3>📉 Fixed Monthly Expenses</h3>
                    <div className="grid-2-col">
                        <div className="input-group">
                            <label>EMI / Loans</label>
                            <input type="number" name="emi" placeholder="0" value={formData.emi} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>House Rent</label>
                            <input type="number" name="rent" placeholder="0" value={formData.rent} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Groceries</label>
                            <input type="number" name="grocery" placeholder="0" value={formData.grocery} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Electricity Bills</label>
                            <input type="number" name="electricity" placeholder="0" value={formData.electricity} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Mobile / TV / Internet</label>
                            <input type="number" name="otherBills" placeholder="0" value={formData.otherBills} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>OTT & Subscriptions</label>
                            <input type="number" name="subscriptions" placeholder="Netflix, Spotify..." value={formData.subscriptions} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Petrol / Transport</label>
                            <input type="number" name="petrol" placeholder="0" value={formData.petrol} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Other Miscellaneous</label>
                            <input type="number" name="otherExpense" placeholder="0" value={formData.otherExpense} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: LIFESTYLE & FAMILY */}
                <div className="form-section">
                    <h3>👨‍👩‍👧 Family & Lifestyle</h3>
                    <div className="grid-2-col">
                        <div className="input-group">
                            <label>Marital Status</label>
                            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Monthly Party/Dining Budget</label>
                            <input type="number" name="partyBudget" placeholder="0" value={formData.partyBudget} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Conditional Rendering for Children */}
                    <div className="grid-2-col" style={{ marginTop: '15px' }}>
                        <div className="input-group">
                            <label>Do you have Children?</label>
                            <select name="hasChildren" value={formData.hasChildren} onChange={handleChange}>
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </div>
                        
                        {formData.hasChildren === 'yes' && (
                            <div className="input-group highlight-input">
                                <label>School Fees / Child Care</label>
                                <input type="number" name="schoolFees" placeholder="0" value={formData.schoolFees} onChange={handleChange} />
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 4: SAVINGS & INVESTMENTS */}
                <div className="form-section">
                    <h3>🐷 Current Savings & Assets</h3>
                    <div className="grid-3-col">
                        <div className="input-group">
                            <label>SIP (Mutual Funds)</label>
                            <input type="number" name="sip" placeholder="0" value={formData.sip} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>FD / RD</label>
                            <input type="number" name="fdRd" placeholder="0" value={formData.fdRd} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Gold</label>
                            <input type="number" name="gold" placeholder="0" value={formData.gold} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* SECTION 5: OTHER */}
                <div className="form-section">
                    <h3>📝 Other Details</h3>
                    <div className="input-group">
                        <label>Any other financial commitments?</label>
                        <textarea 
                            name="notes" 
                            rows="3" 
                            placeholder="Example: Sending money to parents, Insurance premiums..." 
                            value={formData.notes} 
                            onChange={handleChange}
                        ></textarea>
                    </div>
                </div>

                <button type="submit" className="save-btn">
                    <FaSave /> Save Profile
                </button>
            </form>
        </div>
    );
};

export default Profile;