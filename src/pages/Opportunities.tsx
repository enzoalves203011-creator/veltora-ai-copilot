import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, TrendingDown, RefreshCw, ShoppingCart, Eye, ArrowRight, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  churn_risk: { label: 'Risco de Churn', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  repurchase: { label: 'Probabilidade de Recompra', icon: RefreshCw, color: 'text-success', bg: 'bg-success/10' },
  mix_increase: { label: 'Aumento de Mix', icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
  no_visit: { label: 'Sem Visita Recente', icon: Eye, color: 'text-warning', bg: 'bg-warning/10' },
  ticket_drop: { label: 'Queda de Ticket', icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
  underexplored: { label: 'Potencial Subexplorado', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
  reactivation: { label: 'Reativação', icon: RefreshCw, color: 'text-warning', bg: 'bg-warning/10' },
};

const priorityColors: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  low: 'bg-muted text-muted-foreground border-border',
};

export default function Opportunities() {
  const navigate = useNavigate();

  const { data: opportunities } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data } = await supabase.from('opportunities').select('*, clients(company_name, city)').order('priority').order('estimated_value', { ascending: false });
      return data || [];
    },
  });

  const totalValue = opportunities?.reduce((sum, o) => sum + Number(o.estimated_value || 0), 0) || 0;
  const highPriority = opportunities?.filter(o => o.priority === 'high').length || 0;

  const formatCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="page-header">
          <div>
            <h1 className="page-title">Oportunidades</h1>
            <p className="page-subtitle">Detectadas automaticamente pela IA</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-card">
            <p className="text-xs text-muted-foreground">Total detectado</p>
            <p className="text-xl font-bold font-display">{opportunities?.length || 0}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-muted-foreground">Valor estimado</p>
            <p className="text-xl font-bold font-display text-success">{formatCurrency(totalValue)}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-destructive">Alta prioridade</p>
            <p className="text-xl font-bold font-display text-destructive">{highPriority}</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {opportunities?.map((opp, i) => {
            const cfg = typeConfig[opp.type] || typeConfig.repurchase;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card-hover p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${priorityColors[opp.priority]}`}>
                        {opp.priority === 'high' ? 'Alta' : opp.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="font-semibold text-sm">{(opp as any).clients?.company_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opp.justification}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {opp.estimated_value && (
                        <span className="flex items-center gap-1 text-xs text-success font-medium">
                          <DollarSign className="w-3 h-3" />{formatCurrency(Number(opp.estimated_value))}
                        </span>
                      )}
                      <span className="text-xs text-primary">→ {opp.recommended_action}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(`/clients/${opp.client_id}`)}>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
          {(!opportunities || opportunities.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhuma oportunidade detectada</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
