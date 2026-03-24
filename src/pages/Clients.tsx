import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, Users as UsersIcon, Eye, ShoppingCart, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const statusLabels: Record<string, string> = { active: 'Ativo', warm: 'Morno', risk: 'Risco', inactive: 'Inativo' };
const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  warm: 'bg-warning/10 text-warning',
  risk: 'bg-destructive/10 text-destructive',
  inactive: 'bg-muted text-muted-foreground',
};

export default function Clients() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newClient, setNewClient] = useState({ company_name: '', contact_name: '', phone: '', email: '', city: '', state: '', status: 'active' as any, potential_value: 0 });
  const navigate = useNavigate();

  const { data: clients, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('*').order('company_name');
      return data || [];
    },
  });

  const filtered = clients?.filter(c => {
    const matchSearch = c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  }) || [];

  const handleCreateClient = async () => {
    if (!newClient.company_name.trim()) { toast.error('Nome da empresa é obrigatório'); return; }
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    const companyId = companies?.[0]?.id;
    if (!companyId) { toast.error('Empresa não encontrada'); return; }

    const { error } = await supabase.from('clients').insert({
      ...newClient,
      company_id: companyId,
      potential_value: newClient.potential_value,
    });
    if (error) { toast.error('Erro ao criar cliente'); return; }
    toast.success('Cliente criado com sucesso!');
    setShowCreate(false);
    setNewClient({ company_name: '', contact_name: '', phone: '', email: '', city: '', state: '', status: 'active', potential_value: 0 });
    refetch();
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="page-header">
          <div>
            <h1 className="page-title">Clientes</h1>
            <p className="page-subtitle">{filtered.length} clientes encontrados</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Novo cliente</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader><DialogTitle className="font-display">Novo cliente</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1"><Label>Empresa *</Label><Input value={newClient.company_name} onChange={e => setNewClient({...newClient, company_name: e.target.value})} className="bg-muted/50" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Contato</Label><Input value={newClient.contact_name} onChange={e => setNewClient({...newClient, contact_name: e.target.value})} className="bg-muted/50" /></div>
                  <div className="space-y-1"><Label>Telefone</Label><Input value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="bg-muted/50" /></div>
                </div>
                <div className="space-y-1"><Label>Email</Label><Input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="bg-muted/50" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Cidade</Label><Input value={newClient.city} onChange={e => setNewClient({...newClient, city: e.target.value})} className="bg-muted/50" /></div>
                  <div className="space-y-1"><Label>Estado</Label><Input value={newClient.state} onChange={e => setNewClient({...newClient, state: e.target.value})} className="bg-muted/50" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Select value={newClient.status} onValueChange={v => setNewClient({...newClient, status: v as any})}>
                      <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="warm">Morno</SelectItem>
                        <SelectItem value="risk">Risco</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Potencial (R$)</Label><Input type="number" value={newClient.potential_value} onChange={e => setNewClient({...newClient, potential_value: Number(e.target.value)})} className="bg-muted/50" /></div>
                </div>
                <Button onClick={handleCreateClient} className="w-full gradient-primary text-primary-foreground">Criar cliente</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente, contato ou cidade..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-muted/50 border-border" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-muted/50 border-border">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="warm">Mornos</SelectItem>
              <SelectItem value="risk">Em risco</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Client list */}
        <div className="space-y-2">
          {filtered.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-card-hover p-4 cursor-pointer"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{client.company_name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[client.status]}`}>
                      {statusLabels[client.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {client.contact_name && <span>{client.contact_name}</span>}
                    {client.city && <span>{client.city}{client.state ? `, ${client.state}` : ''}</span>}
                    {client.last_purchase_date && <span>Última compra: {new Date(client.last_purchase_date).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}`); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <UsersIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
