import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, Users, Package, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(213, 94%, 58%)', 'hsl(152, 60%, 48%)', 'hsl(38, 92%, 55%)', 'hsl(0, 72%, 55%)', 'hsl(280, 60%, 55%)'];

export default function Reports() {
  const { data: sales } = useQuery({
    queryKey: ['report-sales'],
    queryFn: async () => {
      const { data } = await supabase.from('sales').select('*, clients(company_name, city, state)').eq('status', 'confirmed').order('sale_date');
      return data || [];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ['report-clients'],
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('*');
      return data || [];
    },
  });

  // Sales by month
  const salesByMonth = sales?.reduce((acc, sale) => {
    const month = new Date(sale.sale_date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + Number(sale.total_value);
    return acc;
  }, {} as Record<string, number>) || {};

  const monthlyData = Object.entries(salesByMonth).map(([month, value]) => ({ month, value }));

  // Top clients by revenue
  const clientRevenue = sales?.reduce((acc, sale) => {
    const name = (sale as any).clients?.company_name || 'Desconhecido';
    acc[name] = (acc[name] || 0) + Number(sale.total_value);
    return acc;
  }, {} as Record<string, number>) || {};

  const topClients = Object.entries(clientRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  // Clients by status
  const statusCounts = clients?.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status === 'active' ? 'Ativos' : status === 'risk' ? 'Risco' : status === 'warm' ? 'Mornos' : 'Inativos',
    value: count,
  }));

  // Sales by region
  const regionRevenue = sales?.reduce((acc, sale) => {
    const state = (sale as any).clients?.state || 'N/D';
    acc[state] = (acc[state] || 0) + Number(sale.total_value);
    return acc;
  }, {} as Record<string, number>) || {};

  const regionData = Object.entries(regionRevenue).sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value }));

  // No purchase clients
  const noPurchaseClients = clients?.filter(c => !c.last_purchase_date).length || 0;
  const noVisitClients = clients?.filter(c => !c.last_visit_date).length || 0;

  const totalRevenue = sales?.reduce((s, sale) => s + Number(sale.total_value), 0) || 0;
  const totalMargin = sales?.reduce((s, sale) => s + Number(sale.margin_value), 0) || 0;
  const formatCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className="page-title">Relatórios</h1>
            <p className="page-subtitle">Análise completa da operação</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="stat-card"><p className="text-xs text-muted-foreground">Faturamento total</p><p className="text-lg font-bold font-display text-success">{formatCurrency(totalRevenue)}</p></div>
          <div className="stat-card"><p className="text-xs text-muted-foreground">Margem total</p><p className="text-lg font-bold font-display">{formatCurrency(totalMargin)}</p></div>
          <div className="stat-card"><p className="text-xs text-muted-foreground">Sem compra</p><p className="text-lg font-bold font-display text-destructive">{noPurchaseClients}</p></div>
          <div className="stat-card"><p className="text-xs text-muted-foreground">Sem visita</p><p className="text-lg font-bold font-display text-warning">{noVisitClients}</p></div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Revenue by month */}
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold text-sm mb-4">Faturamento por período</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(215, 12%, 55%)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'hsl(215, 12%, 55%)', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 14%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 95%)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                  />
                  <Bar dataKey="value" fill="hsl(213, 94%, 58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clients by status */}
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold text-sm mb-4">Clientes por status</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 14%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 95%)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {statusData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top clients */}
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold text-sm mb-4">Top clientes por receita</h3>
            <div className="space-y-2">
              {topClients.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{c.name}</span>
                      <span className="text-xs text-success font-medium">{formatCurrency(c.value)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full gradient-primary" style={{ width: `${(c.value / (topClients[0]?.value || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by region */}
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold text-sm mb-4">Vendas por região</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                  <XAxis type="number" tick={{ fill: 'hsl(215, 12%, 55%)', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215, 12%, 55%)', fontSize: 11 }} width={40} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 14%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 95%)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                  />
                  <Bar dataKey="value" fill="hsl(152, 60%, 48%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
