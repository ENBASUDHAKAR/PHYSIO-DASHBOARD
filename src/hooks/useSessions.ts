import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Session, SessionInsert, SessionUpdate } from '../types';
import toast from 'react-hot-toast';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// ─── Queries ──────────────────────────────────────

export const useSessions = (filters?: { range?: 'today' | 'week' | 'month' | 'all'; patientId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['sessions', filters],
    queryFn: async () => {
      let query = supabase
        .from('sessions')
        .select('*, patient:patients(*), session_packages(*)')
        .order('scheduled_at', { ascending: true });

      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const now = new Date();
      if (filters?.range === 'today') {
        query = query.gte('scheduled_at', startOfDay(now).toISOString()).lte('scheduled_at', endOfDay(now).toISOString());
      } else if (filters?.range === 'week') {
        query = query.gte('scheduled_at', startOfWeek(now, { weekStartsOn: 1 }).toISOString()).lte('scheduled_at', endOfWeek(now, { weekStartsOn: 1 }).toISOString());
      } else if (filters?.range === 'month') {
        query = query.gte('scheduled_at', startOfMonth(now).toISOString()).lte('scheduled_at', endOfMonth(now).toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Session[];
    },
  });
};

export const useTodaySessions = () => {
  return useSessions({ range: 'today' });
};

export const usePatientSessions = (patientId: string) => {
  return useQuery({
    queryKey: ['sessions', 'patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, session_packages(*)')
        .eq('patient_id', patientId)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data as Session[];
    },
    enabled: !!patientId,
  });
};

// ─── Mutations ────────────────────────────────────

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: SessionInsert) => {
      const { data, error } = await supabase.from('sessions').insert(session).select('*, patient:patients(*)').single();
      if (error) throw error;
      return data as Session;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Session scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create session');
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SessionUpdate }) => {
      const { data, error } = await supabase.from('sessions').update(updates).eq('id', id).select('*, patient:patients(*)').single();
      if (error) throw error;
      return data as Session;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });

      if (data.status === 'completed' && data.package_id) {
        // Increment completed_sessions on the package
        supabase
          .from('session_packages')
          .select('completed_sessions, total_sessions, patient_id')
          .eq('id', data.package_id)
          .single()
          .then(({ data: pkg }) => {
            if (pkg) {
              const newCompleted = (pkg.completed_sessions || 0) + 1;
              const updates: any = { completed_sessions: newCompleted };
              if (newCompleted >= pkg.total_sessions) {
                updates.status = 'completed';
              }
              supabase.from('session_packages').update(updates).eq('id', data.package_id!).then();

              // Notification for session complete
              supabase.from('notifications').insert({
                title: 'Session Completed',
                message: `Session ${data.session_number || ''} for ${data.patient?.name || 'patient'} has been completed.`,
                type: 'appointment',
                related_patient_id: data.patient_id,
                is_read: false,
              }).then();

              // Low package alert
              const remaining = pkg.total_sessions - newCompleted;
              if (remaining <= 2 && remaining > 0) {
                supabase.from('notifications').insert({
                  title: 'Package Running Low',
                  message: `${data.patient?.name || 'Patient'} has only ${remaining} session(s) remaining in their package.`,
                  type: 'reminder',
                  related_patient_id: data.patient_id,
                  is_read: false,
                }).then();
              }

              queryClient.invalidateQueries({ queryKey: ['packages'] });
            }
          });
      }

      toast.success('Session updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update session');
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Session deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete session');
    },
  });
};
