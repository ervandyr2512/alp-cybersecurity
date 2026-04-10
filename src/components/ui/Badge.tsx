import { cn } from '@/lib/utils/cn';
import type { DonorStatus } from '@/types';

type BadgeVariant = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'teal';

const variantClasses: Record<BadgeVariant, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
  teal: 'bg-teal-100 text-teal-800',
};

export function Badge({
  children,
  variant = 'gray',
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

const donorStatusConfig: Record<DonorStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Menunggu', variant: 'yellow' },
  screening: { label: 'Screening', variant: 'blue' },
  eligible: { label: 'Eligible', variant: 'green' },
  assigned: { label: 'Ditugaskan', variant: 'teal' },
  rejected: { label: 'Ditolak', variant: 'red' },
};

export function DonorStatusBadge({ status }: { status: DonorStatus }) {
  const config = donorStatusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
