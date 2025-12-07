import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCog, FaLock, FaSave, FaUser, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // State for Profile Update
    const [username, setUsername] = useState('');
    
    // State for Password Update
    const [passData, setPassData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // UI States
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ type: '', msg: '' });

    // Fetch current user data on load
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${API_URL}/api/auth/me`, {
                    headers: { 'x-auth-token': token }
                });
                setUsername(res.data.username);
            } catch (err) {
                console.error("Failed to load user data");
            }
        };
        fetchUserData();
    }, [API_URL]);

    // Handle Profile Update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            await axios.put(`${API_URL}/api/auth/update-details`, 
                { username }, 
                { headers: { 'x-auth-token': token } }
            );
            setAlert({ type: 'success', msg: 'Profile updated successfully!' });
        } catch (err) {
            setAlert({ type: 'error', msg: err.response?.data?.msg || 'Update failed' });
        } finally {
            setLoading(false);
            setTimeout(() => setAlert({ type: '', msg: '' }), 3000);
        }
    };

    // Handle Password Update
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            setAlert({ type: 'error', msg: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            await axios.put(`${API_URL}/api/auth/update-password`, 
                { 
                    currentPassword: passData.currentPassword,
                    newPassword: passData.newPassword 
                }, 
                { headers: { 'x-auth-token': token } }
            );
            setAlert({ type: 'success', msg: 'Password changed successfully!' });
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setAlert({ type: 'error', msg: err.response?.data?.msg || 'Failed to update password' });
        } finally {
            setLoading(false);
            setTimeout(() => setAlert({ type: '', msg: '' }), 3000);
        }
    };

    return (
        <div className="settings-container">
            {/* Header */}
            <div className="settings-header">
                <div className="header-icon">
                    <FaUserCog />
                </div>
                <div>
                    <h2>Account Settings</h2>
                    <p>Manage your profile and security preferences</p>
                </div>
            </div>

            {/* Alert Box */}
            {alert.msg && (
                <div className={`settings-alert ${alert.type}`}>
                    {alert.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    <span>{alert.msg}</span>
                </div>
            )}

            <div className="settings-grid">
                
                {/* --- Profile Section --- */}
                <div className="settings-card">
                    <div className="card-header">
                        <h3><FaUser /> Profile Details</h3>
                    </div>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="form-group">
                            <label>Display Name</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                        </button>
                    </form>
                </div>

                {/* --- Security Section --- */}
                <div className="settings-card">
                    <div className="card-header">
                        <h3><FaLock /> Security</h3>
                    </div>
                    <form onSubmit={handlePasswordUpdate}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input 
                                type="password" 
                                value={passData.currentPassword}
                                onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                                placeholder="Enter current password"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input 
                                type="password" 
                                value={passData.newPassword}
                                onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input 
                                type="password" 
                                value={passData.confirmPassword}
                                onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                        
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : <><FaLock /> Update Password</>}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Settings;