import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWallet, FaShoppingBag, FaFilm, FaHamburger, FaBolt, FaPlus, FaCog } from 'react-icons/fa';
import './WalletWidget.css';

const WalletWidget = ({ onSetupComplete }) => {
    const [balance, setBalance] = useState(null); 
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [view, setView] = useState('card'); 
    const [setupLimit, setSetupLimit] = useState(''); 

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const currentMonth = new Date().toISOString().slice(0, 7);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        const token = localStorage.getItem('token');
        try {
            
            const res = await axios.get(`${API_URL}/api/records?month=${currentMonth}`, {
                headers: { 'x-auth-token': token }
            });
            
            if (res.data && res.data.wallet && res.data.wallet.limit > 0) {
                setBalance(res.data.wallet);
            } else {
                setBalance(null); 
            }
        } catch (err) {
            console.error("Wallet Fetch Error:", err);
        }
    };
    
    const handleSetup = async () => {
        if (!setupLimit) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/api/wallet/setup`, {
                month: currentMonth,
                limit: setupLimit
            }, { headers: { 'x-auth-token': token } });
            
            fetchWalletData(); 
            
            // 2. Call the prop to notify Dashboard
            if(onSetupComplete) onSetupComplete(); 

        } catch (err) {
            alert("Setup Failed");
        }
    };

    const handlePay = async () => {
        if (!amount) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/api/wallet/spend`, {
                amount: amount,
                category: category,
                title: `Quick: ${category}`
            }, { headers: { 'x-auth-token': token } });
            
            fetchWalletData();
            setAmount('');
            setView('card');
            window.dispatchEvent(new Event('notificationUpdate'));
        } catch (err) {
            alert("Payment Failed");
        }
    };

    const handleNumClick = (num) => {
        if (amount.length < 5) setAmount(amount + num);
    };

    if (!balance) {
        return (
            <div className="wallet-wrapper">
                <div className="wallet-setup-card">
                    <div className="setup-icon"><FaWallet /></div>
                    <h3>Activate Daily Wallet</h3>
                    <p>Set a monthly limit for small daily expenses.</p>
                    <div className="setup-input-group">
                        <span>₹</span>
                        <input 
                            type="number" 
                            placeholder="e.g. 2000" 
                            value={setupLimit}
                            onChange={(e) => setSetupLimit(e.target.value)}
                        />
                    </div>
                    <button className="activate-btn" onClick={handleSetup}>Create Wallet</button>
                </div>
            </div>
        );
    }

    // 2. Normal Wallet View
    const remaining = balance.limit - balance.spent;
    const progress = Math.min(100, (balance.spent / (balance.limit || 1)) * 100);

    return (
        <div className="wallet-wrapper">
            {view === 'card' ? (
                <div className="wallet-card">
                    <div className="wallet-top">
                        <span className="chip"><FaWallet /> FinSync Pay</span>
                        <span className="wifi-icon">)))</span>
                    </div>
                    <div className="wallet-mid">
                        <small>Daily Allowance Balance</small>
                        <h2>₹{remaining.toLocaleString()}</h2>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{width: `${progress}%`, background: remaining < 0 ? '#ef4444' : '#fff'}}></div>
                        </div>
                        <small>{balance.spent} / {balance.limit} Used</small>
                    </div>
                    <button className="fab-add" onClick={() => setView('pay')}><FaPlus /></button>
                </div>
            ) : (
                <div className="wallet-pay-mode">
                    <div className="pay-display">
                        <span className="currency">₹</span>
                        <span className="amount-text">{amount || '0'}</span>
                        <span className="cat-badge">{category}</span>
                    </div>
                    
                    <div className="cat-selector">
                        <button onClick={() => setCategory('Food')} className={category==='Food'?'active':''}><FaHamburger/></button>
                        <button onClick={() => setCategory('Shopping')} className={category==='Shopping'?'active':''}><FaShoppingBag/></button>
                        <button onClick={() => setCategory('Movies')} className={category==='Movies'?'active':''}><FaFilm/></button>
                        <button onClick={() => setCategory('Misc')} className={category==='Misc'?'active':''}><FaBolt/></button>
                    </div>

                    <div className="numpad">
                        {[1,2,3,4,5,6,7,8,9, 'C', 0].map(n => (
                            <button key={n} onClick={() => n === 'C' ? setAmount('') : handleNumClick(n)}>
                                {n}
                            </button>
                        ))}
                        <button className="pay-btn" onClick={handlePay}>PAY</button>
                    </div>
                    <button className="close-btn" onClick={() => setView('card')}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default WalletWidget;