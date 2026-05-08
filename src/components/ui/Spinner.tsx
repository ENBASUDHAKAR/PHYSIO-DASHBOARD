import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className={`${sizeMap[size]} ${className}`}>
      <div className="w-full h-full border-2 border-border border-t-accent-teal rounded-full animate-spin" />
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-card p-6 animate-pulse ${className}`}>
    <div className="h-4 bg-elevated rounded w-1/3 mb-4" />
    <div className="h-8 bg-elevated rounded w-1/2 mb-2" />
    <div className="h-3 bg-elevated rounded w-2/3" />
  </div>
);

export const SkeletonRow: React.FC = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-10 h-10 bg-elevated rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-elevated rounded w-1/3" />
      <div className="h-3 bg-elevated rounded w-1/2" />
    </div>
    <div className="h-6 bg-elevated rounded w-16" />
  </div>
);
