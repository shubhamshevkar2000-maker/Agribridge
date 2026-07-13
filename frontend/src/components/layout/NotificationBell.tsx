'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Bell, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);

  useEffect(() => {
    // Connect to the backend socket server
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    // On connect, ideally we join a room based on the user's ID
    newSocket.on('connect', () => {
      // In a real implementation, we'd emit an authenticate event here
      // newSocket.emit('join', userId);
    });

    // Listen for real-time notifications
    newSocket.on('notification:new', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show toast
      setToastNotification(notification);
      setTimeout(() => setToastNotification(null), 5000);
    });

    return () => {
      newSocket.close();
    };
  }, [userId]);

  const markAllAsRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    // In a real app, fire API call to update database state
  };

  return (
    <div className="relative">
      {/* Toast Pop-up for real-time alerts */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className="fixed top-20 right-4 z-50 w-80 glass-card p-4 rounded-xl shadow-lg border-l-4 border-l-primary"
          >
            <div className="font-heading font-bold text-sm mb-1">{toastNotification.title}</div>
            <div className="text-xs text-muted-foreground">{toastNotification.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary/50">
            <Bell className="w-5 h-5 text-foreground" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background"
                />
              )}
            </AnimatePresence>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 mr-4 mt-2 glass-card border-border/50 shadow-xl rounded-xl overflow-hidden" align="end">
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-secondary/20">
            <h4 className="font-heading font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCircle className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <ScrollArea className="h-80">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif, index) => (
                  <div 
                    key={notif._id || index} 
                    className={`p-4 border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h5 className={`font-semibold text-sm ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </h5>
                      {!notif.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
