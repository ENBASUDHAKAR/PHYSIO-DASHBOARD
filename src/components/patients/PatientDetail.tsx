import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Phone, MapPin, Building2, Home, Stethoscope, Plus, Trash2 } from 'lucide-react';
import { usePatient, useDeletePatient } from '../../hooks/usePatients';
import { usePatientSessions } from '../../hooks/useSessions';
import { usePatientPackages } from '../../hooks/usePackages';
import { PatientForm } from './PatientForm';
import { SessionProgress } from '../sessions/SessionProgress';
import { SessionForm } from '../sessions/SessionForm';
import { PackageForm } from '../packages/PackageForm';
import { ReportUploader } from './ReportUploader';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { PageLoader } from '../ui/Spinner';
import { formatDate, formatTime, formatPhone, formatCurrency, getPainScoreColor, getStatusColor } from '../../utils/formatters';

export const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient(id!);
  const { data: sessions } = usePatientSessions(id!);
  const { data: packages } = usePatientPackages(id!);
  const deletePatient = useDeletePatient();

  const [editOpen, setEditOpen] = useState(false);
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [packageFormOpen, setPackageFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [tab, setTab] = useState<'sessions' | 'reports' | 'notes'>('sessions');

  if (isLoading) return <PageLoader />;
  if (!patient) return <div className="text-center py-16 text-text-muted">Patient not found</div>;

  const activePackage = packages?.find((p) => p.status === 'active');
  const tabs = [
    { key: 'sessions', label: 'Sessions' },
    { key: 'reports', label: 'Reports' },
    { key: 'notes', label: 'Notes' },
  ] as const;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Back */}
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Patients
      </button>

      {/* Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-teal/20 to-accent-mint/20 flex items-center justify-center">
              <span className="text-xl font-bold text-accent-teal">{patient.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">{patient.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {patient.age && <span className="text-sm text-text-muted">{patient.age} yrs</span>}
                {patient.gender && <span className="text-sm text-text-muted">• {patient.gender}</span>}
                <Badge variant={patient.patient_type === 'clinic' ? 'teal' : 'amber'}>
                  {patient.patient_type === 'clinic' ? <><Building2 className="w-3 h-3" /> Clinic</> : <><Home className="w-3 h-3" /> Home</>}
                </Badge>
                {!patient.is_active && <Badge variant="rose">Inactive</Badge>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />} onClick={() => setEditOpen(true)}>Edit</Button>
            <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={() => setDeleteOpen(true)}>Delete</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
          {patient.diagnosis && (
            <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-accent-teal" /><span className="text-sm">{patient.diagnosis}</span></div>
          )}
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-text-muted" /><span className="text-sm">{formatPhone(patient.phone)}</span></div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-text-muted" /><span className="text-sm">{patient.area || patient.address}</span></div>
        </div>
      </div>

      {/* Active Package */}
      {activePackage && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold">{activePackage.package_name || 'Session Package'}</h3>
            <Badge variant={activePackage.payment_status === 'paid' ? 'mint' : activePackage.payment_status === 'partial' ? 'amber' : 'rose'}>
              {activePackage.payment_status}
            </Badge>
          </div>
          <SessionProgress completed={activePackage.completed_sessions} total={activePackage.total_sessions} />
          <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
            <span>Fee: {formatCurrency(activePackage.package_fee)}</span>
            <span>Paid: {formatCurrency(activePackage.amount_paid)}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setSessionFormOpen(true)}>Add Session</Button>
        <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setPackageFormOpen(true)}>Add Package</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-surface rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-accent-teal/10 text-accent-teal' : 'text-text-muted hover:text-text-primary'}`}>{t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'sessions' && (
        <div className="glass-card overflow-hidden">
          {!sessions?.length ? (
            <div className="text-center py-12 text-text-muted text-sm">No sessions recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-text-muted text-xs">
                  <th className="text-left p-4">Date/Time</th><th className="text-left p-4">Type</th><th className="text-left p-4">Treatment</th>
                  <th className="text-left p-4">Pain</th><th className="text-left p-4">Status</th>
                </tr></thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="table-row">
                      <td className="p-4"><div>{formatDate(s.scheduled_at)}</div><div className="text-xs text-text-muted">{formatTime(s.scheduled_at)}</div></td>
                      <td className="p-4"><Badge variant={s.visit_type === 'clinic' ? 'teal' : 'amber'}>{s.visit_type === 'clinic' ? 'Clinic' : 'Home'}</Badge></td>
                      <td className="p-4 max-w-[200px] truncate">{s.treatment_given || '—'}</td>
                      <td className="p-4">{s.pain_score_before != null ? <span><span className={getPainScoreColor(s.pain_score_before)}>{s.pain_score_before}</span> → <span className={getPainScoreColor(s.pain_score_after)}>{s.pain_score_after ?? '—'}</span></span> : '—'}</td>
                      <td className="p-4"><span className={getStatusColor(s.status)}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'reports' && <div className="glass-card p-6"><ReportUploader patientId={id!} /></div>}
      {tab === 'notes' && <div className="glass-card p-6"><p className="text-sm text-text-muted whitespace-pre-wrap">{patient.notes || 'No notes added.'}</p>{patient.referred_by && <p className="text-sm mt-4"><span className="text-text-muted">Referred by:</span> {patient.referred_by}</p>}</div>}

      {/* Modals */}
      <PatientForm isOpen={editOpen} onClose={() => setEditOpen(false)} patient={patient} />
      <SessionForm isOpen={sessionFormOpen} onClose={() => setSessionFormOpen(false)} preselectedPatientId={id} />
      <PackageForm isOpen={packageFormOpen} onClose={() => setPackageFormOpen(false)} preselectedPatientId={id} />
      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => { deletePatient.mutate(id!); navigate('/patients'); }} title="Delete Patient" message={`Delete ${patient.name}? All sessions and packages will also be deleted.`} confirmText="Delete" loading={deletePatient.isPending} />
    </motion.div>
  );
};
