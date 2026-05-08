import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { usePackages, useDeletePackage } from '../../hooks/usePackages';
import { PackageForm } from './PackageForm';
import { SessionProgress } from '../sessions/SessionProgress';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SkeletonCard } from '../ui/Spinner';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import type { SessionPackage } from '../../types';

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
];

export const PackageList: React.FC = () => {
  const [filter, setFilter] = useState('active');
  const [formOpen, setFormOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<SessionPackage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: packages, isLoading } = usePackages({ status: filter });
  const deletePkg = useDeletePackage();
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-display font-bold">Packages</h1><p className="text-sm text-text-muted mt-1">Session packages & payment tracking</p></div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setFormOpen(true)}>Add Package</Button>
      </div>

      <div className="flex gap-1 bg-surface rounded-xl p-1 w-fit mb-6">
        {filterOptions.map((opt) => (
          <button key={opt.value} onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === opt.value ? 'bg-accent-teal/10 text-accent-teal' : 'text-text-muted hover:text-text-primary'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : !packages?.length ? (
        <div className="text-center py-16"><Package className="w-16 h-16 mx-auto text-text-muted/20 mb-4" /><h3 className="font-display font-bold text-lg mb-2">No packages found</h3><p className="text-sm text-text-muted">Create a session package for a patient</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg, i) => (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="cursor-pointer" onClick={() => pkg.patient_id && navigate(`/patients/${pkg.patient_id}`)}>
                  <p className="text-sm font-medium hover:text-accent-teal transition-colors">{(pkg as any).patient?.name || 'Unknown'}</p>
                  <p className="text-xs text-text-muted">{pkg.package_name || 'Package'}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditPkg(pkg)} className="p-1 rounded-lg hover:bg-elevated text-text-muted"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteId(pkg.id)} className="p-1 rounded-lg hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <SessionProgress completed={pkg.completed_sessions} total={pkg.total_sessions} />

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="text-xs text-text-muted">
                  <span>Fee: {formatCurrency(pkg.package_fee)}</span>
                  <span className="mx-2">•</span>
                  <span>Paid: {formatCurrency(pkg.amount_paid)}</span>
                </div>
                <Badge variant={pkg.payment_status === 'paid' ? 'mint' : pkg.payment_status === 'partial' ? 'amber' : 'rose'}>
                  {pkg.payment_status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <PackageForm isOpen={formOpen || !!editPkg} onClose={() => { setFormOpen(false); setEditPkg(null); }} pkg={editPkg} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { deletePkg.mutate(deleteId); setDeleteId(null); } }} title="Delete Package" message="This will also affect linked sessions." confirmText="Delete" loading={deletePkg.isPending} />
    </motion.div>
  );
};
