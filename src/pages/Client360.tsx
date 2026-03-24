import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, DollarSign, ShoppingCart,
  TrendingUp, AlertTriangle, Brain, Plus, Clock, MessageSquare, Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';

const statusLabels: Record<string, string> = { active: 'Ativo', warm: 'Morno', risk: 'Risco', inactive: 'Inativo' };
const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  warm: 'bg-warning/10 text-warning border-warning/20',
  risk: 'bg-destructive/10 text-destructive border-destructive/20',
  inactive: 'bg-muted text-muted-foreground border-border',
};

export default function Client360() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState('');
  const [showNote, setShowNote] = useState(false);

  const { data: client } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('*').eq('id', id!).single();
      return data;
    },
  });

  const { data: sales } = useQuery({
    queryKey: ['client-sales', id],
    queryFn: async () => {
      const { data } = await supabase.from('sales').select('*, sale_items(*, products(name))').eq('client_id', id!).order('sale_date', { ascending: false });
      return data || [];
    },
  });

  const { data: visits } = useQuery({
    queryKey: ['client-visits', id],
    queryFn: async () => {
      const { data } = await supabase.from('visits').select('*').eq('client_id', id!).order('scheduled_date', { ascending: false }).limit(10);
      return data || [];
    },
  });

  const { data: notes } = useQuery({
    queryKey: ['client-notes', id],
    queryFn: async () => {
      const { data } = await supabase.from('client_notes').select('*').eq('client_id', id!).order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: insights } = useQuery({
    queryKey: ['client-insights', id],
    queryFn: async () => {
      const { data } = await supabase.from('ai_insights').select('*').eq('client_id', id!).eq('status', 'active');
      return data || [];
    },
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('client_notes').insert({ client_id: id!, content: noteText });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Observação adicionada');
      setNoteText('');
      setShowNote(false);
      queryClient.invalidateQueries({ queryKey: ['client-notes', id] });
    },
  });

  if (!client) return <div className="page-container"><p className="text-muted-foreground">Carregando...</p></div>;

  const totalSales = sales?.reduce((sum, s) => sum + Number(s.total_value), 0) || 0;
  const totalMargin = sales?.reduce((sum, s) => sum + Number(s.margin_value), 0) || 0;
  const avgTicket = sales && sales.length > 0 ? totalSales / sales.length : 0;
  const daysSinceLastPurchase = client.last_purchase_date
    ? Math.floor((Date.now() - new Date(client.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const daysSinceLastVisit = client.last_visit_date
    ? Math.floor((Date.now() - new Date(client.last_visit_date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const healthScore = (() => {
    let score = 100;
    if (client.status === 'risk') score -= 30;
    if (client.status === 'inactive') score -= 50;
    if (daysSinceLastPurchase && daysSinceLastPurchase > 30) score -= 15;
    if (daysSinceLastPurchase && daysSinceLastPurchase > 60) score -= 15;
    if (daysSinceLastVisit && daysSinceLastVisit > 21) score -= 10;
    return Math.max(0, Math.min(100, score));
  })();

  const formatCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/clients')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="page-title">{client.company_name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[client.status]}`}>
                {statusLabels[client.status]}
              </span>
            </div>
            {client.contact_name && <p className="text-sm text-muted-foreground">{client.contact_name}</p>}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gradient-primary text-primary-foreground gap-1.5" onClick={() => navigate(`/sales/new?client=${id}`)}>
            <ShoppingCart className="w-3.5 h-3.5" /> Nova venda
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/visits/new?client=${id}`)}>
            <Calendar className="w-3.5 h-3.5" /> Registrar visita
          </Button>
          <Dialog open={showNote} onOpenChange={setShowNote}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Observação</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="font-display">Nova observação</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Escreva sua observação..." className="bg-muted/50 min-h-[100px]" />
                <Button onClick={() => addNote.mutate()} className="w-full gradient-primary text-primary-foreground" disabled={!noteText.trim()}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info + Health */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Contact info */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="font-display text-sm font-semibold">Informações</h3>
            {client.phone && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-3.5 h-3.5" />{client.phone}</div>}
            {client.email && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-3.5 h-3.5" />{client.email}</div>}
            {(client.city || client.state) && <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{client.city}{client.state ? `, ${client.state}` : ''}</div>}
            {client.address && <p className="text-xs text-muted-foreground pl-6">{client.address}</p>}
          </div>

          {/* Metrics */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="font-display text-sm font-semibold">Métricas</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-muted-foreground">Total vendido</p><p className="text-sm font-semibold text-success">{formatCurrency(totalSales)}</p></div>
              <div><p className="text-xs text-muted-foreground">Margem total</p><p className="text-sm font-semibold">{formatCurrency(totalMargin)}</p></div>
              <div><p className="text-xs text-muted-foreground">Ticket médio</p><p className="text-sm font-semibold">{formatCurrency(avgTicket)}</p></div>
              <div><p className="text-xs text-muted-foreground">Nº pedidos</p><p className="text-sm font-semibold">{sales?.length || 0}</p></div>
              <div><p className="text-xs text-muted-foreground">Dias s/ compra</p><p className="text-sm font-semibold">{daysSinceLastPurchase ?? '—'}</p></div>
              <div><p className="text-xs text-muted-foreground">Dias s/ visita</p><p className="text-sm font-semibold">{daysSinceLastVisit ?? '—'}</p></div>
            </div>
          </div>

          {/* Health score */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="font-display text-sm font-semibold">Saúde da conta</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={healthScore >= 70 ? 'hsl(var(--success))' : healthScore >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${healthScore * 2.64} ${264 - healthScore * 2.64}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold font-display">{healthScore}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {healthScore >= 70 ? 'Conta saudável' : healthScore >= 40 ? 'Atenção necessária' : 'Risco alto'}
            </p>
          </div>
        </div>

        {/* Insights + Notes */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* AI Insights */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Insights da IA</h3>
            </div>
            {insights && insights.length > 0 ? (
              <div className="space-y-2">
                {insights.map(i => (
                  <div key={i.id} className={`p-3 rounded-lg border text-sm ${i.type === 'risk' ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'}`}>
                    <p className="font-medium">{i.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{i.description}</p>
                    {i.recommended_action && <p className="text-xs text-primary mt-1">→ {i.recommended_action}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Sem insights no momento</p>
            )}
          </div>

          {/* Notes + Sales history */}
          <div className="space-y-4">
            {/* Notes */}
            <div className="glass-card p-4">
              <h3 className="font-display text-sm font-semibold mb-3">Observações</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notes && notes.length > 0 ? notes.map(n => (
                  <div key={n.id} className="p-2 rounded-lg bg-muted/30 text-sm">
                    <p>{n.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground text-center py-2">Nenhuma observação</p>}
              </div>
            </div>

            {/* Sales history */}
            <div className="glass-card p-4">
              <h3 className="font-display text-sm font-semibold mb-3">Últimas vendas</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sales && sales.length > 0 ? sales.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                    <div>
                      <p className="font-medium">{new Date(s.sale_date).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-muted-foreground">{(s as any).sale_items?.length || 0} itens</p>
                    </div>
                    <p className="font-semibold text-success">{formatCurrency(Number(s.total_value))}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground text-center py-2">Nenhuma venda</p>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
