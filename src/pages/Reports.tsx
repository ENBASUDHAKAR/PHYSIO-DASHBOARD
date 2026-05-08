import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Download, Eye, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PatientReport } from '../types';
import { formatDate } from '../utils/formatters';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SkeletonRow } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const typeLabels: Record<string, string> = { xray: 'X-Ray', mri: 'MRI', prescription: 'Rx', other: 'Other' };

const Reports: React.FC = () => {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', 'all', search],
    queryFn: async () => {
      let query = supabase.from('patient_reports').select('*, patient:patients(name)').order('uploaded_at', { ascending: false });
      if (search) query = query.or(`file_name.ilike.%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data as (PatientReport & { patient: { name: string } })[];
    },
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const r = reports?.find((x) => x.id === id);
      if (r) { const p = r.file_url.split('/patient-reports/')[1]; if (p) await supabase.storage.from('patient-reports').remove([p]); }
      const { error } = await supabase.from('patient_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('Deleted'); setDeleteId(null); },
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-display font-bold">Reports</h1><p className="text-sm text-text-muted mt-1">Patient reports & documents</p></div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search reports..." />
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : !reports?.length ? (
          <div className="text-center py-16"><FileText className="w-16 h-16 mx-auto text-text-muted/20 mb-4" /><h3 className="font-display font-bold text-lg mb-2">No reports</h3><p className="text-sm text-text-muted">Upload reports from patient detail pages</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-text-muted text-xs">
                <th className="text-left p-4">Patient</th><th className="text-left p-4">File</th><th className="text-left p-4">Type</th><th className="text-left p-4">Date</th><th className="text-right p-4">Actions</th>
              </tr></thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="p-4 font-medium">{r.patient?.name || '—'}</td>
                    <td className="p-4 max-w-[200px] truncate text-text-muted">{r.file_name}</td>
                    <td className="p-4"><Badge variant="teal">{typeLabels[r.file_type || 'other']}</Badge></td>
                    <td className="p-4 text-text-muted">{formatDate(r.uploaded_at)}</td>
                    <td className="p-4"><div className="flex items-center justify-end gap-1">
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-accent-teal"><Eye className="w-4 h-4" /></a>
                      <a href={r.file_url} download className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-accent-teal"><Download className="w-4 h-4" /></a>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && delMut.mutate(deleteId)} title="Delete Report" message="This cannot be undone." confirmText="Delete" loading={delMut.isPending} />
    </motion.div>
  );
};

export default Reports;
