import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { admin: 'Admin', manager: 'Manager', student: 'Student' };

export default function Unauthorized() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f0f0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                    textAlign: 'center',
                    padding: '60px 40px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    maxWidth: 460,
                    width: '90%',
                }}
            >
                {/* Icon */}
                <div style={{
                    width: 80, height: 80,
                    borderRadius: '50%',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 28px',
                    fontSize: 36,
                }}>
                    🚫
                </div>

                <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
                    Access Denied
                </h1>
                <p style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
                    You don't have permission to view this page.
                </p>
                {user && (
                    <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 32 }}>
                        Your current role is{' '}
                        <span style={{
                            color: '#fff',
                            fontWeight: 600,
                            background: 'rgba(255,255,255,0.08)',
                            padding: '2px 8px',
                            borderRadius: 6,
                        }}>
                            {ROLE_LABELS[user.role] || user.role}
                        </span>
                        . Contact an Admin to request elevated access.
                    </p>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '10px 24px',
                            borderRadius: 50,
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'transparent',
                            color: '#e5e7eb',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        ← Go Back
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(`/${user?.role || 'student'}/dashboard`)}
                        style={{
                            padding: '10px 24px',
                            borderRadius: 50,
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            border: 'none',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        Go to Dashboard
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
