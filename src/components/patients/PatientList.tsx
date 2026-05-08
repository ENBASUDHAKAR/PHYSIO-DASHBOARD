import React, { useState } from 'react';
import { Search, Plus, Filter, Users } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { PatientCard } from './PatientCard';
import { PatientForm } from './PatientForm';
import { Button } from '../ui/Button';
import { SkeletonCard } from '../ui/Spinner';
import { motion } from 'framer-motion';

const filterOptions = [
  { value: 'all', label: 'All Patients' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'home_visit', label: 'Home Visit' },
];

export const PatientList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);
  const [formOpen, setFormOpen] = useState(false);

  const { data: patients, isLoading } = usePatients({
    type: typeFilter,
    active: activeFilter,
    search: search || undefined,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Patients</h1>
          <p className="text-sm text-text-muted mt-1">Manage your patient records</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setFormOpen(true)}>
          Add Patient
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by name, phone, or diagnosis..."
          />
        </div>
        <div className="flex gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                typeFilter === opt.value
                  ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/20'
                  : 'bg-surface text-text-muted border border-border hover:text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setActiveFilter(activeFilter === undefined ? true : activeFilter ? false : undefined)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              activeFilter === false
                ? 'bg-accent-rose/10 text-accent-rose border-accent-rose/20'
                : activeFilter === undefined
                ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20'
                : 'bg-surface text-text-muted border-border hover:text-text-primary'
            }`}
          >
            {activeFilter === false ? 'Inactive' : activeFilter === undefined ? 'All' : 'Active'}
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !patients?.length ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto text-text-muted/20 mb-4" />
          <h3 className="font-display font-bold text-lg mb-2">No patients found</h3>
          <p className="text-sm text-text-muted mb-6">
            {search ? 'Try a different search term' : 'Get started by adding your first patient'}
          </p>
          {!search && (
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setFormOpen(true)}>
              Add Patient
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient, i) => (
            <PatientCard key={patient.id} patient={patient} index={i} />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <PatientForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </motion.div>
  );
};
