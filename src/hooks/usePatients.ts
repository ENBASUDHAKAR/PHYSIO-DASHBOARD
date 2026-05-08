import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Patient, PatientInsert, PatientUpdate } from '../types';
import toast from 'react-hot-toast';

// ─── Queries ──────────────────────────────────────

export const usePatients = (filters?: { type?: string; active?: boolean; search?: string }) => {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: async () => {
      let query = supabase.from('patients').select('*').order('created_at', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('patient_type', filters.type);
      }
      if (filters?.active !== undefined) {
        query = query.eq('is_active', filters.active);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,diagnosis.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Patient[];
    },
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Patient;
    },
    enabled: !!id,
  });
};

// ─── Mutations ────────────────────────────────────

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: PatientInsert) => {
      const { data, error } = await supabase.from('patients').insert(patient).select().single();
      if (error) throw error;
      return data as Patient;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      // Create notification
      supabase.from('notifications').insert({
        title: 'New Patient Added',
        message: `${data.name} has been registered as a new ${data.patient_type === 'clinic' ? 'clinic' : 'home visit'} patient.`,
        type: 'system',
        related_patient_id: data.id,
        is_read: false,
      }).then();
      toast.success(`Patient "${data.name}" added successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add patient');
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PatientUpdate }) => {
      const { data, error } = await supabase.from('patients').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Patient;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Patient "${data.name}" updated`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update patient');
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Patient deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete patient');
    },
  });
};
