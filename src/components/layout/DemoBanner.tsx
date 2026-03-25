import { motion } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';

export default function DemoBanner() {
  const { isDemoMode, disableDemo } = useDemo();

  if (!isDemoMode) return null;

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      className="bg-warning/10 border-b border-warning/20 px-4 py-2 flex items-center justify-center gap-3"
    >
      <Eye className="w-4 h-4 text-warning" />
      <span className="text-xs font-medium text-warning">Modo demonstração — dados fictícios, nada será salvo</span>
      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-warning hover:text-warning" onClick={disableDemo}>
        <X className="w-3 h-3 mr-1" /> Sair
      </Button>
    </motion.div>
  );
}
