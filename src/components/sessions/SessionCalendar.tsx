import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Building2, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday, startOfDay, endOfDay } from 'date-fns';
import type { Session } from '../../types';
import { formatTime } from '../../utils/formatters';
import { Badge } from '../ui/Badge';

export const SessionCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart); // 0=Sunday

  const { data: sessions } = useQuery({
    queryKey: ['sessions', 'calendar', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, patient:patients(name)')
        .gte('scheduled_at', monthStart.toISOString())
        .lte('scheduled_at', monthEnd.toISOString())
        .order('scheduled_at', { ascending: true });
      if (error) throw error;
      return data as Session[];
    },
  });

  const getSessionsForDay = (day: Date) => sessions?.filter((s) => isSameDay(new Date(s.scheduled_at), day)) || [];

  const selectedSessions = selectedDate ? getSessionsForDay(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-elevated text-text-muted"><ChevronLeft className="w-5 h-5" /></button>
          <h3 className="font-display font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-elevated text-text-muted"><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-text-muted py-2">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
          {days.map((day) => {
            const daySessions = getSessionsForDay(day);
            const clinicCount = daySessions.filter((s) => s.visit_type === 'clinic').length;
            const homeCount = daySessions.filter((s) => s.visit_type === 'home_visit').length;
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                className={`relative p-2 rounded-xl text-sm min-h-[60px] transition-all flex flex-col items-center ${
                  isSelected ? 'bg-accent-teal/10 border border-accent-teal/30' :
                  isToday(day) ? 'bg-elevated border border-border' : 'hover:bg-elevated/50 border border-transparent'
                }`}>
                <span className={`text-xs font-medium ${isToday(day) ? 'text-accent-teal' : ''}`}>{format(day, 'd')}</span>
                {daySessions.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {clinicCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-accent-teal" title={`${clinicCount} clinic`} />}
                    {homeCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-accent-amber" title={`${homeCount} home`} />}
                  </div>
                )}
                {daySessions.length > 0 && <span className="text-[10px] text-text-muted mt-0.5">{daySessions.length}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Panel */}
      <div className="glass-card p-6">
        <h3 className="font-display font-bold mb-4">
          {selectedDate ? format(selectedDate, 'EEEE, dd MMM') : 'Select a day'}
        </h3>
        {!selectedDate ? (
          <p className="text-sm text-text-muted">Click a day to see sessions</p>
        ) : !selectedSessions.length ? (
          <p className="text-sm text-text-muted">No sessions on this day</p>
        ) : (
          <div className="space-y-3">
            {selectedSessions.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl bg-base border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{(s as any).patient?.name || '—'}</span>
                  <Badge variant={s.visit_type === 'clinic' ? 'teal' : 'amber'}>
                    {s.visit_type === 'clinic' ? 'Clinic' : 'Home'}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">{formatTime(s.scheduled_at)} • {s.duration_minutes} min</p>
                {s.treatment_given && <p className="text-xs text-accent-teal mt-1">{s.treatment_given}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
