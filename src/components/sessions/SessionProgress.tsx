import React from 'react';
import { motion } from 'framer-motion';

interface SessionProgressProps {
  completed: number;
  total: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const SessionProgress: React.FC<SessionProgressProps> = ({
  completed,
  total,
  showLabel = true,
  size = 'md',
}) => {
  const percentage = total > 0 ? Math.min((completed / total) * 100, 100) : 0;
  const isComplete = completed >= total;

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Sessions Progress</span>
          <span className={`text-xs font-medium ${isComplete ? 'text-accent-mint' : 'text-accent-teal'}`}>
            {completed}/{total}
          </span>
        </div>
      )}
      <div className={`w-full bg-base rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className={`h-full rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-accent-mint to-accent-teal'
              : 'bg-gradient-to-r from-accent-teal to-accent-teal/60'
          }`}
        />
      </div>
    </div>
  );
};
