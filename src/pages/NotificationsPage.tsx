import { useEffect, useState } from 'react';
import { Check, X, Clock, CheckCheck, Trash2 } from 'lucide-react';
import PageContainer from '../components/common/PageContainer';
import PageHeader from '../components/common/PageHeader';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: number;
  type: 'article_approved' | 'article_rejected' | 'article_deleted' | 'general';
  message: string;
  reason: string | null;
  read: boolean;
  created_at: string;
  updated_at: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setNotifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (updateError) throw updateError;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    try {
      console.log(`Attempting to delete notification ${notificationId} for user ${user.id}`);
      
      // Delete from database
      const { error: deleteError, count } = await supabase
        .from('notifications')
        .delete({ count: 'exact' })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Database delete error:', deleteError);
        throw deleteError;
      }

      console.log(`Delete operation completed. Rows affected: ${count}`);
      
      if (count === 0) {
        throw new Error('No notification was deleted. It may not exist or you may not have permission.');
      }

      // Update local state only after successful database deletion
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
      
      console.log('Notification deleted successfully from database and local state updated');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to delete notification: ${errorMessage}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'article_approved':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'article_rejected':
        return <X className="w-5 h-5 text-red-600" />;
      case 'article_deleted':
        return <Trash2 className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: string, read: boolean) => {
    const opacity = read ? '50' : '100';
    switch (type) {
      case 'article_approved':
        return `bg-green-${opacity}`;
      case 'article_rejected':
      case 'article_deleted':
        return `bg-red-${opacity}`;
      default:
        return `bg-blue-${opacity}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-neutral-600">Loading notifications...</div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 font-inter bg-neutral-50 min-h-screen">
      <PageHeader
        title="Notifications"
        subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      />
      <PageContainer>
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Action Bar */}
        {unreadCount > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </span>
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No notifications yet</h3>
              <p className="text-neutral-600">
                You'll see notifications here when there are updates about your articles or other important information.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl shadow-md p-6 ${
                  !notification.read ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${getNotificationBgColor(notification.type, notification.read)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-neutral-900' : 'text-neutral-700'}`}>
                          {notification.message}
                        </p>
                        
                        {notification.reason && (
                          <div className="mt-2 p-3 bg-neutral-50 rounded-lg">
                            <p className="text-xs font-medium text-neutral-700 mb-1">Reason:</p>
                            <p className="text-sm text-neutral-600">{notification.reason}</p>
                          </div>
                        )}
                        
                        <p className="text-xs text-neutral-500 mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PageContainer>
    </div>
  );
};

export default NotificationsPage;