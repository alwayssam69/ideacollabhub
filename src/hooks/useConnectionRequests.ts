
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type ConnectionRequest = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester?: Tables<'profiles'>;
  recipient?: Tables<'profiles'>;
};

export function useConnectionRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);

  const fetchConnectionRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch received connection requests
      const { data: receivedData, error: receivedError } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!requester_id(*)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });
      
      if (receivedError) throw receivedError;
      
      // Fetch sent connection requests
      const { data: sentData, error: sentError } = await supabase
        .from('connections')
        .select(`
          *,
          recipient:profiles!recipient_id(*)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });
      
      if (sentError) throw sentError;
      
      // Use type assertion to handle the data
      setRequests(receivedData as unknown as ConnectionRequest[]);
      setSentRequests(sentData as unknown as ConnectionRequest[]);
      
      console.log('Received requests:', receivedData);
      console.log('Sent requests:', sentData);
    } catch (err) {
      console.error('Error fetching connection requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load connection requests');
    } finally {
      setLoading(false);
    }
  };
  
  const sendConnectionRequest = async (recipientId: string) => {
    if (!user) return { error: 'User not authenticated' };
    
    try {
      // Check if a request already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('connections')
        .select('*')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingRequest) {
        const status = existingRequest.status;
        if (status === 'pending') {
          return { error: 'A connection request is already pending' };
        } else if (status === 'accepted') {
          return { error: 'You are already connected with this user' };
        } else if (status === 'rejected') {
          // If previously rejected, allow to send again by deleting the old request
          const { error: deleteError } = await supabase
            .from('connections')
            .delete()
            .eq('id', existingRequest.id);
            
          if (deleteError) throw deleteError;
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
      fetchConnectionRequests(); // Refresh the requests
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
      
      fetchConnectionRequests(); // Refresh the requests
      return { success: true, data };
    } catch (err) {
      console.error('Error responding to request:', err);
      toast.error(err instanceof Error ? err.message : `Failed to ${status} request`);
      return { error: err instanceof Error ? err.message : 'Failed to respond to request' };
    }
  };
  
  // Check if a connection request exists between the current user and another user
  const checkConnectionStatus = (userId: string): 'none' | 'pending' | 'accepted' | 'rejected' => {
    if (!user) return 'none';
    
    // Check sent requests
    const sentRequest = sentRequests.find(req => req.recipient_id === userId);
    if (sentRequest) return sentRequest.status;
    
    // Check received requests
    const receivedRequest = requests.find(req => req.requester_id === userId);
    if (receivedRequest) return receivedRequest.status;
    
    return 'none';
  };
  
  // Get connection ID if exists
  const getConnectionId = (userId: string): string | null => {
    if (!user) return null;
    
    const sentRequest = sentRequests.find(req => req.recipient_id === userId);
    if (sentRequest) return sentRequest.id;
    
    const receivedRequest = requests.find(req => req.requester_id === userId);
    if (receivedRequest) return receivedRequest.id;
    
    return null;
  };
  
  // Get pending connections count
  const getPendingRequestsCount = (): number => {
    return requests.filter(req => req.status === 'pending').length;
  };
  
  // Setup real-time subscription
  useEffect(() => {
    if (!user) return;
    
    fetchConnectionRequests();
    
    // Subscribe to connection changes for the current user
    const channel = supabase
      .channel('connection-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'connections',
          filter: `or(recipient_id=eq.${user.id},requester_id=eq.${user.id})` 
        }, 
        (payload) => {
          console.log('Connection change:', payload);
          fetchConnectionRequests();
          
          if (payload.eventType === 'INSERT' && payload.new.recipient_id === user.id) {
            // Show notification for new request
            toast.info('You received a new connection request', {
              action: {
                label: 'View',
                onClick: () => window.location.href = '/connections?tab=pending'
              }
            });
          } else if (payload.eventType === 'UPDATE' && payload.new.status === 'accepted') {
            if (payload.new.recipient_id === user.id) {
              toast.success('You accepted a connection request');
            } else {
              toast.success('Your connection request was accepted');
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  return {
    requests,
    sentRequests,
    loading,
    error,
    sendConnectionRequest,
    respondToRequest,
    checkConnectionStatus,
    getConnectionId,
    getPendingRequestsCount,
    refresh: fetchConnectionRequests
  };
}
