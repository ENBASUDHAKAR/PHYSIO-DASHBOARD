import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Building2, Home, Stethoscope, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { formatPhone } from '../../utils/formatters';
import type { Patient } from '../../types';

interface PatientCardProps {
  patient: Patient;
  index: number;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/patients/${patient.id}`)}
      className="glass-card p-5 cursor-pointer hover:border-accent-teal/30 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent-teal/20 to-accent-mint/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-accent-teal">
              {patient.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-sm">{patient.name}</h3>
            {patient.age && patient.gender && (
              <p className="text-xs text-text-muted">
                {patient.age} yrs • {patient.gender}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {patient.diagnosis && (
        <div className="flex items-center gap-1.5 mb-3">
          <Stethoscope className="w-3.5 h-3.5 text-accent-teal" />
          <span className="text-xs text-accent-teal">{patient.diagnosis}</span>
        </div>
      )}

      <div className="space-y-1.5 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3 h-3" />
          <span>{formatPhone(patient.phone)}</span>
        </div>
        {patient.area && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            <span>{patient.area}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <Badge variant={patient.patient_type === 'clinic' ? 'teal' : 'amber'}>
          {patient.patient_type === 'clinic' ? (
            <><Building2 className="w-3 h-3" /> Clinic</>
          ) : (
            <><Home className="w-3 h-3" /> Home Visit</>
          )}
        </Badge>
        {!patient.is_active && <Badge variant="rose">Inactive</Badge>}
      </div>
    </motion.div>
  );
};
