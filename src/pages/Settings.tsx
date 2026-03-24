import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Building, Target, Bell, Palette, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Perfil atualizado!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => toast.error('Erro ao atualizar'),
  });

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className="page-title">Configurações</h1>
            <p className="page-subtitle">Gerencie seu perfil e preferências</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="profile"><User className="w-3.5 h-3.5 mr-1.5" />Perfil</TabsTrigger>
            <TabsTrigger value="company"><Building className="w-3.5 h-3.5 mr-1.5" />Empresa</TabsTrigger>
            <TabsTrigger value="goals"><Target className="w-3.5 h-3.5 mr-1.5" />Metas</TabsTrigger>
            <TabsTrigger value="ai"><Brain className="w-3.5 h-3.5 mr-1.5" />IA</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="glass-card p-6 max-w-lg space-y-4">
              <h3 className="font-display font-semibold">Dados pessoais</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Nome completo</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-muted/50" />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted/50 opacity-60" />
                </div>
                <div className="space-y-1">
                  <Label>Telefone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-muted/50" placeholder="(11) 99999-9999" />
                </div>
                <Button onClick={() => updateProfile.mutate()} className="gradient-primary text-primary-foreground">
                  Salvar alterações
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company">
            <div className="glass-card p-6 max-w-lg space-y-4">
              <h3 className="font-display font-semibold">Dados da empresa</h3>
              <p className="text-sm text-muted-foreground">Configure as informações da sua empresa. Isso será usado nos relatórios e insights da IA.</p>
              <div className="space-y-3">
                <div className="space-y-1"><Label>Nome da empresa</Label><Input className="bg-muted/50" placeholder="Minha Empresa Ltda" /></div>
                <div className="space-y-1"><Label>Segmento</Label><Input className="bg-muted/50" placeholder="Ex: Materiais de Construção" /></div>
                <div className="space-y-1"><Label>Região de atuação</Label><Input className="bg-muted/50" placeholder="Ex: Sul, Sudeste" /></div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <div className="glass-card p-6 max-w-lg space-y-4">
              <h3 className="font-display font-semibold">Metas comerciais</h3>
              <p className="text-sm text-muted-foreground">Defina suas metas para acompanhamento no dashboard.</p>
              <div className="space-y-3">
                <div className="space-y-1"><Label>Meta de faturamento mensal (R$)</Label><Input type="number" className="bg-muted/50" placeholder="100000" /></div>
                <div className="space-y-1"><Label>Meta de visitas por semana</Label><Input type="number" className="bg-muted/50" placeholder="15" /></div>
                <div className="space-y-1"><Label>Meta de novos clientes por mês</Label><Input type="number" className="bg-muted/50" placeholder="5" /></div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="glass-card p-6 max-w-lg space-y-4">
              <h3 className="font-display font-semibold">Parâmetros da IA</h3>
              <p className="text-sm text-muted-foreground">Ajuste como a IA interpreta seus dados comerciais.</p>
              <div className="space-y-3">
                <div className="space-y-1"><Label>Dias sem compra para risco</Label><Input type="number" className="bg-muted/50" defaultValue={30} /><p className="text-xs text-muted-foreground">Após este período, o cliente será marcado como risco</p></div>
                <div className="space-y-1"><Label>Dias sem visita para alerta</Label><Input type="number" className="bg-muted/50" defaultValue={21} /><p className="text-xs text-muted-foreground">Gera alerta de visita pendente</p></div>
                <div className="space-y-1"><Label>Fator de frequência para churn</Label><Input type="number" step="0.1" className="bg-muted/50" defaultValue={1.5} /><p className="text-xs text-muted-foreground">Multiplicador da frequência média para detectar risco</p></div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
