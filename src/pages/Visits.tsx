import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Plus, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  scheduled: { label: 'Agendada', icon: Clock, color: 'text-primary' },
  completed: { label: 'Realizada', icon: CheckCircle, color: 'text-success' },
  rescheduled: { label: 'Remarcada', icon: AlertCircle, color: 'text-warning' },
  cancelled: { label: 'Cancelada', icon: XCircle, color: 'text-destructive' },
};

export default function Visits() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ client_id: '', scheduled_date: '', purpose: '', notes: '' });
  const queryClient = useQueryClient();

  const { data: visits } = useQuery({
    queryKey: ['visits'],
    queryFn: async () => {
      const { data } = await supabase.from('visits').select('*, clients(company_name)').order('scheduled_date', { ascending: false });
      return data || [];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ['clients-select'],
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('id, company_name').order('company_name');
      return data || [];
    },
  });

  const { data: followUps } = useQuery({
    queryKey: ['follow-ups-list'],
    queryFn: async () => {
      const { data } = await supabase.from('follow_ups').select('*, clients(company_name)').eq('completed', false).order('due_date');
      return data || [];
    },
  });

  const createVisit = useMutation({
    mutationFn: async () => {
      if (!form.client_id || !form.scheduled_date) throw new Error('Campos obrigatórios');
      const { data: companies } = await supabase.from('companies').select('id').limit(1);
      const { error } = await supabase.from('visits').insert({
        company_id: companies?.[0]?.id!,
        client_id: form.client_id,
        scheduled_date: form.scheduled_date,
        purpose: form.purpose,
        notes: form.notes,
        status: 'scheduled',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Visita agendada!');
      setShowCreate(false);
      setForm({ client_id: '', scheduled_date: '', purpose: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const completeVisit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('visits').update({ status: 'completed', completed_date: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Visita concluída!');
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });

  const now = new Date();
  const today = visits?.filter(v => {
    const d = new Date(v.scheduled_date);
    return d.toDateString() === now.toDateString() && v.status === 'scheduled';
  }) || [];

  const upcoming = visits?.filter(v => {
    const d = new Date(v.scheduled_date);
    return d > now && v.status === 'scheduled';
  }) || [];

  const overdue = visits?.filter(v => {
    const d = new Date(v.scheduled_date);
    return d < now && v.status === 'scheduled';
  }) || [];

  const completed = visits?.filter(v => v.status === 'completed') || [];

  const renderVisitList = (list: typeof visits) => (
    <div className="space-y-2">
      {list && list.length > 0 ? list.map((v, i) => {
        const cfg = statusConfig[v.status];
        const Icon = cfg.icon;
        return (
          <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="glass-card-hover p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                  <h3 className="font-semibold text-sm">{(v as any).clients?.company_name}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cfg.color} bg-current/10`}>{cfg.label}</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{new Date(v.scheduled_date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                  {v.purpose && <p>Objetivo: {v.purpose}</p>}
                  {v.notes && <p>{v.notes}</p>}
                </div>
              </div>
              {v.status === 'scheduled' && (
                <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => completeVisit.mutate(v.id)}>
                  <CheckCircle className="w-3 h-3" /> Concluir
                </Button>
              )}
            </div>
          </motion.div>
        );
      }) : <p className="text-sm text-muted-foreground text-center py-8">Nenhuma visita</p>}
    </div>
  );

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="page-header">
          <div>
            <h1 className="page-title">Agenda</h1>
            <p className="page-subtitle">Visitas e follow-ups</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Nova visita</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader><DialogTitle className="font-display">Agendar visita</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Cliente *</Label>
                  <Select value={form.client_id} onValueChange={v => setForm({...form, client_id: v})}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Data/Hora *</Label><Input type="datetime-local" value={form.scheduled_date} onChange={e => setForm({...form, scheduled_date: e.target.value})} className="bg-muted/50" /></div>
                <div className="space-y-1"><Label>Objetivo</Label><Input value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} className="bg-muted/50" placeholder="Ex: Apresentar nova linha" /></div>
                <div className="space-y-1"><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="bg-muted/50" /></div>
                <Button onClick={() => createVisit.mutate()} className="w-full gradient-primary text-primary-foreground">Agendar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="stat-card"><p className="text-xs text-muted-foreground">Hoje</p><p className="text-xl font-bold font-display text-primary">{today.length}</p></div>
          <div className="stat-card"><p className="text-xs text-muted-foreground">Próximas</p><p className="text-xl font-bold font-display">{upcoming.length}</p></div>
          <div className="stat-card"><p className="text-xs text-destructive">Atrasadas</p><p className="text-xl font-bold font-display text-destructive">{overdue.length}</p></div>
          <div className="stat-card"><p className="text-xs text-muted-foreground">Follow-ups</p><p className="text-xl font-bold font-display text-warning">{followUps?.length || 0}</p></div>
        </div>

        <Tabs defaultValue="today" className="space-y-4">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="today">Hoje ({today.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Próximas</TabsTrigger>
            <TabsTrigger value="overdue">Atrasadas</TabsTrigger>
            <TabsTrigger value="completed">Realizadas</TabsTrigger>
            <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          </TabsList>
          <TabsContent value="today">{renderVisitList(today)}</TabsContent>
          <TabsContent value="upcoming">{renderVisitList(upcoming)}</TabsContent>
          <TabsContent value="overdue">{renderVisitList(overdue)}</TabsContent>
          <TabsContent value="completed">{renderVisitList(completed.slice(0, 20))}</TabsContent>
          <TabsContent value="followups">
            <div className="space-y-2">
              {followUps && followUps.length > 0 ? followUps.map((f, i) => (
                <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="glass-card-hover p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{(f as any).clients?.company_name}</p>
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                      <p className="text-xs text-warning mt-1">Prazo: {new Date(f.due_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </motion.div>
              )) : <p className="text-sm text-muted-foreground text-center py-8">Nenhum follow-up pendente</p>}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
