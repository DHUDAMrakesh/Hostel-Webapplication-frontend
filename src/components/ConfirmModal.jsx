import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ConfirmModal — a beautiful in-UI replacement for window.confirm
 *
 * Props:
 *   open        {boolean}  — whether to show the modal
 *   title       {string}   — bold headline
 *   message     {string}   — body text / question
 *   confirmText {string}   — label for confirm button  (default: "Delete")
 *   cancelText  {string}   — label for cancel button   (default: "Cancel")
 *   danger      {boolean}  — red confirm button (default: true)
 *   onConfirm   {fn}       — called when user clicks confirm
 *   onCancel    {fn}       — called when user clicks cancel or backdrop
 *   icon        {string}   — emoji icon (optional)
 */
export default function ConfirmModal({
    open,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    danger = true,
    onConfirm,
    onCancel,
    icon = '🗑',
}) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="confirm-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={(e) => e.target === e.currentTarget && onCancel?.()}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: 'rgba(10,15,30,0.55)',
                        backdropFilter: 'blur(6px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                    }}
                >
                    <motion.div
                        key="confirm-box"
                        initial={{ opacity: 0, scale: 0.88, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 16 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                        style={{
                            background: 'var(--bg-base)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 20,
                            width: '100%',
                            maxWidth: 420,
                            overflow: 'hidden',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
                            fontFamily: 'Outfit, sans-serif',
                        }}
                    >
                        {/* Icon banner */}
                        <div style={{
                            padding: '28px 28px 0',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 14,
                        }}>
                            <div style={{
                                width: 62,
                                height: 62,
                                borderRadius: 18,
                                background: danger
                                    ? 'rgba(225,29,72,0.1)'
                                    : 'rgba(217,119,6,0.1)',
                                border: danger
                                    ? '1.5px solid rgba(225,29,72,0.25)'
                                    : '1.5px solid rgba(217,119,6,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 28,
                                boxShadow: danger
                                    ? '0 4px 20px rgba(225,29,72,0.15)'
                                    : '0 4px 20px rgba(217,119,6,0.15)',
                            }}>
                                {icon}
                            </div>

                            <div style={{ textAlign: 'center', paddingBottom: 8 }}>
                                <div style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    marginBottom: 6,
                                    letterSpacing: '-0.01em',
                                }}>
                                    {title}
                                </div>
                                <div style={{
                                    fontSize: 14,
                                    color: 'var(--text-muted)',
                                    lineHeight: 1.55,
                                    maxWidth: 300,
                                    margin: '0 auto',
                                }}>
                                    {message}
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{
                            height: 1,
                            background: 'var(--border-subtle)',
                            margin: '20px 0 0',
                        }} />

                        {/* Action buttons */}
                        <div style={{
                            display: 'flex',
                            gap: 10,
                            padding: '16px 24px 20px',
                        }}>
                            {/* Cancel */}
                            <button
                                onClick={onCancel}
                                style={{
                                    flex: 1,
                                    padding: '11px 0',
                                    borderRadius: 12,
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    fontFamily: 'Outfit, sans-serif',
                                    cursor: 'pointer',
                                    transition: 'all 0.18s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                            >
                                {cancelText}
                            </button>

                            {/* Confirm */}
                            <button
                                onClick={onConfirm}
                                style={{
                                    flex: 1,
                                    padding: '11px 0',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: danger
                                        ? 'linear-gradient(135deg, #e11d48, #be123c)'
                                        : 'linear-gradient(135deg, #d97706, #b45309)',
                                    color: '#fff',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    fontFamily: 'Outfit, sans-serif',
                                    cursor: 'pointer',
                                    boxShadow: danger
                                        ? '0 4px 16px rgba(225,29,72,0.35)'
                                        : '0 4px 16px rgba(217,119,6,0.35)',
                                    transition: 'all 0.18s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
