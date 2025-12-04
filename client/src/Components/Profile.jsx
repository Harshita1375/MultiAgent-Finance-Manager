import React, { useState, useEffect } from 'react'; 
import { FaSave, FaCalendarAlt, FaHistory, FaUserEdit, FaCog, FaFileDownload, FaRedo } from 'react-icons/fa'; 
import './Profile.css'; 
import axios from 'axios';

const Profile = ({ userName }) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // --- STATE MANAGEMENT ---
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [isEditing, setIsEditing] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('edit'); // 'edit', 'history', 'settings'
    const [allTransactions, setAllTransactions] = useState([]); // For History Tab

    const [formData, setFormData] = useState({
        netEarnings: '',
        emi: '', rent: '', grocery: '', electricity: '',
        otherBills: '', subscriptions: '', petrol: '', otherExpense: '',
        maritalStatus: 'single', hasChildren: 'no', schoolFees: '',
        partyBudget: '',
        sip: '', fdRd: '', gold: '',
        notes: ''
    });

    // --- DATA FETCHING ---
    const fetchProfileData = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_URL}/api/records?month=${selectedMonth}`, {
                headers: { 'x-auth-token': token }
            });
            
            if (res.data && res.data.month) {
                setIsEditing(true);
                const d = res.data;
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
                    maritalStatus: 'single', hasChildren: 'no', schoolFees: '', 
                    partyBudget: '',
                    sip: d.savings?.sip || '',
                    fdRd: d.savings?.fdRd || '',
                    gold: d.savings?.gold || '',
                    notes: d.notes || ''
                });
            } else {
                setIsEditing(false);
                // Reset to empty/defaults
                setFormData(prev => ({ 
                    ...prev, 
                    netEarnings: '', emi: '', rent: '', grocery: '', electricity: '', 
                    otherBills: '', subscriptions: '', petrol: '', otherExpense: '', 
                    sip: '', fdRd: '', gold: '', notes: '' 
                }));
            }
        } catch (err) { 
            console.error("Error fetching record:", err); 
        }
    };

    const fetchHistory = async () => {
        const token = localStorage.getItem('token');
        try {
            // Using the existing analyze endpoint with 'month=all' to get the full flattened list
            const res = await axios.get(`${API_URL}/api/records/analyze?month=all`, {
                headers: { 'x-auth-token': token }
            });
            if (res.data && res.data.transactions) {
                setAllTransactions(res.data.transactions);
            }
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    // Initial Load & Refresh Logic
    useEffect(() => {
        if (activeSubTab === 'edit') {
            fetchProfileData();
        } else if (activeSubTab === 'history') {
            fetchHistory();
        }
    }, [selectedMonth, activeSubTab, API_URL]);

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };

            const payload = {
                month: selectedMonth,
                income: formData.netEarnings,
                expenses: {
                    emi: formData.emi, rent: formData.rent, grocery: formData.grocery,
                    electricity: formData.electricity, otherBills: formData.otherBills,
                    subscriptions: formData.subscriptions, petrol: formData.petrol,
                    otherExpense: formData.otherExpense
                },
                savings: { sip: formData.sip, fdRd: formData.fdRd, gold: formData.gold },
                notes: formData.notes
            };

            if (isEditing) {
                await axios.put(`${API_URL}/api/records/update`, payload, config);
                alert(`✅ Record Updated for ${selectedMonth}!`);
            } else {
                await axios.post(`${API_URL}/api/records`, payload, config);
                alert(`✅ Record Created for ${selectedMonth}!`);
            }
            fetchProfileData(); // Refresh after save
        } catch (err) {
            console.error(err);
            alert("❌ Error saving profile. Please try again.");
        }
    };

    const downloadCSV = () => {
        if (allTransactions.length === 0) return alert("No transactions to download.");

        const headers = ["Date", "Title", "Category", "Type", "Amount"];
        const rows = allTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.title,
            t.category,
            t.type,
            t.amount
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `transaction_history_${userName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="profile-container">
            {/* --- HEADER --- */}
            <div className="profile-header">
                <div className="header-top-row">
                    <h2>👤 Financial Profile</h2>
                    <button className="refresh-btn" onClick={() => activeSubTab === 'edit' ? fetchProfileData() : fetchHistory()} title="Refresh Data">
                        <FaRedo /> Refresh
                    </button>
                </div>
                
                {/* SUB-NAVIGATION TABS */}
                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeSubTab === 'edit' ? 'active' : ''}`} 
                        onClick={() => setActiveSubTab('edit')}
                    >
                        <FaUserEdit /> Edit Monthly Record
                    </button>
                    <button 
                        className={`tab-btn ${activeSubTab === 'history' ? 'active' : ''}`} 
                        onClick={() => setActiveSubTab('history')}
                    >
                        <FaHistory /> Transaction History
                    </button>
                    <button 
                        className={`tab-btn ${activeSubTab === 'settings' ? 'active' : ''}`} 
                        onClick={() => setActiveSubTab('settings')}
                    >
                        <FaCog /> Settings
                    </button>
                </div>
            </div>

            {/* --- TAB CONTENT: EDIT PROFILE --- */}
            {activeSubTab === 'edit' && (
                <>
                    <div className="month-selector-wrapper">
                        <label><FaCalendarAlt /> Select Month to Edit: </label>
                        <input 
                            type="month" 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)} 
                            className="month-input"
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form-grid">
                        <div className="form-section">
                            <h3>💰 Income Source</h3>
                            <div className="input-group">
                                <label>Net Earnings (Salary)</label>
                                <input type="number" name="netEarnings" placeholder="e.g. 50000" value={formData.netEarnings} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>📉 Fixed Monthly Expenses</h3>
                            <div className="grid-2-col">
                                <div className="input-group"><label>EMI / Loans</label><input type="number" name="emi" value={formData.emi} onChange={handleChange} /></div>
                                <div className="input-group"><label>House Rent</label><input type="number" name="rent" value={formData.rent} onChange={handleChange} /></div>
                                <div className="input-group"><label>Groceries</label><input type="number" name="grocery" value={formData.grocery} onChange={handleChange} /></div>
                                <div className="input-group"><label>Electricity Bills</label><input type="number" name="electricity" value={formData.electricity} onChange={handleChange} /></div>
                                <div className="input-group"><label>Mobile / TV / Internet</label><input type="number" name="otherBills" value={formData.otherBills} onChange={handleChange} /></div>
                                <div className="input-group"><label>OTT & Subscriptions</label><input type="number" name="subscriptions" value={formData.subscriptions} onChange={handleChange} /></div>
                                <div className="input-group"><label>Petrol / Transport</label><input type="number" name="petrol" value={formData.petrol} onChange={handleChange} /></div>
                                <div className="input-group"><label>Other Miscellaneous</label><input type="number" name="otherExpense" value={formData.otherExpense} onChange={handleChange} /></div>
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
                                    <input type="number" name="partyBudget" value={formData.partyBudget} onChange={handleChange} />
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
                                        <input type="number" name="schoolFees" value={formData.schoolFees} onChange={handleChange} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>🐷 Current Savings & Assets</h3>
                            <div className="grid-3-col">
                                <div className="input-group"><label>SIP (Mutual Funds)</label><input type="number" name="sip" value={formData.sip} onChange={handleChange} /></div>
                                <div className="input-group"><label>FD / RD</label><input type="number" name="fdRd" value={formData.fdRd} onChange={handleChange} /></div>
                                <div className="input-group"><label>Gold</label><input type="number" name="gold" value={formData.gold} onChange={handleChange} /></div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>📝 Notes for this Month</h3>
                            <div className="input-group">
                                <label>Any special financial events?</label>
                                <textarea name="notes" rows="3" placeholder="Example: Bought a new phone..." value={formData.notes} onChange={handleChange}></textarea>
                            </div>
                        </div>

                        <button type="submit" className="save-btn">
                            <FaSave /> {isEditing ? 'Update Record' : 'Save New Record'}
                        </button>
                    </form>
                </>
            )}

            {/* --- TAB CONTENT: TRANSACTION HISTORY --- */}
            {activeSubTab === 'history' && (
                <div className="history-section">
                    <div className="history-controls">
                        <h3>📜 Full Transaction History</h3>
                        <button className="download-btn" onClick={downloadCSV}>
                            <FaFileDownload /> Download CSV
                        </button>
                    </div>
                    
                    <div className="table-wrapper">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allTransactions.length > 0 ? (
                                    allTransactions.map((t, idx) => (
                                        <tr key={idx}>
                                            <td>{new Date(t.date).toLocaleDateString()}</td>
                                            <td>{t.title}</td>
                                            <td><span className="badge-cat">{t.category}</span></td>
                                            <td>
                                                <span className={`badge-type ${t.type}`}>
                                                    {t.type ? t.type.toUpperCase() : 'MISC'}
                                                </span>
                                            </td>
                                            <td className="amount-col">₹{t.amount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="no-data-cell">No transactions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- TAB CONTENT: SETTINGS --- */}
            {activeSubTab === 'settings' && (
                <div className="settings-section">
                    <h3>⚙️ User Settings</h3>
                    <p>Settings configuration will be available in the next update.</p>
                </div>
            )}
        </div>
    );
};

export default Profile;