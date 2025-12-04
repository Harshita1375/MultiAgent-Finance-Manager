import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileDownload, FaHistory } from 'react-icons/fa';
import DateFilter from './DateFilter'; // Reusing your new component!
import './Profile.css'; // Reusing profile styles for table

const TransactionHistory = () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // State managed here specifically for this page
    const [viewMode, setViewMode] = useState('all'); 
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParam = viewMode === 'all' ? 'all' : selectedMonth;
            
            try {
                // Using existing analyze endpoint which returns a combined list
                const res = await axios.get(`${API_URL}/api/records/analyze?month=${queryParam}`, {
                    headers: { 'x-auth-token': token }
                });
                if (res.data && res.data.transactions) {
                    setTransactions(res.data.transactions);
                } else {
                    setTransactions([]);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchHistory();
    }, [viewMode, selectedMonth, API_URL]);

    const downloadCSV = () => {
        if (transactions.length === 0) return alert("No data to download.");
        
        const headers = ["Date", "Title", "Category", "Type", "Amount"];
        const rows = transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.title,
            t.category,
            t.type,
            t.amount
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `history_${viewMode === 'all' ? 'all_time' : selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="header-top-row">
                    <h2><FaHistory /> Transaction History</h2>
                    
                    {/* Reusable Date Component */}
                    <DateFilter 
                        viewMode={viewMode} 
                        setViewMode={setViewMode}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                    />
                </div>
                
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button className="download-btn" onClick={downloadCSV}>
                        <FaFileDownload /> Download CSV
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
                {loading ? <p className="no-data-cell">Loading...</p> : (
                    <table className="history-table">
                        <thead>
                            <tr><th>Date</th><th>Title</th><th>Category</th><th>Type</th><th>Amount</th></tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? transactions.map((t, idx) => (
                                <tr key={idx}>
                                    <td>{new Date(t.date).toLocaleDateString()}</td>
                                    <td>{t.title}</td>
                                    <td><span className="badge-cat">{t.category}</span></td>
                                    <td><span className={`badge-type ${t.type}`}>{t.type ? t.type.toUpperCase() : 'MISC'}</span></td>
                                    <td className="amount-col">₹{t.amount}</td>
                                </tr>
                            )) : <tr><td colSpan="5" className="no-data-cell">No transactions found for this period.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;