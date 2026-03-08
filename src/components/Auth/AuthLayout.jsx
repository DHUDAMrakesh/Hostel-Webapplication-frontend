import React from 'react';
import { motion } from 'framer-motion';

const FEATURES = [
    { icon: '🏠', text: 'Room allocation & management' },
    { icon: '💳', text: 'Automated fee tracking & payments' },
    { icon: '🍽', text: 'Daily meals menu planning' },
    { icon: '📊', text: 'Real-time analytics dashboard' },
];

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            fontFamily: "'Inter', system-ui, sans-serif",
            background: '#050810',
            overflow: 'hidden',
        }}>
            {/* ── Left Brand Panel ─────────────────────────────────────────── */}
            <div style={{
                width: '45%',
                flexShrink: 0,
                background: 'linear-gradient(145deg, #0d0f1e 0%, #131528 40%, #1a1040 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '48px 52px',
                position: 'relative',
                overflow: 'hidden',
            }}
                className="auth-left-panel"
            >
                {/* Animated glow orbs */}
                <div style={{
                    position: 'absolute', top: '-80px', left: '-80px',
                    width: 350, height: 350, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 70%)',
                    pointerEvents: 'none', animation: 'float 7s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', right: '-60px',
                    width: 280, height: 280, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, transparent 70%)',
                    pointerEvents: 'none', animation: 'float 9s ease-in-out infinite reverse',
                }} />
                <div style={{
                    position: 'absolute', top: '50%', right: '10%',
                    width: 180, height: 180, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(8,145,178,0.18) 0%, transparent 70%)',
                    pointerEvents: 'none', animation: 'float 11s ease-in-out infinite',
                    transform: 'translateY(-50%)',
                }} />

                {/* Grid overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    pointerEvents: 'none',
                }} />

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2 }}
                >
                    <div style={{
                        width: 44, height: 44, borderRadius: 13,
                        background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 800, color: 'white',
                        boxShadow: '0 0 0 3px rgba(79,70,229,0.25), 0 8px 24px rgba(79,70,229,0.4)',
                    }}>
                        H
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '-0.2px' }}>
                            HostelOS
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Management Suite
                        </div>
                    </div>
                </motion.div>

                {/* Main pitch */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    style={{ position: 'relative', zIndex: 2 }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '5px 12px',
                        background: 'rgba(79,70,229,0.2)',
                        border: '1px solid rgba(79,70,229,0.35)',
                        borderRadius: 99, fontSize: 12, fontWeight: 600,
                        color: '#a5b4fc', marginBottom: 20, backdropFilter: 'blur(8px)',
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }} />
                        Premium Hostel Management
                    </div>

                    <h2 style={{
                        fontSize: 38, fontWeight: 800,
                        lineHeight: 1.15, letterSpacing: '-0.8px',
                        color: 'white', marginBottom: 16,
                    }}>
                        Manage your hostel{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            smarter
                        </span>
                    </h2>

                    <p style={{
                        fontSize: 15, color: 'rgba(255,255,255,0.55)',
                        lineHeight: 1.7, marginBottom: 32, maxWidth: 340,
                    }}>
                        A complete suite for room management, fee collection, and student tracking — all in one place.
                    </p>

                    {/* Feature list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={f.text}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '11px 14px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 11, backdropFilter: 'blur(8px)',
                                }}
                            >
                                <span style={{ fontSize: 18 }}>{f.icon}</span>
                                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>
                                    {f.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{ display: 'flex', gap: 28, position: 'relative', zIndex: 2 }}
                >
                    {[
                        { n: '2K+', label: 'Students managed' },
                        { n: '98%', label: 'Uptime reliability' },
                        { n: '50+', label: 'Hostels using us' },
                    ].map(s => (
                        <div key={s.label}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{s.n}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* ── Right Form Panel ─────────────────────────────────────────── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0d1a',
                padding: '40px 32px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Subtle bg pattern */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(79,70,229,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
                    style={{
                        width: '100%', maxWidth: 420,
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: 24,
                        padding: '40px 36px',
                        border: '1px solid rgba(255,255,255,0.09)',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                        position: 'relative', zIndex: 2,
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Top gradient line */}
                    <div style={{
                        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
                        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6) 50%, transparent)',
                        borderRadius: 99,
                    }} />

                    <h1 style={{
                        fontSize: 26, fontWeight: 800,
                        color: 'white', marginBottom: 8,
                        letterSpacing: '-0.5px', lineHeight: 1.2,
                    }}>
                        {title}
                    </h1>
                    <p style={{
                        fontSize: 14, color: 'rgba(255,255,255,0.45)',
                        marginBottom: 28, lineHeight: 1.6, fontWeight: 400,
                    }}>
                        {subtitle}
                    </p>

                    <div>{children}</div>

                    <div style={{
                        marginTop: 24, textAlign: 'center',
                        fontSize: 11.5, color: 'rgba(255,255,255,0.25)',
                    }}>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}
                            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.25)'}
                        >Terms of Service</a>
                        <span style={{ margin: '0 8px' }}>·</span>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}
                            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.25)'}
                        >Privacy Policy</a>
                    </div>
                </motion.div>
            </div>

            <style>{`
        @media (max-width: 800px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
        </div>
    );
};

export default AuthLayout;
