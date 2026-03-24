import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, Target, TrendingUp, Lightbulb, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  risk: { label: 'Risco', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  opportunity: { label: 'Oportunidade', icon: Target, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  behavior: { label: 'Comportamento', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  recommendation: { label: 'Recomendação', icon: Lightbulb, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
};

const priorityLabel: Record<string, string> = { high: 'Alta', medium: 'Média', low: 'Baixa' };

export default function Insights() {
  const { data: insights } = useQuery({
    queryKey: ['all-insights'],
    queryFn: async () => {
      const { data } = await supabase.from('ai_insights').select('*, clients(company_name)').eq('status', 'active').order('priority').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const grouped = {
    risk: insights?.filter(i => i.type === 'risk') || [],
    opportunity: insights?.filter(i => i.type === 'opportunity') || [],
    behavior: insights?.filter(i => i.type === 'behavior') || [],
    recommendation: insights?.filter(i => i.type === 'recommendation') || [],
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="page-header">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">Insights IA</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">INTELIGÊNCIA</span>
            </div>
            <p className="page-subtitle">Leitura inteligente da sua carteira comercial</p>
          </div>
        </div>

        {/* Priority of the day */}
        {grouped.risk.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border-destructive/20">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-warning" />
              <h3 className="font-display font-semibold text-sm">Prioridade do dia</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Seu maior risco atual está nos clientes sem atividade recente. {grouped.risk.length} alertas precisam da sua atenção.
            </p>
          </motion.div>
        )}

        {/* Insights by category */}
        {Object.entries(grouped).map(([type, list]) => {
          if (list.length === 0) return null;
          const cfg = typeConfig[type as keyof typeof typeConfig];
          const Icon = cfg.icon;

          return (
            <motion.div key={type} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <h2 className="font-display font-semibold">{cfg.label}</h2>
                <span className="text-xs text-muted-foreground">({list.length})</span>
              </div>
              <div className="space-y-2">
                {list.map((insight, i) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`glass-card p-4 border ${cfg.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm">{insight.title}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                            {priorityLabel[insight.priority]}
                          </span>
                        </div>
                        {(insight as any).clients?.company_name && (
                          <p className="text-xs text-muted-foreground mb-1">Cliente: {(insight as any).clients.company_name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        {insight.recommended_action && (
                          <p className="text-xs text-primary mt-2 font-medium">→ {insight.recommended_action}</p>
                        )}
                        {insight.estimated_value && (
                          <p className="text-xs text-success mt-1">Valor estimado: R$ {Number(insight.estimated_value).toLocaleString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {(!insights || insights.length === 0) && (
          <div className="text-center py-16 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-display font-semibold">Sem insights no momento</p>
            <p className="text-sm mt-1">A IA gerará insights conforme os dados forem acumulados</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
