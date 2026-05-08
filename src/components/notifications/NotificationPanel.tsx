import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CalendarDays, DollarSign, Info, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkAllRead, useMarkRead } from '../../hooks/useNotifications';
import { formatRelative } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  appointment: <CalendarDays className="w-4 h-4 text-accent-teal" />,
  payment: <DollarSign className="w-4 h-4 text-accent-amber" />,
  reminder: <Bell className="w-4 h-4 text-accent-rose" />,
  system: <Info className="w-4 h-4 text-accent-mint" />,
};

const typeBg: Record<string, string> = {
  appointment: 'bg-accent-teal/10',
  payment: 'bg-accent-amber/10',
  reminder: 'bg-accent-rose/10',
  system: 'bg-accent-mint/10',
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();
  const navigate = useNavigate();

  const handleClick = (notification: any) => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }
    if (notification.related_patient_id) {
      navigate(`/patients/${notification.related_patient_id}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display font-bold text-lg">Notifications</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markAllRead.mutate()}
                  className="text-xs text-accent-teal hover:text-accent-teal/80 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-elevated text-text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-3">
                      <div className="w-9 h-9 bg-elevated rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-elevated rounded w-2/3" />
                        <div className="h-3 bg-elevated rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !notifications?.length ? (
                <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                  <Bell className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notif, i) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleClick(notif)}
                      className={`flex gap-3 px-6 py-4 cursor-pointer hover:bg-elevated/50 transition-colors ${
                        !notif.is_read ? 'bg-accent-teal/5' : ''
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${typeBg[notif.type]}`}>
                        {typeIcons[notif.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notif.is_read ? 'text-text-primary' : 'text-text-muted'}`}>
                            {notif.title}
                          </p>
                          {!notif.is_read && (
                            <div className="w-2 h-2 bg-accent-teal rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-text-muted mt-1">{formatRelative(notif.created_at)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
