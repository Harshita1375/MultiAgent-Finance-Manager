import React, { useState, useEffect } from 'react'; 
import { FaSave, FaCalendarAlt } from 'react-icons/fa'; 
import './Profile.css'; 
import axios from 'axios';

const Profile = () => {
    const API_URL = process.env.REACT_APP_API_URL;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        netEarnings: '',
        
        emi: '',
        rent: '',
        grocery: '',
        electricity: '',
        otherBills: '', 
        subscriptions: '', 
        petrol: '',
        otherExpense: '',

        maritalStatus: 'single',
        hasChildren: 'no',
        schoolFees: '',

        lifeInsurance: '',
    healthInsurance: '',
    familyHealthDetails: '',

        partyBudget: '',

        sip: '',
        fdRd: '',
        gold: '',

        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                // 1. Try to fetch data for the currently selected month
                const res = await axios.get(`${API_URL}/api/records?month=${selectedMonth}`, {
                    headers: { 'x-auth-token': token }
                });
                
                if (res.data && res.data.month) {
                    // Record exists: Set editing mode and fill data
                    setIsEditing(true);
                    populateForm(res.data);
                } else {
                    // 2. Record doesn't exist: Attempt to fetch previous month as a template
                    setIsEditing(false);
                    
                    const date = new Date(selectedMonth + "-01");
                    date.setMonth(date.getMonth() - 1);
                    const prevMonthStr = date.toISOString().slice(0, 7);

                    const prevRes = await axios.get(`${API_URL}/api/records?month=${prevMonthStr}`, {
                        headers: { 'x-auth-token': token }
                    });

                    if (prevRes.data && prevRes.data.month) {
                        // Previous month found: Use it as default values for the new record
                        populateForm(prevRes.data);
                    } else {
                        // No previous data found: Reset to empty
                        resetForm();
                    }
                }
            } catch (err) { 
                console.error("Error fetching record:", err); 
            }
        };

        // Helper to map API response to Form State
        const populateForm = (d) => {
            setFormData({
                netEarnings: d.income || '', 
                emi: d.expenses?.emi || '',
                rent: d.expenses?.rent || '',
                grocery: d.expenses?.grocery || '',
                electricity: d.expenses?.electricity || '',
                otherBills: d.expenses?.otherBills || '',
                subscriptions: d.expenses?.subscriptions || '',
                petrol: d.expenses?.petrol || '',
                otherExpense: d.expenses?.otherExpense || '',
                maritalStatus: d.demographics?.maritalStatus || 'single', 
                hasChildren: d.demographics?.hasChildren || 'no',
                schoolFees: d.demographics?.schoolFees || '', 
                lifeInsurance: d.insurance?.life || '',
        healthInsurance: d.insurance?.health || '',
        familyHealthDetails: d.insurance?.familyDetails || '',
                partyBudget: d.lifestyle?.partyBudget || '',
                sip: d.savings?.sip || '',
                fdRd: d.savings?.fdRd || '',
                gold: d.savings?.gold || '',
                notes: d.notes || ''
            });
        };

        // Helper to reset form
        const resetForm = () => {
            setFormData({ 
                netEarnings: '', emi: '', rent: '', grocery: '', electricity: '', 
                otherBills: '', subscriptions: '', petrol: '', otherExpense: '', 
                maritalStatus: 'single', hasChildren: 'no', schoolFees: '', partyBudget: '',
                sip: '', fdRd: '', gold: '', notes: '' 
            });
        };

        fetchData();
    }, [selectedMonth, API_URL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isSingleInsuranceEmpty = formData.maritalStatus === 'single' && (!formData.lifeInsurance || !formData.healthInsurance);
    const isFamilyInsuranceEmpty = formData.maritalStatus === 'married' && !formData.familyHealthDetails;

    if (isSingleInsuranceEmpty || isFamilyInsuranceEmpty) {
        const confirmSave = window.confirm(
            "⚠️ Insurance details are missing. It's recommended to track these for better financial planning. Do you want to save anyway?"
        );
        if (!confirmSave) return; // Stop the function if user clicks 'Cancel'
    }
        
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };

            const payload = {
                month: selectedMonth,
                income: formData.netEarnings,
                expenses: {
                    emi: formData.emi,
                    rent: formData.rent,
                    grocery: formData.grocery,
                    electricity: formData.electricity,
                    otherBills: formData.otherBills,
                    subscriptions: formData.subscriptions,
                    petrol: formData.petrol,
                    otherExpense: formData.otherExpense
                },
                insurance: {
                life: formData.lifeInsurance,
                health: formData.healthInsurance,
                familyDetails: formData.familyHealthDetails
            },
        
                savings: {
                    sip: formData.sip,
                    fdRd: formData.fdRd,
                    gold: formData.gold
                },
                notes: formData.notes
            };
            let res; // Declared at the top of try

        if (isEditing) {
            res = await axios.put(`${API_URL}/api/records/update`, payload, config);
        } else {
            res = await axios.post(`${API_URL}/api/records`, payload, config);
        }
        
        // --- FIXED LOGIC HERE ---
        // Use the optional chaining operator (?.) to prevent the "undefined" crash
        if (res?.data) {
            alert(`✅ Record ${isEditing ? 'Updated' : 'Created'} for ${selectedMonth}!`);
            
            if (res.data.insurance) {
                console.log("Insurance data confirmed in response.");
            }
        }

    } catch (err) {
        // This is where your console error was coming from.
        // Always check err.response for Axios errors.
        console.error("Submission Error Details:", err.response?.data || err.message);
        
        const errorMessage = err.response?.data?.message || "Server connection failed.";
        alert(`❌ Failed to save: ${errorMessage}`);
    }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>👤 Monthly Financial Tracker</h2>
                <p>Track your income and expenses for specific months.</p>
                
                <div className="month-selector">
                    <label><FaCalendarAlt /> Select Month: </label>
                    <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)} 
                        className="month-input"
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="profile-form-grid">
                
                <div className="form-section">
                    <h3>💰 Income Source</h3>
                    <div className="input-group">
                        <label>Net Earnings (Salary)</label>
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

                <h3>🛡️ Insurance Details</h3>
    <div className="grid-2-col">
        {/* Life Insurance - specifically for Single users */}
        {formData.maritalStatus === 'single' && (
            <div className="input-group">
                <label>Life Insurance EMI</label>
                <input 
                    type="number" 
                    name="lifeInsurance" 
                    placeholder="Monthly Premium" 
                    value={formData.lifeInsurance} 
                    onChange={handleChange} 
                />
            </div>
        )}

        {/* Health Insurance - Logic changes based on status */}
        <div className="input-group">
            <label>
                {formData.maritalStatus === 'married' 
                    ? "Health Insurance (Family Cover Details)" 
                    : "Personal Health Insurance"}
            </label>
            {formData.maritalStatus === 'married' ? (
                <textarea 
                    name="familyHealthDetails" 
                    placeholder="e.g. Spouse: ₹500, Child: ₹300..." 
                    value={formData.familyHealthDetails} 
                    onChange={handleChange}
                    rows="2"
                />
            ) : (
                <input 
                    type="number" 
                    name="healthInsurance" 
                    placeholder="Monthly Premium" 
                    value={formData.healthInsurance} 
                    onChange={handleChange} 
                />
            )}
        </div>
    </div>
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

                <div className="form-section">
                    <h3>📝 Notes for this Month</h3>
                    <div className="input-group">
                        <label>Any special financial events?</label>
                        <textarea 
                            name="notes" 
                            rows="3" 
                            placeholder="Example: Bought a new phone, Received bonus..." 
                            value={formData.notes} 
                            onChange={handleChange}
                        ></textarea>
                    </div>
                </div>

                <button type="submit" className="save-btn">
                    <FaSave /> {isEditing ? 'Update Record' : 'Save New Record'}
                </button>
            </form>
        </div>
    );
};

export default Profile;