'use client';

import { useState, useEffect } from 'react';
import { getDailyQuota } from '@/lib/quota';

export default function AiQuotaBadge() {
  const [quota, setQuota] = useState<{
    used: number;
    max: number;
    remaining: number;
    hoursUntilReset: number;
    isLimitReached: boolean;
  } | null>(null);

  useEffect(() => {
    updateQuota();
    // Re-check every 30 seconds or on window focus
    const interval = setInterval(updateQuota, 30000);
    window.addEventListener('focus', updateQuota);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', updateQuota);
    };
  }, []);

  const updateQuota = () => {
    setQuota(getDailyQuota());
  };

  if (!quota) return null;

  const isLow = quota.remaining <= 5 && quota.remaining > 0;
  const isOut = quota.isLimitReached;

  const badgeColor = isOut 
    ? '#ef4444' 
    : isLow 
    ? '#f59e0b' 
    : '#10b981';

  const badgeBg = isOut 
    ? 'rgba(239, 68, 68, 0.12)' 
    : isLow 
    ? 'rgba(245, 158, 11, 0.12)' 
    : 'rgba(16, 185, 129, 0.12)';

  const badgeBorder = isOut 
    ? 'rgba(239, 68, 68, 0.25)' 
    : isLow 
    ? 'rgba(245, 158, 11, 0.25)' 
    : 'rgba(16, 185, 129, 0.25)';

  return (
    <div 
      title={`AI Quota: ${quota.used}/${quota.max} questions used today. Resets in ~${quota.hoursUntilReset}h.`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.35rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        background: badgeBg,
        border: `1px solid ${badgeBorder}`,
        fontSize: '0.78rem',
        fontWeight: 600,
        color: badgeColor,
        letterSpacing: '0.01em',
        userSelect: 'none',
        cursor: 'help',
        transition: 'all var(--transition-normal)'
      }}
    >
      <span style={{ fontSize: '0.85rem' }}>⚡</span>
      <span>
        {isOut ? (
          'Daily AI Limit Reached'
        ) : (
          `${quota.used} / ${quota.max} AI Questions`
        )}
      </span>
    </div>
  );
}
