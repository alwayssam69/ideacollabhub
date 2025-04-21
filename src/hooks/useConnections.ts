import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  requester_profile: {
    full_name: string;
    title: string;
    avatar_url: string;
  };
  recipient_profile: {
    full_name: string;
    title: string;
    avatar_url: string;
  };
}

export const useConnections = (userId: string) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of connections and pending requests
    const fetchConnections = async () => {
      try {
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('connections')
          .select(`
            *,
            requester_profile:profiles!connections_requester_id_fkey(full_name, title, avatar_url),
            recipient_profile:profiles!connections_recipient_id_fkey(full_name, title, avatar_url)
          `)
          .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (connectionsError) throw connectionsError;

        const acceptedConnections = connectionsData.filter(
          (conn) => conn.status === 'accepted'
        );
        const pending = connectionsData.filter(
          (conn) => conn.status === 'pending' && conn.recipient_id === userId
        );

        setConnections(acceptedConnections);
        setPendingRequests(pending);
      } catch (error) {
        console.error('Error fetching connections:', error);
        toast.error('Failed to load connections');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();

    // Set up real-time subscription for connection updates
    const subscription = supabase
      .channel('connection-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `requester_id=eq.${userId} OR recipient_id=eq.${userId}`,
        },
        async (payload) => {
          const { new: newConnection, old: oldConnection, eventType } = payload;

          if (eventType === 'INSERT') {
            // New connection request
            if (newConnection.recipient_id === userId) {
              const { data: requesterProfile } = await supabase
                .from('profiles')
                .select('full_name, title, avatar_url')
                .eq('id', newConnection.requester_id)
                .single();

              setPendingRequests((prev) => [
                {
                  ...newConnection,
                  requester_profile: requesterProfile,
                },
                ...prev,
              ]);

              toast.info(`New connection request from ${requesterProfile?.full_name}`);
            }
          } else if (eventType === 'UPDATE') {
            // Connection status update
            if (newConnection.status === 'accepted') {
              setPendingRequests((prev) =>
                prev.filter((req) => req.id !== newConnection.id)
              );
              setConnections((prev) => [newConnection, ...prev]);

              const otherUserId =
                newConnection.requester_id === userId
                  ? newConnection.recipient_id
                  : newConnection.requester_id;

              const { data: otherProfile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', otherUserId)
                .single();

              toast.success(
                `${otherProfile?.full_name} accepted your connection request`
              );
            } else if (newConnection.status === 'rejected') {
              setPendingRequests((prev) =>
                prev.filter((req) => req.id !== newConnection.id)
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const sendConnectionRequest = async (recipientId: string) => {
    try {
      const { data, error } = await supabase.from('connections').insert({
        requester_id: userId,
        recipient_id: recipientId,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Connection request sent');
      return { success: true };
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
      return { success: false, error };
    }
  };

  const respondToRequest = async (
    connectionId: string,
    status: 'accepted' | 'rejected'
  ) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status })
        .eq('id', connectionId);

      if (error) throw error;

      if (status === 'accepted') {
        toast.success('Connection request accepted');
      } else {
        toast.info('Connection request rejected');
      }

      return { success: true };
    } catch (error) {
      console.error('Error responding to connection request:', error);
      toast.error('Failed to respond to connection request');
      return { success: false, error };
    }
  };

  return {
    connections,
    pendingRequests,
    loading,
    sendConnectionRequest,
    respondToRequest,
  };
}; 