import React from 'react';
import { motion } from 'framer-motion';
import { useNotifications, useMarkAllRead, useMarkRead } from '../hooks/useNotifications';
import { Bell, CalendarDays, DollarSign, Info, CheckCheck } from 'lucide-react';
import { formatRelative } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SkeletonRow } from '../components/ui/Spinner';

const typeIcons: Record<string, React.ReactNode> = {
  appointment: <CalendarDays className="w-4 h-4 text-accent-teal" />,
  payment: <DollarSign className="w-4 h-4 text-accent-amber" />,
  reminder: <Bell className="w-4 h-4 text-accent-rose" />,
  system: <Info className="w-4 h-4 text-accent-mint" />,
};

const typeBg: Record<string, string> = {
  appointment: 'bg-accent-teal/10', payment: 'bg-accent-amber/10', reminder: 'bg-accent-rose/10', system: 'bg-accent-mint/10',
};

const Notifications: React.FC = () => {
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();
  const navigate = useNavigate();

  const handleClick = (n: any) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.related_patient_id) navigate(`/patients/${n.related_patient_id}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-display font-bold">Notifications</h1><p className="text-sm text-text-muted mt-1">Stay updated on clinic activity</p></div>
        <Button variant="secondary" size="sm" icon={<CheckCheck className="w-4 h-4" />} onClick={() => markAllRead.mutate()}>Mark all read</Button>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : !notifications?.length ? (
          <div className="text-center py-16"><Bell className="w-16 h-16 mx-auto text-text-muted/20 mb-4" /><p className="text-text-muted">No notifications</p></div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                onClick={() => handleClick(n)} className={`flex gap-3 px-6 py-4 cursor-pointer hover:bg-elevated/50 transition-colors ${!n.is_read ? 'bg-accent-teal/5' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeBg[n.type]}`}>{typeIcons[n.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!n.is_read ? 'text-text-primary' : 'text-text-muted'}`}>{n.title}</p>
                    {!n.is_read && <div className="w-2 h-2 bg-accent-teal rounded-full mt-1.5 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-text-muted mt-1">{formatRelative(n.created_at)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
