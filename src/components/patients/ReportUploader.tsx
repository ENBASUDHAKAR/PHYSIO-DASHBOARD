import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Download, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PatientReport } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface ReportUploaderProps {
  patientId: string;
}

const fileTypeLabels: Record<string, string> = {
  xray: 'X-Ray', mri: 'MRI', prescription: 'Prescription', other: 'Other',
};

export const ReportUploader: React.FC<ReportUploaderProps> = ({ patientId }) => {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState('other');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', patientId],
    queryFn: async () => {
      const { data, error } = await supabase.from('patient_reports').select('*').eq('patient_id', patientId).order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data as PatientReport[];
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${patientId}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from('patient-reports').upload(fileName, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('patient-reports').getPublicUrl(fileName);
      await supabase.from('patient_reports').insert({ patient_id: patientId, file_name: file.name, file_url: urlData.publicUrl, file_type: fileType, notes: null });
      qc.invalidateQueries({ queryKey: ['reports', patientId] });
      toast.success('Report uploaded');
    } catch (err: any) { toast.error(err.message || 'Upload failed'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const r = reports?.find((x) => x.id === id);
      if (r) { const p = r.file_url.split('/patient-reports/')[1]; if (p) await supabase.storage.from('patient-reports').remove([p]); }
      const { error } = await supabase.from('patient_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports', patientId] }); toast.success('Deleted'); setDeleteId(null); },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="input-field w-auto text-sm">
          {Object.entries(fileTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input ref={fileRef} type="file" onChange={handleUpload} className="hidden" accept="image/*,.pdf,.doc,.docx" />
        <Button icon={<Upload className="w-4 h-4" />} onClick={() => fileRef.current?.click()} loading={uploading} size="sm">Upload</Button>
      </div>
      {isLoading ? <div className="animate-pulse h-14 bg-elevated rounded-xl" /> : !reports?.length ? (
        <div className="text-center py-8"><FileText className="w-10 h-10 mx-auto text-text-muted/20 mb-2" /><p className="text-sm text-text-muted">No reports yet</p></div>
      ) : (
        <div className="space-y-2">
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-3 bg-base rounded-xl border border-border">
              <div className="w-10 h-10 rounded-lg bg-accent-teal/10 flex items-center justify-center"><FileText className="w-5 h-5 text-accent-teal" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.file_name}</p>
                <div className="flex items-center gap-2 mt-0.5"><Badge variant="teal">{fileTypeLabels[r.file_type || 'other']}</Badge><span className="text-[10px] text-text-muted">{formatDate(r.uploaded_at)}</span></div>
              </div>
              <div className="flex items-center gap-1">
                <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-accent-teal"><Eye className="w-4 h-4" /></a>
                <a href={r.file_url} download className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-accent-teal"><Download className="w-4 h-4" /></a>
                <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose"><Trash2 className="w-4 h-4" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && delMut.mutate(deleteId)} title="Delete Report" message="This cannot be undone." confirmText="Delete" loading={delMut.isPending} />
    </div>
  );
};
