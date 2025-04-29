
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/sonner';
import { Send, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types';

interface MessagesSectionProps {
  profile: any;
}

interface UserInfo {
  id: string;
  name: string;
}

const MessagesSection = ({ profile }: MessagesSectionProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversationWith, setConversationWith] = useState<string | null>(null);
  const [conversations, setConversations] = useState<{id: string, name: string}[]>([]);

  // Load conversations (unique users the current user has messaged with)
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) return;
      
      try {
        // Get all messages where current user is sender or receiver
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id, 
            sender_id, 
            receiver_id
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading conversations:', error);
          return;
        }

        if (data) {
          // Extract unique users from conversations
          const uniqueUserIds = new Set<string>();
          
          data.forEach(msg => {
            const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            uniqueUserIds.add(otherId);
          });
          
          // Get profile info for each user
          const userProfiles: {id: string, name: string}[] = [];
          
          for (const userId of uniqueUserIds) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, full_name')
              .eq('id', userId)
              .single();
              
            if (profileData) {
              userProfiles.push({
                id: profileData.id,
                name: profileData.full_name
              });
            }
          }
          
          setConversations(userProfiles);
          
          // If there are conversations and none is selected, select the first one
          if (userProfiles.length > 0 && !conversationWith) {
            setConversationWith(userProfiles[0].id);
          }
        }
      } catch (error) {
        console.error('Error in loadConversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user?.id, conversationWith]);

  // Load messages for the selected conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.id || !conversationWith) return;
      
      try {
        // Get messages for this conversation
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id, 
            sender_id, 
            receiver_id, 
            content, 
            created_at, 
            read
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conversationWith}),and(sender_id.eq.${conversationWith},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        if (data) {
          // Format messages with names for display
          const formattedMessages: Message[] = data.map(msg => ({
            ...msg,
            sender_name: msg.sender_id === user.id ? 'You' : 'Other User',
            receiver_name: msg.receiver_id === user.id ? 'You' : 'Other User'
          }));
          
          setMessages(formattedMessages);
          
          // Mark received messages as read
          const unreadMsgIds = formattedMessages
            .filter(msg => msg.receiver_id === user.id && !msg.read)
            .map(msg => msg.id);
            
          if (unreadMsgIds.length > 0) {
            await supabase
              .from('messages')
              .update({ read: true })
              .in('id', unreadMsgIds);
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
    
    // Set up real-time listener for new messages
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id=eq.${user?.id},receiver_id=eq.${user?.id})`
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, conversationWith]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !conversationWith || !newMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: conversationWith,
          content: newMessage.trim(),
          read: false
        });
        
      if (error) {
        toast("فشل في إرسال الرسالة: " + error.message, {
          style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
        });
        return;
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast("فشل في إرسال الرسالة: حدث خطأ غير متوقع", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
    } finally {
      setIsSending(false);
    }
  };

  // If viewing someone else's profile, show the direct message option
  if (user?.id && profile.id && user.id !== profile.id) {
    return (
      <div>
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">إرسال رسالة إلى {profile.full_name}</h3>
        </div>
        
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending || !newMessage.trim()}>
            {isSending ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    );
  }

  // Regular message inbox view
  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-10 bg-neutral rounded-lg">
          <p className="text-gray-500">لا توجد رسائل حتى الآن</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Conversations sidebar */}
          <div className="bg-neutral rounded-lg p-4">
            <h3 className="font-semibold mb-3">المحادثات</h3>
            <ul className="space-y-2">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <Button
                    variant={conversationWith === conv.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setConversationWith(conv.id)}
                  >
                    {conv.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Messages area */}
          <div className="md:col-span-3 bg-white rounded-lg p-4 border">
            {conversationWith ? (
              <>
                <div className="h-80 overflow-y-auto mb-4 space-y-2 p-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.sender_id === user?.id
                          ? 'bg-primary/10 mr-auto'
                          : 'bg-neutral ml-auto'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-end mt-1 text-xs text-gray-500">
                        {new Date(msg.created_at).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {msg.sender_id === user?.id && (
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    disabled={isSending}
                  />
                  <Button type="submit" disabled={isSending || !newMessage.trim()}>
                    {isSending ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">اختر محادثة للبدء</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesSection;
