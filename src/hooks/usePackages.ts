import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { SessionPackage, SessionPackageInsert, SessionPackageUpdate } from '../types';
import toast from 'react-hot-toast';

export const usePackages = (filters?: { status?: string; patientId?: string }) => {
  return useQuery({
    queryKey: ['packages', filters],
    queryFn: async () => {
      let query = supabase
        .from('session_packages')
        .select('*, patient:patients(*)')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SessionPackage[];
    },
  });
};

export const usePatientPackages = (patientId: string) => {
  return useQuery({
    queryKey: ['packages', 'patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_packages')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SessionPackage[];
    },
    enabled: !!patientId,
  });
};

export const useActivePackage = (patientId: string) => {
  return useQuery({
    queryKey: ['packages', 'active', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_packages')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SessionPackage | null;
    },
    enabled: !!patientId,
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: SessionPackageInsert) => {
      const { data, error } = await supabase.from('session_packages').insert(pkg).select('*, patient:patients(*)').single();
      if (error) throw error;
      return data as SessionPackage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Package created successfully');

      // Payment pending notification
      if (data.payment_status === 'pending') {
        supabase.from('notifications').insert({
          title: 'Payment Pending',
          message: `Payment is pending for ${data.patient?.name || 'patient'}'s ${data.package_name || 'package'}.`,
          type: 'payment',
          related_patient_id: data.patient_id,
          is_read: false,
        }).then();
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create package');
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SessionPackageUpdate }) => {
      const { data, error } = await supabase.from('session_packages').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as SessionPackage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Package updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update package');
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('session_packages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Package deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete package');
    },
  });
};
