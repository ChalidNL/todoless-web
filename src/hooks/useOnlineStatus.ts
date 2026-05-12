/**
 * React hook for online/offline status.
 * Returns { isOnline, status, pendingMutations, isSyncing }.
 */

import { useState, useEffect } from 'react';
import { syncEngine } from '../lib/sync-engine';
import * as offline from '../lib/offline-store';

export interface OnlineStatusInfo {
  isOnline: boolean;
  status: 'online' | 'offline';
  pendingMutations: number;
  isSyncing: boolean;
}

export function useOnlineStatus(): OnlineStatusInfo {
  const [isOnline, setIsOnline] = useState(() => syncEngine.isOnline());
  const [pendingMutations, setPendingMutations] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check pending mutations count
    offline.hasPendingMutations().then((has) => setPendingMutations(has ? 1 : 0));

    const unsub = syncEngine.onChange((status) => {
      setIsOnline(status === 'online');
      // Re-check pending mutations after status change
      offline.hasPendingMutations().then((has) => setPendingMutations(has ? 1 : 0));
    });

    return unsub;
  }, []);

  return {
    isOnline,
    status: isOnline ? 'online' : 'offline',
    pendingMutations,
    isSyncing,
  };
}
