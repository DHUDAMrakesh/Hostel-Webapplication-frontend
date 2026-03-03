import React from 'react';

/* ─────────────────────────────────────────────────────────────
   Skeleton — Animated shimmer placeholders for loading states.
   Replaces spinning circles with content-shaped placeholders
   that eliminate Cumulative Layout Shift (CLS).
───────────────────────────────────────────────────────────── */

const shimmer = {
    background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-surface) 50%, var(--bg-elevated) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 8,
};

/** Single shimmer block */
export function SkeletonBlock({ width = '100%', height = 16, radius = 8, style = {} }) {
    return (
        <div style={{ ...shimmer, width, height, borderRadius: radius, ...style }} />
    );
}

/** Stat card skeleton — matches the stat strip on Dashboard / Rooms */
export function SkeletonStat() {
    return (
        <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SkeletonBlock width={32} height={32} radius={10} />
            <SkeletonBlock width="60%" height={22} />
            <SkeletonBlock width="40%" height={12} />
        </div>
    );
}

/** Row skeleton — matches a table or list row */
export function SkeletonRow({ cols = 4 }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 12, background: 'var(--bg-elevated)' }}>
            <SkeletonBlock width={36} height={36} radius="50%" style={{ flexShrink: 0 }} />
            {Array.from({ length: cols }).map((_, i) => (
                <SkeletonBlock key={i} width={`${Math.floor(Math.random() * 30) + 15}%`} height={14} />
            ))}
        </div>
    );
}

/** Card skeleton — matches a Room card or Student card */
export function SkeletonCard() {
    return (
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <SkeletonBlock width={46} height={46} radius={14} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <SkeletonBlock width="70%" height={16} />
                    <SkeletonBlock width="45%" height={12} />
                </div>
            </div>
            <SkeletonBlock width="100%" height={6} radius={4} />
            <SkeletonBlock width="50%" height={11} />
        </div>
    );
}

/** Full page skeleton — stat strip + grid of cards */
export function SkeletonPage({ cards = 6, stats = 4, rows = false }) {
    return (
        <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <SkeletonBlock width={80} height={12} style={{ marginBottom: 10 }} />
                <SkeletonBlock width={180} height={30} style={{ marginBottom: 8 }} />
                <SkeletonBlock width={260} height={13} />
            </div>
            {/* Stat strip */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats}, 1fr)`, gap: 14, marginBottom: 24 }}>
                {Array.from({ length: stats }).map((_, i) => <SkeletonStat key={i} />)}
            </div>
            {/* Content */}
            {rows ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Array.from({ length: cards }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                    {Array.from({ length: cards }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}
        </div>
    );
}
