import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Building2, CheckCircle2, XCircle, User } from 'lucide-react';
import { useTodaySessions, useUpdateSession } from '../../hooks/useSessions';
import { formatTime } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { SkeletonRow } from '../ui/Spinner';
import { useNavigate } from 'react-router-dom';

export const TodaySchedule: React.FC = () => {
  const { data: sessions, isLoading } = useTodaySessions();
  const updateSession = useUpdateSession();
  const navigate = useNavigate();

  const handleStatusChange = (id: string, status: 'completed' | 'no_show') => {
    updateSession.mutate({ id, updates: { status } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg">Today's Schedule</h3>
        <span className="badge-teal text-xs">{sessions?.length || 0} sessions</span>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
        ) : !sessions?.length ? (
          <div className="text-center py-8">
            <Clock className="w-10 h-10 mx-auto text-text-muted/30 mb-2" />
            <p className="text-sm text-text-muted">No sessions scheduled for today</p>
          </div>
        ) : (
          sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => session.patient_id && navigate(`/patients/${session.patient_id}`)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-elevated/50 cursor-pointer transition-colors group"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-accent-teal/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-accent-teal" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.patient?.name || 'Unknown'}</p>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  {formatTime(session.scheduled_at)}
                  <span className="mx-1">•</span>
                  {session.visit_type === 'clinic' ? (
                    <span className="flex items-center gap-1 text-accent-teal">
                      <Building2 className="w-3 h-3" /> Clinic
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-accent-amber">
                      <MapPin className="w-3 h-3" /> Home Visit
                    </span>
                  )}
                </div>
              </div>

              {/* Status / Actions */}
              {session.status === 'scheduled' ? (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(session.id, 'completed'); }}
                    className="p-1.5 rounded-lg hover:bg-accent-mint/10 text-accent-mint"
                    title="Mark Completed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(session.id, 'no_show'); }}
                    className="p-1.5 rounded-lg hover:bg-accent-rose/10 text-accent-rose"
                    title="No Show"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Badge variant={session.status === 'completed' ? 'mint' : session.status === 'cancelled' || session.status === 'no_show' ? 'rose' : 'teal'}>
                  {session.status}
                </Badge>
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
