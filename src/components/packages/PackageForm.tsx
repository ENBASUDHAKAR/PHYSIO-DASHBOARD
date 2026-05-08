import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input, TextArea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { usePatients } from '../../hooks/usePatients';
import { useCreatePackage, useUpdatePackage } from '../../hooks/usePackages';
import { PACKAGE_TEMPLATES } from '../../types';
import type { SessionPackage } from '../../types';

const packageSchema = z.object({
  patient_id: z.string().min(1, 'Patient required'),
  package_name: z.string().nullable().optional(),
  total_sessions: z.coerce.number().min(1, 'At least 1 session'),
  session_fee: z.coerce.number().nullable().optional(),
  package_fee: z.coerce.number().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  payment_status: z.enum(['paid', 'partial', 'pending']).default('pending'),
  amount_paid: z.coerce.number().default(0),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active'),
  notes: z.string().nullable().optional(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
  isOpen: boolean;
  onClose: () => void;
  pkg?: SessionPackage | null;
  preselectedPatientId?: string;
}

export const PackageForm: React.FC<PackageFormProps> = ({ isOpen, onClose, pkg, preselectedPatientId }) => {
  const isEditing = !!pkg;
  const createPkg = useCreatePackage();
  const updatePkg = useUpdatePackage();
  const { data: patients } = usePatients();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: pkg ? {
      patient_id: pkg.patient_id, package_name: pkg.package_name, total_sessions: pkg.total_sessions,
      session_fee: pkg.session_fee, package_fee: pkg.package_fee, start_date: pkg.start_date,
      end_date: pkg.end_date, payment_status: pkg.payment_status, amount_paid: pkg.amount_paid,
      status: pkg.status, notes: pkg.notes,
    } : { patient_id: preselectedPatientId || '', total_sessions: 10, payment_status: 'pending', amount_paid: 0, status: 'active' },
  });

  const handleTemplateClick = (t: string) => {
    setValue('package_name', t);
    const num = parseInt(t);
    if (!isNaN(num)) setValue('total_sessions', num);
  };

  const onSubmit = async (data: PackageFormData) => {
    const payload = { ...data, completed_sessions: pkg?.completed_sessions || 0, package_name: data.package_name || null, session_fee: data.session_fee || null, package_fee: data.package_fee || null, start_date: data.start_date || null, end_date: data.end_date || null, notes: data.notes || null };
    if (isEditing) { await updatePkg.mutateAsync({ id: pkg!.id, updates: payload }); }
    else { await createPkg.mutateAsync(payload as any); }
    reset(); onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={isEditing ? 'Edit Package' : 'New Package'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!preselectedPatientId && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-muted">Patient *</label>
            <select {...register('patient_id')} className="input-field">
              <option value="">Select patient</option>
              {patients?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.patient_id && <p className="text-xs text-accent-rose">{errors.patient_id.message}</p>}
          </div>
        )}

        {/* Quick Templates */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-muted">Quick Templates</label>
          <div className="flex flex-wrap gap-2">
            {PACKAGE_TEMPLATES.map((t) => (
              <button key={t} type="button" onClick={() => handleTemplateClick(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface text-text-muted border border-border hover:border-accent-teal/20 hover:text-accent-teal transition-all">
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Package Name" {...register('package_name')} placeholder="e.g., 10 Session Package" />
          <Input label="Total Sessions" type="number" {...register('total_sessions', { valueAsNumber: true })} error={errors.total_sessions?.message} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Session Fee (₹)" type="number" {...register('session_fee', { valueAsNumber: true })} placeholder="Per session" />
          <Input label="Package Fee (₹)" type="number" {...register('package_fee', { valueAsNumber: true })} placeholder="Total fee" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Payment Status" {...register('payment_status')} options={[{ value: 'paid', label: 'Paid' }, { value: 'partial', label: 'Partial' }, { value: 'pending', label: 'Pending' }]} />
          <Input label="Amount Paid (₹)" type="number" {...register('amount_paid', { valueAsNumber: true })} />
          <Select label="Status" {...register('status')} options={[{ value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'paused', label: 'Paused' }, { value: 'cancelled', label: 'Cancelled' }]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Start Date" type="date" {...register('start_date')} />
          <Input label="End Date" type="date" {...register('end_date')} />
        </div>

        <TextArea label="Notes" {...register('notes')} placeholder="Package notes..." />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" type="button" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" loading={createPkg.isPending || updatePkg.isPending}>{isEditing ? 'Update' : 'Create Package'}</Button>
        </div>
      </form>
    </Modal>
  );
};
