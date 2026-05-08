import { format, formatDistanceToNow, parseISO, isToday, isThisMonth, isThisWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// ─── Date Formatters ──────────────────────────────

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy, hh:mm a');
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'hh:mm a');
};

export const formatRelative = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatMonthYear = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM yyyy');
};

export const formatShortDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM');
};

// ─── Currency ─────────────────────────────────────

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ─── Phone ────────────────────────────────────────

export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

// ─── Pain Score ───────────────────────────────────

export const getPainScoreColor = (score: number | null): string => {
  if (score == null) return 'text-text-muted';
  if (score <= 3) return 'text-accent-mint';
  if (score <= 6) return 'text-accent-amber';
  return 'text-accent-rose';
};

export const getPainScoreBg = (score: number | null): string => {
  if (score == null) return 'bg-surface';
  if (score <= 3) return 'bg-accent-mint/10 border-accent-mint/20';
  if (score <= 6) return 'bg-accent-amber/10 border-accent-amber/20';
  return 'bg-accent-rose/10 border-accent-rose/20';
};

export const getPainScoreLabel = (score: number | null): string => {
  if (score == null) return 'N/A';
  if (score <= 3) return 'Mild';
  if (score <= 6) return 'Moderate';
  return 'Severe';
};

// ─── Status ───────────────────────────────────────

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'completed':
    case 'paid':
      return 'badge-mint';
    case 'scheduled':
      return 'badge-teal';
    case 'paused':
    case 'partial':
    case 'pending':
      return 'badge-amber';
    case 'cancelled':
    case 'no_show':
      return 'badge-rose';
    default:
      return 'badge-teal';
  }
};

export const getVisitTypeBadge = (type: string): string => {
  return type === 'clinic' ? 'badge-teal' : 'badge-amber';
};

// ─── Date Checks ──────────────────────────────────

export { isToday, isThisMonth, isThisWeek, startOfMonth, endOfMonth, subMonths, parseISO, format };
