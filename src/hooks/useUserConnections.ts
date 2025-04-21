
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type Connection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  profile: Tables<'profiles'>;
};

export function useUserConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchConnections = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch connections where user is the requester
      const { data: sentConnections, error: sentError } = await supabase
        .from("connections")
        .select(`
          *,
          profile:profiles!connections_recipient_id_fkey(*)
        `)
        .eq("requester_id", user.id)
        .neq("status", "rejected");
      
      if (sentError) throw sentError;
      
      // Fetch connections where user is the recipient
      const { data: receivedConnections, error: receivedError } = await supabase
        .from("connections")
        .select(`
          *,
          profile:profiles!connections_requester_id_fkey(*)
        `)
        .eq("recipient_id", user.id)
        .neq("status", "rejected");
      
      if (receivedError) throw receivedError;
      
      // Group connections by status
      const accepted = [
        ...(sentConnections || []).filter(conn => conn.status === 'accepted'),
        ...(receivedConnections || []).filter(conn => conn.status === 'accepted')
      ];
      
      const pending = receivedConnections?.filter(conn => conn.status === 'pending') || [];
      
      setConnections(accepted as Connection[]);
      setPendingRequests(pending as Connection[]);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load connections');
      toast.error('Failed to load connection data');
    } finally {
      setLoading(false);
    }
  };
  
  const sendConnectionRequest = async (recipientId: string) => {
    if (!user) return { error: 'User not authenticated' };
    
    try {
      // Check if a request already exists
      const { data: existingRequest } = await supabase
        .from('connections')
        .select('*')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`);
      
      if (existingRequest && existingRequest.length > 0) {
        const status = existingRequest[0].status;
        if (status === 'pending') {
          return { error: 'A connection request is already pending' };
        } else if (status === 'accepted') {
          return { error: 'You are already connected with this user' };
        } else {
          return { error: 'A connection request already exists between these users' };
        }
      }
      
      // Send new connection request
      const { data, error } = await supabase
        .from('connections')
        .insert([
          { requester_id: user.id, recipient_id: recipientId, status: 'pending' }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Connection request sent successfully");
      fetchConnections(); // Refresh the connections
      return { success: true, data };
    } catch (err) {
      console.error('Error sending connection request:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to send connection request');
      return { error: err instanceof Error ? err.message : 'Failed to send connection request' };
    }
  };
  
  const respondToRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!user) return { error: 'User not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('recipient_id', user.id) // Ensure the current user is the recipient
        .select();
      
      if (error) throw error;
      
      const statusText = status === 'accepted' ? 'accepted' : 'rejected';
      toast.success(`Connection request ${statusText}`);
      
      fetchConnections(); // Refresh the connections
      return { success: true, data };
    } catch (err) {
      console.error('Error responding to request:', err);
      toast.error(err instanceof Error ? err.message : `Failed to ${status} request`);
      return { error: err instanceof Error ? err.message : 'Failed to respond to request' };
    }
  };
  
  const checkConnectionStatus = (userId: string): 'none' | 'pending' | 'accepted' | 'rejected' => {
    if (!user) return 'none';
    
    // Check if the user is in connections as either requester or recipient
    const connection = connections.find(conn => 
      (conn.requester_id === userId && conn.recipient_id === user.id) || 
      (conn.requester_id === user.id && conn.recipient_id === userId)
    );
    
    if (connection) return connection.status as 'pending' | 'accepted' | 'rejected';
    
    // Check if there's a pending request from this user
    const pendingRequest = pendingRequests.find(req => req.requester_id === userId);
    if (pendingRequest) return 'pending';
    
    return 'none';
  };
  
  const getConnectionId = (userId: string): string | null => {
    if (!user) return null;
    
    // Find connection where either user is requester or recipient
    const connection = connections.find(conn => 
      (conn.requester_id === userId && conn.recipient_id === user.id) || 
      (conn.requester_id === user.id && conn.recipient_id === userId)
    );
    
    if (connection) return connection.id;
    
    // Find pending request
    const pendingRequest = pendingRequests.find(req => req.requester_id === userId);
    if (pendingRequest) return pendingRequest.id;
    
    return null;
  };
  
  // Setup real-time subscription to track connection changes
  useEffect(() => {
    if (!user) return;
    
    fetchConnections();
    
    // Subscribe to connection changes for the current user
    const channel = supabase
      .channel('user-connections')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'connections',
          filter: `or(requester_id.eq.${user.id},recipient_id.eq.${user.id})` 
        }, 
        (payload) => {
          console.log('Connection change detected:', payload);
          fetchConnections();
          
          if (payload.eventType === 'INSERT') {
            toast.info('You received a new connection request');
          } else if (payload.eventType === 'UPDATE' && payload.new.status === 'accepted') {
            toast.success('Connection request accepted');
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  return {
    connections,
    pendingRequests,
    loading,
    error,
    sendConnectionRequest,
    respondToRequest,
    checkConnectionStatus,
    getConnectionId,
    refresh: fetchConnections
  };
}
