import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface MessageRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected';
  requester_profile: {
    full_name: string;
    title: string;
    avatar_url: string;
  };
}

export function MessageRequests({ userId }: { userId: string }) {
  const [requests, setRequests] = useState<MessageRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessageRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('message_requests')
          .select(`
            *,
            requester_profile:profiles!message_requests_requester_id_fkey(full_name, title, avatar_url)
          `)
          .eq('recipient_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (error) {
        console.error('Error fetching message requests:', error);
        toast.error('Failed to load message requests');
      } finally {
        setLoading(false);
      }
    };

    fetchMessageRequests();

    // Set up real-time subscription for new message requests
    const subscription = supabase
      .channel('message-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_requests',
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload) => {
          const newRequest = payload.new as MessageRequest;
          const { data: requesterProfile } = await supabase
            .from('profiles')
            .select('full_name, title, avatar_url')
            .eq('id', newRequest.requester_id)
            .single();

          setRequests((prev) => [
            { ...newRequest, requester_profile: requesterProfile },
            ...prev,
          ]);

          toast.info(
            `New message request from ${requesterProfile?.full_name}`
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const handleRequest = async (
    requestId: string,
    action: 'accept' | 'reject'
  ) => {
    try {
      const { error } = await supabase
        .from('message_requests')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      setRequests((prev) => prev.filter((req) => req.id !== requestId));

      if (action === 'accept') {
        toast.success('Message request accepted');
      } else {
        toast.info('Message request rejected');
      }
    } catch (error) {
      console.error('Error handling message request:', error);
      toast.error('Failed to handle message request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Message Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            No pending message requests
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={request.requester_profile.avatar_url} />
                <AvatarFallback>
                  {request.requester_profile.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{request.requester_profile.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {request.requester_profile.title}
                </p>
                <p className="text-sm mt-1">{request.content}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRequest(request.id, 'reject')}
              >
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleRequest(request.id, 'accept')}
              >
                Accept
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 