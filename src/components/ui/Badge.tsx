import React from 'react';

interface BadgeProps {
  variant?: 'teal' | 'mint' | 'amber' | 'rose' | 'default';
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  teal: 'badge-teal',
  mint: 'badge-mint',
  amber: 'badge-amber',
  rose: 'badge-rose',
  default: 'badge bg-surface text-text-muted border border-border',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => {
  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
