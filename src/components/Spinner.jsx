import React from 'react';

/**
 * Modern dual-ring spinner with optional label.
 * Sizes: 'sm' | 'md' | 'lg' | 'xl'
 * Variants: 'primary' | 'white' | 'muted'
 */
export default function Spinner({ size = 'md', variant = 'primary', label = '', inline = false }) {
  const sizes = {
    xs:  { ring: 14, border: 2 },
    sm:  { ring: 20, border: 2.5 },
    md:  { ring: 32, border: 3 },
    lg:  { ring: 48, border: 4 },
    xl:  { ring: 64, border: 5 },
  };

  const colors = {
    primary: { track: '#e0e7ff', spin: '#4f46e5' },
    blue:    { track: '#dbeafe', spin: '#3b82f6' },
    white:   { track: 'rgba(255,255,255,0.25)', spin: '#ffffff' },
    muted:   { track: '#e2e8f0', spin: '#94a3b8' },
  };

  const { ring, border } = sizes[size] || sizes.md;
  const { track, spin } = colors[variant] || colors.primary;

  const style = {
    wrapper: {
      display: inline ? 'inline-flex' : 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
    },
    outer: {
      width: ring,
      height: ring,
      borderRadius: '50%',
      border: `${border}px solid ${track}`,
      borderTopColor: spin,
      animation: 'rma-spin 0.75s linear infinite',
      flexShrink: 0,
    },
    label: {
      fontSize: '13px',
      fontWeight: 500,
      color: variant === 'white' ? 'rgba(255,255,255,0.8)' : '#64748b',
      letterSpacing: '0.02em',
    },
  };

  return (
    <span style={style.wrapper}>
      <span style={style.outer} />
      {label && <span style={style.label}>{label}</span>}
    </span>
  );
}

/**
 * Full-page loading overlay — used when app data is loading.
 */
export function PageLoader({ label = 'Loading...' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
      zIndex: 9999,
      gap: '24px',
    }}>
      {/* Animated logo mark */}
      <div style={{ position: 'relative', width: '72px', height: '72px' }}>
        {/* Outer ring */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '3px solid #e0e7ff',
          borderTopColor: '#4f46e5',
          animation: 'rma-spin 1s linear infinite',
        }} />
        {/* Inner ring (counter-spin) */}
        <div style={{
          position: 'absolute', inset: '10px',
          borderRadius: '50%',
          border: '3px solid #fce7f3',
          borderBottomColor: '#a855f7',
          animation: 'rma-spin 0.65s linear infinite reverse',
        }} />
        {/* Center dot */}
        <div style={{
          position: 'absolute', inset: '22px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #a855f7)',
          animation: 'rma-pulse 1.5s ease-in-out infinite',
        }} />
      </div>

      {/* Brand + label */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          margin: 0, fontSize: '15px', fontWeight: 700,
          background: 'linear-gradient(135deg, #4f46e5, #a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '0.05em',
        }}>
          AVXPERTS
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
          {label}
        </p>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#4f46e5',
            animation: `rma-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            opacity: 0.7,
          }} />
        ))}
      </div>
    </div>
  );
}

/**
 * Inline card-level skeleton loader — shows shimmering placeholder rows.
 */
export function SkeletonLoader({ rows = 5 }) {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          height: '52px', borderRadius: '10px',
          background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
          backgroundSize: '200% 100%',
          animation: `rma-shimmer 1.4s ease-in-out ${i * 0.08}s infinite`,
          opacity: 1 - i * 0.12,
        }} />
      ))}
    </div>
  );
}
