import { motion, AnimatePresence } from 'framer-motion';
import { Check, Users, Package, ShoppingCart, Calendar, Rocket, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Step {
  key: string;
  label: string;
  description: string;
  icon: any;
  completed: boolean;
  route: string;
}

interface OnboardingChecklistProps {
  hasClients: boolean;
  hasProducts: boolean;
  hasSales: boolean;
  hasVisits: boolean;
}

export default function OnboardingChecklist({ hasClients, hasProducts, hasSales, hasVisits }: OnboardingChecklistProps) {
  const navigate = useNavigate();

  const steps: Step[] = [
    { key: 'client', label: 'Criar primeiro cliente', description: 'Cadastre seu primeiro cliente para começar', icon: Users, completed: hasClients, route: '/clients' },
    { key: 'product', label: 'Cadastrar produto', description: 'Adicione seus produtos ao catálogo', icon: Package, completed: hasProducts, route: '/products' },
    { key: 'sale', label: 'Registrar primeira venda', description: 'Registre uma venda para ativar métricas', icon: ShoppingCart, completed: hasSales, route: '/sales' },
    { key: 'visit', label: 'Agendar uma visita', description: 'Organize sua agenda comercial', icon: Calendar, completed: hasVisits, route: '/visits' },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;
  const allDone = completedCount === steps.length;

  if (allDone) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 text-center border-success/20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
        >
          <Rocket className="w-8 h-8 text-success" />
        </motion.div>
        <h3 className="font-display font-bold text-lg mb-1">Seu sistema está ativo!</h3>
        <p className="text-sm text-muted-foreground">A IA começará a gerar insights com base nos seus dados.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5 border-primary/20"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Rocket className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-base">Vamos começar?</h3>
          <p className="text-xs text-muted-foreground">Configure sua operação em poucos passos</p>
        </div>
        <span className="text-xs font-semibold text-primary">{completedCount}/{steps.length}</span>
      </div>

      <Progress value={progress} className="h-2 mb-4 bg-muted" />

      <div className="space-y-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.button
              key={step.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              onClick={() => !step.completed && navigate(step.route)}
              disabled={step.completed}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                step.completed
                  ? "bg-success/5 border border-success/20"
                  : "hover:bg-accent/50 border border-transparent hover:border-primary/20 cursor-pointer"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                step.completed ? "bg-success/20" : "bg-muted"
              )}>
                <AnimatePresence mode="wait">
                  {step.completed ? (
                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Check className="w-4 h-4 text-success" />
                    </motion.div>
                  ) : (
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  )}
                </AnimatePresence>
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", step.completed && "line-through text-muted-foreground")}>{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {!step.completed && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
