import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ReportUploaderProps {
  patientId: string;
}

export const ReportUploader: React.FC<ReportUploaderProps> = ({ patientId }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const detectFileType = (file: File): string => {
    if (file.type === 'application/pdf') return 'prescription';
    if (file.type.startsWith('image/')) return 'xray';
    if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) return 'other';
    return 'other';
  };

  const uploadFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const filePath = `reports/${patientId}/${Date.now()}_${file.name}`;

      // Simulate progress (Supabase JS v2 doesn't expose upload progress natively)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 85));
      }, 200);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-reports')
        .upload(filePath, file, { upsert: false });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setProgress(95);

      // Get signed URL
      const { data: signedData, error: signedError } = await supabase.storage
        .from('patient-reports')
        .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

      if (signedError) throw signedError;

      // Insert into patient_reports table
      const { error: dbError } = await supabase
        .from('patient_reports')
        .insert({
          patient_id: patientId,
          file_name: file.name,
          file_url: signedData.signedUrl,
          file_type: detectFileType(file),
          storage_path: filePath,
          notes: '',
        });

      if (dbError) throw dbError;

      setProgress(100);

      // Invalidate both old and new query keys for compatibility
      await queryClient.invalidateQueries({ queryKey: ['patient-reports', patientId] });
      await queryClient.invalidateQueries({ queryKey: ['reports', patientId] });
      toast.success(`"${file.name}" uploaded successfully!`);

      setTimeout(() => {
        setProgress(0);
        setUploading(false);
      }, 1000);
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message || 'Unknown error'}`);
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging
            ? 'border-accent-teal bg-accent-teal/10'
            : 'border-border hover:border-accent-teal/60 hover:bg-accent-teal/5'
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-center gap-2 text-accent-teal">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Upload className="w-6 h-6" />
                </motion.div>
                <span className="text-sm font-medium">Uploading... {progress}%</span>
              </div>
              <div className="w-full bg-elevated rounded-full h-2">
                <motion.div
                  className="bg-accent-teal h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <Upload className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-sm text-text-secondary font-medium">
                Drop file here or <span className="text-accent-teal">click to browse</span>
              </p>
              <p className="text-xs text-text-muted">
                PDF, Images, Word Documents (max 10MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
