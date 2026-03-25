import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, Users, AlertTriangle, Calendar, Clock, Target, TrendingUp,
  ShoppingCart, MapPin, ArrowRight, Brain, Eye, Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { useIsNewUser } from '@/hooks/useIsNewUser';
import StatCard from '@/components/dashboard/StatCard';
import InsightCard from '@/components/dashboard/InsightCard';
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist';
import EmptyState from '@/components/onboarding/EmptyState';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const { isDemoMode, enableDemo, demoData } = useDemo();
  const { isNew, hasClients, hasSales, hasVisits, isLoading: isNewLoading } = useIsNewUser();

  const showEmpty = !isDemoMode && isNew;

  const { data: clients } = useQuery({
    queryKey: ['clients', companyId],
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('*').order('company_name');
      return data || [];
    },
    enabled: !isDemoMode,
  });

  const { data: sales } = useQuery({
    queryKey: ['sales', companyId],
    queryFn: async () => {
      const { data } = await supabase.from('sales').select('*').eq('status', 'confirmed');
      return data || [];
    },
    enabled: !isDemoMode,
  });

  const { data: visits } = useQuery({
    queryKey: ['visits-week', companyId],
    queryFn: async () => {
      const { data } = await supabase.from('visits').select('*, clients(company_name)');
      return data || [];
    },
    enabled: !isDemoMode,
  });

  const { data: insights } = useQuery({
    queryKey: ['insights', companyId],
    queryFn: async () => {
      const { data } = await supabase.from('ai_insights').select('*, clients(company_name)').eq('status', 'active').order('priority').limit(6);
      return data || [];
    },
    enabled: !isDemoMode,
  });

  const { data: opportunities } = useQuery({
    queryKey: ['opportunities-dash', companyId],
    queryFn: async () => {
      const { data } = await supabase.from('opportunities').select('*, clients(company_name)').eq('status', 'open').order('priority').limit(5);
      return data || [];
    },
    enabled: !isDemoMode,
  });

  const { data: followUps } = useQuery({
    queryKey: ['follow-ups', companyId],
    queryFn: async () => {
      const { data } = await supabase.from('follow_ups').select('*, clients(company_name)').eq('completed', false).order('due_date');
      return data || [];
    },
    enabled: !isDemoMode,
  });

  const { data: products } = useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
    enabled: !isDemoMode,
  });

  // Use demo or real data
  const activeClients = isDemoMode ? demoData.clients : (clients || []);
  const activeSales = isDemoMode ? demoData.sales : (sales || []);
  const activeVisits = isDemoMode ? demoData.visits : (visits || []);
  const activeInsights = isDemoMode ? demoData.insights : (insights || []);
  const activeOpportunities = isDemoMode ? demoData.opportunities : (opportunities || []);
  const activeFollowUps = isDemoMode ? demoData.followUps : (followUps || []);

  // Calculations
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthlySales = activeSales.filter((s: any) => s.created_at >= monthStart);
  const monthlyRevenue = monthlySales.reduce((sum: number, s: any) => sum + Number(s.total_value), 0);
  const monthlyMargin = monthlySales.reduce((sum: number, s: any) => sum + Number(s.margin_value), 0);
  const activeClientsCount = activeClients.filter((c: any) => c.status === 'active').length;
  const riskClients = activeClients.filter((c: any) => c.status === 'risk').length;
  const weekVisits = activeVisits.filter((v: any) => {
    const d = new Date(v.scheduled_date);
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;
  const avgTicket = monthlySales.length > 0 ? monthlyRevenue / monthlySales.length : 0;
  const pendingFollowUps = activeFollowUps.length;
  const openOpportunities = activeOpportunities.length;
  const totalOpportunityValue = activeOpportunities.reduce((sum: number, o: any) => sum + Number(o.estimated_value || 0), 0);

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Visão geral da sua operação comercial</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-muted">
              {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>

        {/* Empty state for new users */}
        {showEmpty && !isNewLoading && (
          <>
            {/* Stats Grid - all zeroed */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard title="Faturamento do mês" value="R$ 0" icon={DollarSign} variant="success" delay={0} />
              <StatCard title="Clientes ativos" value={0} icon={Users} variant="primary" delay={0.05} />
              <StatCard title="Clientes em risco" value={0} icon={AlertTriangle} variant="danger" delay={0.1} />
              <StatCard title="Visitas da semana" value={0} icon={Calendar} variant="default" delay={0.15} />
              <StatCard title="Follow-ups pendentes" value={0} icon={Clock} variant="warning" delay={0.2} />
              <StatCard title="Oportunidades" value={0} icon={Target} variant="success" subtitle="R$ 0" delay={0.25} />
              <StatCard title="Ticket médio" value="R$ 0" icon={ShoppingCart} variant="primary" delay={0.3} />
              <StatCard title="Margem do mês" value="R$ 0" icon={TrendingUp} variant="success" delay={0.35} />
            </div>

            {/* Onboarding */}
            <div className="grid md:grid-cols-2 gap-4">
              <OnboardingChecklist
                hasClients={hasClients ?? false}
                hasProducts={(products ?? 0) > 0}
                hasSales={hasSales ?? false}
                hasVisits={hasVisits ?? false}
              />

              <div className="space-y-4">
                {/* AI empty state */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-semibold text-sm">Alertas da IA</h3>
                  </div>
                  <EmptyState
                    icon={Brain}
                    title="Aguardando dados"
                    description="A IA começará a gerar insights após suas primeiras atividades."
                    className="py-8"
                  />
                </motion.div>

                {/* Demo CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card p-5 border-primary/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-semibold text-sm">Quer ver como funciona?</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Explore o sistema com dados de demonstração. Nada será salvo na sua conta.
                  </p>
                  <Button onClick={enableDemo} variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10">
                    <Eye className="w-4 h-4" /> Ver exemplo com dados
                  </Button>
                </motion.div>
              </div>
            </div>
          </>
        )}

        {/* Normal dashboard (with data or demo mode) */}
        {(!showEmpty || isDemoMode) && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard title="Faturamento do mês" value={formatCurrency(monthlyRevenue)} icon={DollarSign} variant="success" delay={0} />
              <StatCard title="Clientes ativos" value={activeClientsCount} icon={Users} variant="primary" delay={0.05} />
              <StatCard title="Clientes em risco" value={riskClients} icon={AlertTriangle} variant="danger" delay={0.1} />
              <StatCard title="Visitas da semana" value={weekVisits} icon={Calendar} variant="default" delay={0.15} />
              <StatCard title="Follow-ups pendentes" value={pendingFollowUps} icon={Clock} variant="warning" delay={0.2} />
              <StatCard title="Oportunidades" value={openOpportunities} icon={Target} variant="success" subtitle={formatCurrency(totalOpportunityValue)} delay={0.25} />
              <StatCard title="Ticket médio" value={formatCurrency(avgTicket)} icon={ShoppingCart} variant="primary" delay={0.3} />
              <StatCard title="Margem do mês" value={formatCurrency(monthlyMargin)} icon={TrendingUp} variant="success" delay={0.35} />
            </div>

            {/* AI Alerts + Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-semibold text-sm">Alertas da IA</h3>
                  </div>
                  <button onClick={() => navigate('/insights')} className="text-xs text-primary hover:underline flex items-center gap-1">
                    Ver todos <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {activeInsights.length > 0 ? activeInsights.slice(0, 4).map((insight: any, i: number) => (
                    <InsightCard
                      key={insight.id}
                      icon={insight.type === 'risk' ? AlertTriangle : insight.type === 'opportunity' ? Target : Brain}
                      title={insight.title}
                      description={insight.description}
                      variant={insight.type === 'risk' ? 'risk' : insight.type === 'opportunity' ? 'opportunity' : 'info'}
                      delay={i * 0.05}
                    />
                  )) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">Nenhum alerta no momento</p>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-4">
                {/* Focus of the day */}
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-warning" />
                    <h3 className="font-display font-semibold text-sm">Foco do dia</h3>
                  </div>
                  <div className="space-y-2">
                    {riskClients > 0 && (
                      <InsightCard icon={AlertTriangle} title={`${riskClients} clientes estão esfriando`} description="Faça contato antes que virem inativos" variant="risk" actionLabel="Ver clientes" onAction={() => navigate('/clients?status=risk')} delay={0.1} />
                    )}
                    {totalOpportunityValue > 0 && (
                      <InsightCard icon={Target} title={`${formatCurrency(totalOpportunityValue)} em oportunidades`} description="Oportunidades identificadas pela IA" variant="opportunity" actionLabel="Ver oportunidades" onAction={() => navigate('/opportunities')} delay={0.15} />
                    )}
                    {pendingFollowUps > 0 && (
                      <InsightCard icon={Clock} title={`${pendingFollowUps} follow-ups pendentes`} description="Ações que precisam da sua atenção" variant="action" actionLabel="Ver agenda" onAction={() => navigate('/visits')} delay={0.2} />
                    )}
                  </div>
                </div>

                {/* Top clients */}
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="font-display font-semibold text-sm">Ranking de clientes</h3>
                    </div>
                    <button onClick={() => navigate('/clients')} className="text-xs text-primary hover:underline">Ver todos</button>
                  </div>
                  <div className="space-y-2">
                    {activeClients.slice(0, 5).map((client: any, i: number) => (
                      <div
                        key={client.id}
                        onClick={() => !isDemoMode && navigate(`/clients/${client.id}`)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{client.company_name}</p>
                          <p className="text-xs text-muted-foreground">{client.city || 'Sem cidade'}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          client.status === 'active' ? 'bg-success/10 text-success' :
                          client.status === 'risk' ? 'bg-destructive/10 text-destructive' :
                          client.status === 'warm' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {client.status === 'active' ? 'Ativo' : client.status === 'risk' ? 'Risco' : client.status === 'warm' ? 'Morno' : 'Inativo'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
