import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input, TextArea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { usePatients } from '../../hooks/usePatients';
import { useActivePackage } from '../../hooks/usePackages';
import { useCreateSession, useUpdateSession } from '../../hooks/useSessions';
import { TREATMENTS } from '../../types';
import type { Session } from '../../types';

const sessionSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  package_id: z.string().nullable().optional(),
  session_number: z.coerce.number().nullable().optional(),
  scheduled_at: z.string().min(1, 'Date & time required'),
  visit_type: z.enum(['clinic', 'home_visit']),
  treatment_given: z.string().nullable().optional(),
  pain_score_before: z.coerce.number().min(0).max(10).nullable().optional(),
  pain_score_after: z.coerce.number().min(0).max(10).nullable().optional(),
  duration_minutes: z.coerce.number().default(45),
  notes: z.string().nullable().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).default('scheduled'),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  session?: Session | null;
  preselectedPatientId?: string;
}

export const SessionForm: React.FC<SessionFormProps> = ({ isOpen, onClose, session, preselectedPatientId }) => {
  const isEditing = !!session;
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const { data: patients } = usePatients();
  const [showTreatments, setShowTreatments] = useState(false);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(
    session?.treatment_given ? session.treatment_given.split(', ') : []
  );

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: session ? {
      patient_id: session.patient_id,
      package_id: session.package_id,
      session_number: session.session_number,
      scheduled_at: session.scheduled_at?.slice(0, 16),
      visit_type: session.visit_type,
      treatment_given: session.treatment_given,
      pain_score_before: session.pain_score_before,
      pain_score_after: session.pain_score_after,
      duration_minutes: session.duration_minutes,
      notes: session.notes,
      status: session.status,
    } : {
      patient_id: preselectedPatientId || '',
      visit_type: 'clinic',
      duration_minutes: 45,
      status: 'scheduled',
      scheduled_at: new Date().toISOString().slice(0, 16),
    },
  });

  const patientId = watch('patient_id');
  const { data: activePkg } = useActivePackage(patientId || '');

  React.useEffect(() => {
    if (activePkg && !isEditing) {
      setValue('package_id', activePkg.id);
      setValue('session_number', (activePkg.completed_sessions || 0) + 1);
    }
  }, [activePkg, isEditing, setValue]);

  const toggleTreatment = (t: string) => {
    const next = selectedTreatments.includes(t) ? selectedTreatments.filter((x) => x !== t) : [...selectedTreatments, t];
    setSelectedTreatments(next);
    setValue('treatment_given', next.join(', '));
  };

  const onSubmit = async (data: SessionFormData) => {
    const payload = {
      ...data,
      package_id: data.package_id || null,
      session_number: data.session_number || null,
      treatment_given: data.treatment_given || null,
      pain_score_before: data.pain_score_before ?? null,
      pain_score_after: data.pain_score_after ?? null,
      notes: data.notes || null,
    };
    if (isEditing) {
      await updateSession.mutateAsync({ id: session!.id, updates: payload });
    } else {
      await createSession.mutateAsync(payload as any);
    }
    reset();
    setSelectedTreatments([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={isEditing ? 'Edit Session' : 'New Session'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Patient selector */}
        {!preselectedPatientId && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-muted">Patient *</label>
            <select {...register('patient_id')} className="input-field">
              <option value="">Select patient</option>
              {patients?.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>)}
            </select>
            {errors.patient_id && <p className="text-xs text-accent-rose">{errors.patient_id.message}</p>}
          </div>
        )}

        {activePkg && (
          <div className="p-3 rounded-xl bg-accent-teal/5 border border-accent-teal/10 text-xs">
            📦 Active: <span className="font-medium text-accent-teal">{activePkg.package_name}</span> — Session {(activePkg.completed_sessions || 0) + 1}/{activePkg.total_sessions}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Date & Time" type="datetime-local" {...register('scheduled_at')} error={errors.scheduled_at?.message} required />
          <Select label="Visit Type" {...register('visit_type')} required options={[{ value: 'clinic', label: 'Clinic' }, { value: 'home_visit', label: 'Home Visit' }]} />
        </div>

        {/* Treatment toggles */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-muted">Treatment Given</label>
          <div className="flex flex-wrap gap-2">
            {TREATMENTS.map((t) => (
              <button key={t} type="button" onClick={() => toggleTreatment(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedTreatments.includes(t) ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/30' : 'bg-surface text-text-muted border-border hover:border-accent-teal/20'}`}>
                {t}
              </button>
            ))}
          </div>
          <input type="hidden" {...register('treatment_given')} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input label="Pain Before (0-10)" type="number" {...register('pain_score_before', { valueAsNumber: true })} min={0} max={10} placeholder="0-10" />
          <Input label="Pain After (0-10)" type="number" {...register('pain_score_after', { valueAsNumber: true })} min={0} max={10} placeholder="0-10" />
          <Input label="Duration (min)" type="number" {...register('duration_minutes', { valueAsNumber: true })} />
          <Input label="Session #" type="number" {...register('session_number', { valueAsNumber: true })} />
        </div>

        <Select label="Status" {...register('status')} options={[
          { value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }, { value: 'no_show', label: 'No Show' },
        ]} />

        <TextArea label="Notes" {...register('notes')} placeholder="Session notes..." />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" type="button" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" loading={createSession.isPending || updateSession.isPending}>{isEditing ? 'Update' : 'Create Session'}</Button>
        </div>
      </form>
    </Modal>
  );
};
