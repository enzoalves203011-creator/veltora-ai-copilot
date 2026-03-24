import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: 'risk' | 'opportunity' | 'info' | 'action';
  actionLabel?: string;
  onAction?: () => void;
  delay?: number;
}

const variantColors = {
  risk: { bg: 'bg-destructive/10', border: 'border-destructive/20', text: 'text-destructive', icon: 'text-destructive' },
  opportunity: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', icon: 'text-success' },
  info: { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', icon: 'text-primary' },
  action: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', icon: 'text-warning' },
};

export default function InsightCard({ icon: Icon, title, description, variant = 'info', actionLabel, onAction, delay = 0 }: InsightCardProps) {
  const colors = variantColors[variant];

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn("flex items-start gap-3 p-3 rounded-lg border", colors.bg, colors.border)}
    >
      <div className="mt-0.5">
        <Icon className={cn("w-4 h-4", colors.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        {actionLabel && (
          <button
            onClick={onAction}
            className={cn("flex items-center gap-1 text-xs font-medium mt-2 hover:underline", colors.text)}
          >
            {actionLabel}
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
