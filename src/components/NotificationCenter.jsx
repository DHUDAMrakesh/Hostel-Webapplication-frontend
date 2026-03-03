import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationCenter() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        setIsOpen(false);
        if (notification.link) {
            // Adjust link to include role prefix if needed
            const targetLink = notification.link.startsWith(`/${user.role}`)
                ? notification.link
                : `/${user.role}${notification.link.startsWith('/') ? '' : '/'}${notification.link}`;
            navigate(targetLink);
        }
    };

    return (
        <div className="notification-center" style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)'
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: '#ef4444',
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 'bold',
                        borderRadius: '50%',
                        width: 16,
                        height: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--bg-surface)'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 10,
                            width: 320,
                            maxHeight: 400,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 12,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            zIndex: 1000,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', padding: 0 }}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, padding: 8 }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n._id}
                                        onClick={() => handleNotificationClick(n)}
                                        style={{
                                            padding: 12,
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            background: n.isRead ? 'transparent' : 'var(--bg-elevated)',
                                            marginBottom: 4,
                                            transition: 'background 0.2s',
                                            position: 'relative'
                                        }}
                                        className="notification-item"
                                    >
                                        {!n.isRead && (
                                            <div style={{ position: 'absolute', left: 4, top: 16, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                                        )}
                                        <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: 13, marginBottom: 2, paddingLeft: 8 }}>
                                            {n.title}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 8, lineHeight: 1.4 }}>
                                            {n.message}
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 8, marginTop: 4 }}>
                                            {new Date(n.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                .notification-item:hover {
                    background: var(--bg-elevated) !important;
                }
            `}</style>
        </div>
    );
}
