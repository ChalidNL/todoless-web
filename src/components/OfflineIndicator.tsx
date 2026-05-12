import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * Small banner shown when offline or syncing.
 * Home Assistant style: top bar, subtle color.
 */
export const OfflineIndicator: React.FC = () => {
  const { isOnline, pendingMutations } = useOnlineStatus();

  if (isOnline && pendingMutations === 0) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: '8px 16px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: 500,
    color: '#fff',
    background: isOnline ? '#059669' : '#dc2626',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'background 0.3s ease',
  };

  const message = !isOnline
    ? `🔴 Offline — ${pendingMutations > 0 ? `${pendingMutations} change${pendingMutations > 1 ? 's' : ''} queued` : 'Changes will sync when reconnected'}`
    : `🟢 Synced — ${pendingMutations} pending`;

  return <div style={style}>{message}</div>;
};
