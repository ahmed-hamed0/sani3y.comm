
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { Notification } from '@/types';

export const NotificationsMenu = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }
      
      if (data) {
        setNotifications(data as Notification[]);
        // Check if there are any unread notifications
        setHasUnread(data.some(n => !n.read));
      }
    } catch (error) {
      console.error('Error in loadNotifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Check if there are still unread notifications
      const stillHasUnread = notifications.some(n => n.id !== notificationId && !n.read);
      setHasUnread(stillHasUnread);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
        
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setHasUnread(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Check if there are still unread notifications
      const stillHasUnread = notifications.filter(n => n.id !== notificationId).some(n => !n.read);
      setHasUnread(stillHasUnread);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Set up real-time listener for new notifications
  useEffect(() => {
    if (!user) return;
    
    loadNotifications();
    
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Add the new notification to the state
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setHasUnread(true);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Load notifications when the popover opens
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex justify-between items-center pb-2 mb-2 border-b">
          <h3 className="font-semibold">الإشعارات</h3>
          {notifications.some(n => !n.read) && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              تعيين الكل كمقروءة
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد إشعارات
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-lg relative border",
                  !notification.read && "bg-primary/5 border-primary/10"
                )}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">{notification.title}</h4>
                  <div className="flex gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{notification.message}</p>
                {notification.link && (
                  <Link
                    to={notification.link}
                    className="text-sm text-primary block mt-1 hover:underline"
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      setOpen(false);
                    }}
                  >
                    عرض التفاصيل
                  </Link>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleString('ar-EG')}
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
