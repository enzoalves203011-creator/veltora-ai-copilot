import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("text-center py-16", className)}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4"
      >
        <Icon className="w-8 h-8 text-muted-foreground/50" />
      </motion.div>
      <h3 className="font-display font-semibold text-base mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gradient-primary text-primary-foreground">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
