import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input, TextArea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { DIAGNOSES } from '../../types';
import type { Patient } from '../../types';
import { useCreatePatient, useUpdatePatient } from '../../hooks/usePatients';

const patientSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  age: z.coerce.number().min(0).max(150).nullable().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).nullable().optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  alt_phone: z.string().optional().nullable(),
  address: z.string().min(3, 'Address is required'),
  area: z.string().optional().nullable(),
  patient_type: z.enum(['clinic', 'home_visit']),
  diagnosis: z.string().optional().nullable(),
  referred_by: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
}

export const PatientForm: React.FC<PatientFormProps> = ({ isOpen, onClose, patient }) => {
  const isEditing = !!patient;
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient
      ? {
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          phone: patient.phone,
          alt_phone: patient.alt_phone,
          address: patient.address,
          area: patient.area,
          patient_type: patient.patient_type,
          diagnosis: patient.diagnosis,
          referred_by: patient.referred_by,
          notes: patient.notes,
          is_active: patient.is_active,
        }
      : { patient_type: 'clinic', is_active: true },
  });

  const diagnosisValue = watch('diagnosis') || '';

  const filteredDiagnoses = DIAGNOSES.filter((d) =>
    d.toLowerCase().includes(diagnosisValue.toLowerCase())
  );

  const onSubmit = async (data: PatientFormData) => {
    const payload = {
      ...data,
      age: data.age || null,
      gender: data.gender || null,
      alt_phone: data.alt_phone || null,
      area: data.area || null,
      diagnosis: data.diagnosis || null,
      referred_by: data.referred_by || null,
      notes: data.notes || null,
    };

    if (isEditing) {
      await updatePatient.mutateAsync({ id: patient!.id, updates: payload });
    } else {
      await createPatient.mutateAsync(payload as any);
    }
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? 'Edit Patient' : 'Add New Patient'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Patient Name" {...register('name')} error={errors.name?.message} required placeholder="Full name" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Age" type="number" {...register('age', { valueAsNumber: true })} error={errors.age?.message} placeholder="Age" />
            <Select
              label="Gender"
              {...register('gender')}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
              placeholder="Select"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Phone" {...register('phone')} error={errors.phone?.message} required placeholder="10-digit number" />
          <Input label="Alt Phone" {...register('alt_phone')} placeholder="Optional" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Address" {...register('address')} error={errors.address?.message} required placeholder="Full address" />
          <Input label="Area / Locality" {...register('area')} placeholder="e.g., Anna Nagar" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Patient Type"
            {...register('patient_type')}
            error={errors.patient_type?.message}
            required
            options={[
              { value: 'clinic', label: 'Clinic Visit' },
              { value: 'home_visit', label: 'Home Visit' },
            ]}
          />
          <Input label="Referred By" {...register('referred_by')} placeholder="Doctor or self-referral" />
        </div>

        {/* Diagnosis with auto-suggest */}
        <div className="relative">
          <Input
            label="Diagnosis"
            {...register('diagnosis')}
            placeholder="e.g., Frozen Shoulder"
            onFocus={() => setShowDiagnosisSuggestions(true)}
            onBlur={() => setTimeout(() => setShowDiagnosisSuggestions(false), 200)}
          />
          {showDiagnosisSuggestions && diagnosisValue && filteredDiagnoses.length > 0 && (
            <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-elevated border border-border rounded-xl shadow-xl max-h-40 overflow-y-auto">
              {filteredDiagnoses.map((d) => (
                <button
                  key={d}
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm hover:bg-surface text-text-primary transition-colors"
                  onMouseDown={() => {
                    setValue('diagnosis', d);
                    setShowDiagnosisSuggestions(false);
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        <TextArea label="Notes" {...register('notes')} placeholder="Any additional notes..." />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createPatient.isPending || updatePatient.isPending}>
            {isEditing ? 'Update Patient' : 'Add Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
