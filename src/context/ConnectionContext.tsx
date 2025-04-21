import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

interface ConnectionProfile {
  id: string;
  full_name: string;
  avatar_url: string;
}

interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester: ConnectionProfile;
  recipient: ConnectionProfile;
}

interface ConnectionContextType {
  connections: Connection[];
  pendingRequests: Connection[];
  loading: boolean;
  sendConnectionRequest: (recipientId: string) => Promise<void>;
  acceptConnection: (connectionId: string) => Promise<void>;
  rejectConnection: (connectionId: string) => Promise<void>;
  findPotentialMatches: () => Promise<any[]>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConnections();
      setupRealtimeSubscription();
    }
    return () => {
      // Cleanup subscription
    };
  }, [user]);

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('connections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
        },
        (payload) => {
          if (payload.new) {
            const newConnection = payload.new as Connection;
            if (newConnection.recipient_id === user?.id && newConnection.status === 'pending') {
              setPendingRequests((prev) => [...prev, newConnection]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchConnections = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch connections where user is either requester or recipient
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          id,
          requester_id,
          recipient_id,
          status,
          created_at,
          updated_at,
          requester:profiles!requester_id(id, full_name, avatar_url),
          recipient:profiles!recipient_id(id, full_name, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
        throw connectionsError;
      }

      if (!connectionsData) {
        setConnections([]);
        setPendingRequests([]);
        return;
      }

      // Process the data
      const formattedConnections = connectionsData.map(conn => ({
        ...conn,
        status: conn.status as 'pending' | 'accepted' | 'rejected',
        requester: conn.requester as ConnectionProfile,
        recipient: conn.recipient as ConnectionProfile
      }));

      // Filter connections based on status
      const acceptedConnections = formattedConnections.filter(
        conn => conn.status === 'accepted'
      );
      
      const pending = formattedConnections.filter(
        conn => conn.status === 'pending' && conn.recipient_id === user.id
      );

      setConnections(acceptedConnections);
      setPendingRequests(pending);
    } catch (error) {
      console.error('Error in fetchConnections:', error);
      toast.error('Failed to load connections. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (recipientId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('connections').insert({
        requester_id: user.id,
        recipient_id: recipientId,
        status: 'pending',
      });

      if (error) throw error;
      toast.success('Connection request sent');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };

  const acceptConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;

      setPendingRequests((prev) => prev.filter((conn) => conn.id !== connectionId));
      await fetchConnections();
      toast.success('Connection accepted');
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast.error('Failed to accept connection');
    }
  };

  const rejectConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;

      setPendingRequests((prev) => prev.filter((conn) => conn.id !== connectionId));
      toast.success('Connection rejected');
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast.error('Failed to reject connection');
    }
  };

  const findPotentialMatches = async () => {
    if (!user) return [];

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'eq', user.id)
        .contains('preferred_industries', profile.industry)
        .contains('preferred_project_types', profile.project_stage)
        .overlaps('skills', profile.skills)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error finding matches:', error);
      toast.error('Failed to find potential matches');
      return [];
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        pendingRequests,
        loading,
        sendConnectionRequest,
        acceptConnection,
        rejectConnection,
        findPotentialMatches,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnections() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnections must be used within a ConnectionProvider');
  }
  return context;
}
