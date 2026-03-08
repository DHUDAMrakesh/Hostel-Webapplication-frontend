import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TYPE_CFG = {
    complaint: { color: '#d97706', bg: 'rgba(217,119,6,0.12)', icon: '💬' },
    payment: { color: '#059669', bg: 'rgba(5,150,105,0.12)', icon: '💳' },
    room: { color: '#0891b2', bg: 'rgba(8,145,178,0.12)', icon: '🏠' },
    system: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: '⚙' },
    default: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: '🔔' },
};

function timeAgo(date) {
    const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (sec < 60) return 'Just now';
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
}

export default function NotificationCenter({ accentColor }) {
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
        const interval = setInterval(fetchNotifications, 30000);
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
            const targetLink = notification.link.startsWith(`/${user.role}`)
                ? notification.link
                : `/${user.role}${notification.link.startsWith('/') ? '' : '/'}${notification.link}`;
            navigate(targetLink);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: isOpen ? 'rgba(99,102,241,0.12)' : 'var(--bg-elevated)',
                    border: `1px solid ${isOpen ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isOpen ? '#6366f1' : 'var(--text-secondary)',
                    position: 'relative', transition: 'all 0.2s',
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {/* Unread badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            style={{
                                position: 'absolute', top: -4, right: -4,
                                background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                                color: 'white', fontSize: 9, fontWeight: 800,
                                borderRadius: '50%', width: 17, height: 17,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid var(--bg-base)',
                                boxShadow: '0 0 8px rgba(225,29,72,0.5)',
                            }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        style={{
                            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                            width: 340, maxHeight: 440,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 16,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
                            zIndex: 1000, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '14px 18px 12px',
                            borderBottom: '1px solid var(--border-subtle)',
                            background: 'linear-gradient(to bottom, var(--bg-elevated), var(--bg-surface))',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Notifications</div>
                                {unreadCount > 0 && (
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                        {unreadCount} unread
                                    </div>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    style={{
                                        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                                        color: '#6366f1', fontSize: 11.5, fontWeight: 600,
                                        cursor: 'pointer', padding: '5px 10px', borderRadius: 8,
                                        fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                                    }}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.5 }}>🔔</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>All caught up!</div>
                                    <div style={{ fontSize: 12 }}>No notifications yet</div>
                                </div>
                            ) : (
                                notifications.map((n, i) => {
                                    const type = n.type || 'default';
                                    const cfg = TYPE_CFG[type] || TYPE_CFG.default;
                                    return (
                                        <motion.div
                                            key={n._id}
                                            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                            onClick={() => handleNotificationClick(n)}
                                            style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                background: n.isRead ? 'transparent' : cfg.bg,
                                                borderBottom: '1px solid var(--border-subtle)',
                                                display: 'flex', alignItems: 'flex-start', gap: 12,
                                                transition: 'background 0.2s',
                                                borderLeft: n.isRead ? 'none' : `3px solid ${cfg.color}`,
                                            }}
                                            whileHover={{ background: 'var(--bg-elevated)' }}
                                        >
                                            {/* Icon */}
                                            <div style={{
                                                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                                background: cfg.bg, border: `1px solid ${cfg.color}30`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 16,
                                            }}>
                                                {cfg.icon}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: n.isRead ? 500 : 700, fontSize: 13,
                                                    color: 'var(--text-primary)', lineHeight: 1.35,
                                                    marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {n.title}
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 4 }}>
                                                    {n.message}
                                                </div>
                                                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                                                    {timeAgo(n.createdAt)}
                                                </div>
                                            </div>

                                            {!n.isRead && (
                                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}`, flexShrink: 0, marginTop: 5 }} />
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
