import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, CheckCircle, CreditCard, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { formatRelative } from '../../utils/formatters';
import { SkeletonRow } from '../ui/Spinner';

const iconMap: Record<string, React.ReactNode> = {
  patient: <UserPlus className="w-4 h-4 text-accent-teal" />,
  session: <CheckCircle className="w-4 h-4 text-accent-mint" />,
  payment: <CreditCard className="w-4 h-4 text-accent-amber" />,
  package: <Package className="w-4 h-4 text-accent-teal" />,
};

const bgMap: Record<string, string> = {
  patient: 'bg-accent-teal/10',
  session: 'bg-accent-mint/10',
  payment: 'bg-accent-amber/10',
  package: 'bg-accent-teal/10',
};

export const RecentActivity: React.FC = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: async () => {
      const items: any[] = [];

      // Recent patients
      const { data: patients } = await supabase
        .from('patients')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      patients?.forEach((p) => {
        items.push({
          id: `p-${p.id}`,
          action: 'New Patient',
          description: `${p.name} registered`,
          timestamp: p.created_at,
          type: 'patient',
        });
      });

      // Recent completed sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, created_at, status, patient:patients(name)')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(3);

      sessions?.forEach((s: any) => {
        items.push({
          id: `s-${s.id}`,
          action: 'Session Completed',
          description: `${s.patient?.name || 'Patient'}'s session completed`,
          timestamp: s.created_at,
          type: 'session',
        });
      });

      // Recent packages
      const { data: packages } = await supabase
        .from('session_packages')
        .select('id, package_name, created_at, patient:patients(name)')
        .order('created_at', { ascending: false })
        .limit(2);

      packages?.forEach((pk: any) => {
        items.push({
          id: `pk-${pk.id}`,
          action: 'Package Created',
          description: `${pk.package_name || 'Package'} for ${pk.patient?.name || 'patient'}`,
          timestamp: pk.created_at,
          type: 'package',
        });
      });

      // Sort all by timestamp desc, take 5
      return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="glass-card p-6"
    >
      <h3 className="font-display font-bold text-lg mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
        ) : !activities?.length ? (
          <p className="text-sm text-text-muted text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bgMap[activity.type]}`}>
                {iconMap[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-text-muted truncate">{activity.description}</p>
              </div>
              <span className="text-[10px] text-text-muted whitespace-nowrap">{formatRelative(activity.timestamp)}</span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
