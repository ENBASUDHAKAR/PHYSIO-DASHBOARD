import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, CalendarDays } from 'lucide-react';
import { useSessions, useUpdateSession, useDeleteSession } from '../../hooks/useSessions';
import { SessionForm } from './SessionForm';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SkeletonRow } from '../ui/Spinner';
import { formatDate, formatTime, getPainScoreColor, getStatusColor } from '../../utils/formatters';
import type { Session } from '../../types';

const rangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All' },
] as const;

export const SessionTable: React.FC = () => {
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [formOpen, setFormOpen] = useState(false);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: sessions, isLoading } = useSessions({ range });
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex gap-1 bg-surface rounded-xl p-1">
          {rangeOptions.map((opt) => (
            <button key={opt.value} onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${range === opt.value ? 'bg-accent-teal/10 text-accent-teal' : 'text-text-muted hover:text-text-primary'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setFormOpen(true)}>Add Session</Button>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : !sessions?.length ? (
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 mx-auto text-text-muted/20 mb-3" />
            <p className="text-sm text-text-muted">No sessions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-text-muted text-xs">
                <th className="text-left p-4">Date/Time</th><th className="text-left p-4">Patient</th><th className="text-left p-4">Type</th>
                <th className="text-left p-4">Treatment</th><th className="text-left p-4">Pain</th><th className="text-left p-4">Status</th><th className="text-right p-4">Actions</th>
              </tr></thead>
              <tbody>
                {sessions.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="table-row">
                    <td className="p-4 whitespace-nowrap"><div>{formatDate(s.scheduled_at)}</div><div className="text-xs text-text-muted">{formatTime(s.scheduled_at)}</div></td>
                    <td className="p-4 font-medium">{s.patient?.name || '—'}</td>
                    <td className="p-4"><Badge variant={s.visit_type === 'clinic' ? 'teal' : 'amber'}>{s.visit_type === 'clinic' ? 'Clinic' : 'Home'}</Badge></td>
                    <td className="p-4 max-w-[180px] truncate text-text-muted">{s.treatment_given || '—'}</td>
                    <td className="p-4">{s.pain_score_before != null ? <span><span className={getPainScoreColor(s.pain_score_before)}>{s.pain_score_before}</span>→<span className={getPainScoreColor(s.pain_score_after)}>{s.pain_score_after ?? '—'}</span></span> : '—'}</td>
                    <td className="p-4"><span className={getStatusColor(s.status)}>{s.status}</span></td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {s.status === 'scheduled' && <>
                          <button onClick={() => updateSession.mutate({ id: s.id, updates: { status: 'completed' } })} className="p-1.5 rounded-lg hover:bg-accent-mint/10 text-text-muted hover:text-accent-mint" title="Complete"><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => updateSession.mutate({ id: s.id, updates: { status: 'no_show' } })} className="p-1.5 rounded-lg hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose" title="No Show"><XCircle className="w-4 h-4" /></button>
                        </>}
                        <button onClick={() => setEditSession(s)} className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text-primary"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SessionForm isOpen={formOpen || !!editSession} onClose={() => { setFormOpen(false); setEditSession(null); }} session={editSession} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { deleteSession.mutate(deleteId); setDeleteId(null); } }} title="Delete Session" message="This action cannot be undone." confirmText="Delete" loading={deleteSession.isPending} />
    </div>
  );
};
