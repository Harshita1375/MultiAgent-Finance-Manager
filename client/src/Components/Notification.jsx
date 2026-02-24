import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios';
import { FaExclamationTriangle, FaInfoCircle, FaTimesCircle, FaCheckCircle, FaCheckDouble } from 'react-icons/fa';
import './Notification.css';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const hasChecked = useRef(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            if (!hasChecked.current) {
                hasChecked.current = true;
                await axios.post(`${API_URL}/api/notifications/generate`, {}, { headers: { 'x-auth-token': token } });
                
                window.dispatchEvent(new Event('notificationUpdate'));
            }

            const res = await axios.get(`${API_URL}/api/notifications`, {
                headers: { 'x-auth-token': token }
            });
            setNotifications(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Error:", err);
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${API_URL}/api/notifications/read`, {}, { headers: { 'x-auth-token': token } });
            
            window.dispatchEvent(new Event('notificationUpdate'));

            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        fetchNotifications();
    }, []);


    const getIcon = (type) => {
        switch(type) {
            case 'warning': return <FaExclamationTriangle className="note-icon warning" />;
            case 'danger': return <FaTimesCircle className="note-icon danger" />;
            case 'success': return <FaCheckCircle className="note-icon success" />;
            default: return <FaInfoCircle className="note-icon info" />;
        }
    };

    return (
        <div className="notification-page">
            <div className="notification-header">
                <h2>Notifications</h2>
                {notifications.some(n => !n.isRead) && (
                    <button className="mark-read-btn" onClick={markAllRead}>
                        <FaCheckDouble /> Mark all as Read
                    </button>
                )}
            </div>

            <div className="notification-list-container">
                {loading ? (
                    <p className="loading-text">Checking for updates...</p>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <p>No new notifications. Your finances are looking good! 🎉</p>
                    </div>
                ) : (
                    notifications.map((note) => (
                        <div key={note._id} className={`notification-card ${!note.isRead ? 'unread' : ''}`}>
                            <div className="card-icon">
                                {getIcon(note.type)}
                            </div>
                            <div className="card-content">
                                <div className="card-top">
                                    <span className="note-title">{note.title}</span>
                                    <span className="note-date">{new Date(note.date).toLocaleDateString()}</span>
                                </div>
                                <p className="note-message">{note.message}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notification;