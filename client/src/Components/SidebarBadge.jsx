import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SidebarBadge.css';

const SidebarBadge = () => {
    const [count, setCount] = useState(0);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchUnreadCount = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/api/notifications`, {
                headers: { 'x-auth-token': token }
            });
            const unread = res.data.filter(n => !n.isRead).length;
            setCount(unread);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 5000); 
        const handleUpdate = () => fetchUnreadCount();
        window.addEventListener('notificationUpdate', handleUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notificationUpdate', handleUpdate);
        };
    }, []);

    if (count === 0) return null;

    return (
        <span className="sidebar-badge">{count > 9 ? '9+' : count}</span>
    );
};

export default SidebarBadge;