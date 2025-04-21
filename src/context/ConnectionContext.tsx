
import React, { createContext, useContext } from 'react';
import { useUserConnections, Connection } from '@/hooks/useUserConnections';

interface ConnectionContextType {
  connections: Connection[];
  pendingRequests: Connection[];
  loading: boolean;
  error: string | null;
  sendConnectionRequest: (recipientId: string) => Promise<any>;
  respondToRequest: (requestId: string, status: 'accepted' | 'rejected') => Promise<any>;
  checkConnectionStatus: (userId: string) => 'none' | 'pending' | 'accepted' | 'rejected';
  getConnectionId: (userId: string) => string | null;
  refreshConnections: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const {
    connections,
    pendingRequests,
    loading,
    error,
    sendConnectionRequest,
    respondToRequest,
    checkConnectionStatus,
    getConnectionId,
    refresh
  } = useUserConnections();

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        pendingRequests,
        loading,
        error,
        sendConnectionRequest,
        respondToRequest,
        checkConnectionStatus,
        getConnectionId,
        refreshConnections: refresh
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}
