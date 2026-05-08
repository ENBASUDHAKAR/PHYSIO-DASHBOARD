import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarDays, Activity, IndianRupee } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

interface StatCard {
  label: string;
  value: number;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
  bgGlow: string;
}

const AnimatedNumber: React.FC<{ target: number; prefix?: string }> = ({ target, prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const start = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(start + (target - start) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target]);

  return (
    <span>
      {prefix}{prefix === '₹' ? count.toLocaleString('en-IN') : count}
    </span>
  );
};

export const StatsCards: React.FC = () => {
  const now = new Date();

  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const [patientsRes, todayRes, monthRes, revenueRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('sessions').select('id', { count: 'exact', head: true })
          .gte('scheduled_at', startOfDay(now).toISOString())
          .lte('scheduled_at', endOfDay(now).toISOString()),
        supabase.from('sessions').select('id', { count: 'exact', head: true })
          .gte('scheduled_at', startOfMonth(now).toISOString())
          .lte('scheduled_at', endOfMonth(now).toISOString()),
        supabase.from('session_packages').select('amount_paid')
          .gte('created_at', startOfMonth(now).toISOString())
          .lte('created_at', endOfMonth(now).toISOString()),
      ]);

      const revenue = revenueRes.data?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;

      return {
        totalActivePatients: patientsRes.count || 0,
        todaySessions: todayRes.count || 0,
        sessionsThisMonth: monthRes.count || 0,
        revenueThisMonth: revenue,
      };
    },
    refetchInterval: 60000,
  });

  const cards: StatCard[] = [
    {
      label: 'Active Patients',
      value: stats?.totalActivePatients || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'text-accent-teal',
      bgGlow: 'from-accent-teal/10 to-transparent',
    },
    {
      label: "Today's Sessions",
      value: stats?.todaySessions || 0,
      icon: <CalendarDays className="w-6 h-6" />,
      color: 'text-accent-mint',
      bgGlow: 'from-accent-mint/10 to-transparent',
    },
    {
      label: 'Sessions This Month',
      value: stats?.sessionsThisMonth || 0,
      icon: <Activity className="w-6 h-6" />,
      color: 'text-accent-amber',
      bgGlow: 'from-accent-amber/10 to-transparent',
    },
    {
      label: 'Revenue This Month',
      value: stats?.revenueThisMonth || 0,
      prefix: '₹',
      icon: <IndianRupee className="w-6 h-6" />,
      color: 'text-accent-mint',
      bgGlow: 'from-accent-mint/10 to-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="stat-card"
        >
          {/* Background Glow */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.bgGlow} rounded-full blur-2xl opacity-50`} />

          <div className="relative">
            <div className={`w-12 h-12 rounded-xl bg-surface flex items-center justify-center mb-4 ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-text-muted text-sm mb-1">{card.label}</p>
            <p className={`text-3xl font-display font-bold ${card.color}`}>
              <AnimatedNumber target={card.value} prefix={card.prefix} />
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
