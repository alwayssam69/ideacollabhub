
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
          requester:requester_id(*)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });
      
      if (receivedError) throw receivedError;
      
      // Fetch sent connection requests
      const { data: sentData, error: sentError } = await supabase
        .from('connections')
        .select(`
          *,
          recipient:recipient_id(*)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });
      
      if (sentError) throw sentError;
      
      setRequests(receivedData as ConnectionRequest[]);
      setSentRequests(sentData as ConnectionRequest[]);
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
      const { data: existingRequest } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`requester_id.eq.${recipientId},recipient_id.eq.${recipientId}`);
      
      if (existingRequest && existingRequest.length > 0) {
        return { error: 'A connection request already exists between these users' };
      }
      
      // Send new connection request
      const { data, error } = await supabase
        .from('connections')
        .insert([
          { requester_id: user.id, recipient_id: recipientId, status: 'pending' }
        ])
        .select();
      
      if (error) throw error;
      
      fetchConnectionRequests(); // Refresh the requests
      return { success: true, data };
    } catch (err) {
      console.error('Error sending connection request:', err);
      return { error: err instanceof Error ? err.message : 'Failed to send connection request' };
    }
  };
  
  const respondToRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!user) return { error: 'User not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({ status })
        .eq('id', requestId)
        .eq('recipient_id', user.id) // Ensure the current user is the recipient
        .select();
      
      if (error) throw error;
      
      fetchConnectionRequests(); // Refresh the requests
      return { success: true, data };
    } catch (err) {
      console.error('Error responding to request:', err);
      return { error: err instanceof Error ? err.message : 'Failed to respond to request' };
    }
  };
  
  // Check if a connection request exists between the current user and another user
  const checkConnectionStatus = (userId: string): 'none' | 'pending' | 'accepted' | 'rejected' => {
    // Check sent requests
    const sentRequest = sentRequests.find(req => req.recipient_id === userId);
    if (sentRequest) return sentRequest.status as 'pending' | 'accepted' | 'rejected';
    
    // Check received requests
    const receivedRequest = requests.find(req => req.requester_id === userId);
    if (receivedRequest) return receivedRequest.status as 'pending' | 'accepted' | 'rejected';
    
    return 'none';
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
          filter: `recipient_id=eq.${user.id}` 
        }, 
        (payload) => {
          console.log('Connection change:', payload);
          fetchConnectionRequests();
          
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
    requests,
    sentRequests,
    loading,
    error,
    sendConnectionRequest,
    respondToRequest,
    checkConnectionStatus,
    refresh: fetchConnectionRequests
  };
}
