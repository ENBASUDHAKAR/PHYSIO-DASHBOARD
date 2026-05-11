import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { PatientReport } from '../types';

export function usePatientReports(patientId: string) {
  return useQuery({
    queryKey: ['patient-reports', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_reports')
        .select('*')
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data as PatientReport[];
    },
    enabled: !!patientId,
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reportId,
      filePath,
      patientId,
    }: {
      reportId: string;
      filePath: string;
      patientId: string;
    }) => {
      // Delete from storage
      if (filePath) {
        await supabase.storage.from('patient-reports').remove([filePath]);
      }
      // Delete from DB
      const { error } = await supabase
        .from('patient_reports')
        .delete()
        .eq('id', reportId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patient-reports', variables.patientId],
      });
      // Also invalidate old key for compatibility
      queryClient.invalidateQueries({
        queryKey: ['reports', variables.patientId],
      });
      toast.success('Report deleted');
    },
    onError: () => toast.error('Failed to delete report'),
  });
}

/**
 * Generates a fresh signed URL for viewing a report.
 * This avoids the expiry issue with stored signed URLs.
 */
export async function getReportViewUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('patient-reports')
    .createSignedUrl(storagePath, 3600); // 1 hour
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
