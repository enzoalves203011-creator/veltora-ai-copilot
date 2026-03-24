import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Package, Edit, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Products() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', brand: '', cost: 0, price: 0 });
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').order('name');
      return data || [];
    },
  });

  const createProduct = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error('Nome é obrigatório');
      const { data: companies } = await supabase.from('companies').select('id').limit(1);
      const companyId = companies?.[0]?.id;
      if (!companyId) throw new Error('Empresa não encontrada');
      const { error } = await supabase.from('products').insert({ ...form, company_id: companyId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Produto criado!');
      setShowCreate(false);
      setForm({ name: '', sku: '', brand: '', cost: 0, price: 0 });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('products').update({ is_active: !is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const formatCurrency = (v: number) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="page-header">
          <div>
            <h1 className="page-title">Produtos</h1>
            <p className="page-subtitle">{products?.length || 0} produtos cadastrados</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Novo produto</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader><DialogTitle className="font-display">Novo produto</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-muted/50" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>SKU</Label><Input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="bg-muted/50" /></div>
                  <div className="space-y-1"><Label>Marca</Label><Input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="bg-muted/50" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Custo (R$)</Label><Input type="number" step="0.01" value={form.cost} onChange={e => setForm({...form, cost: Number(e.target.value)})} className="bg-muted/50" /></div>
                  <div className="space-y-1"><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="bg-muted/50" /></div>
                </div>
                {form.price > 0 && (
                  <p className="text-xs text-muted-foreground">Margem: {((1 - form.cost / form.price) * 100).toFixed(1)}%</p>
                )}
                <Button onClick={() => createProduct.mutate()} className="w-full gradient-primary text-primary-foreground">Criar produto</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar produto, SKU ou marca..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-muted/50 border-border" />
        </div>

        <div className="space-y-2">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-card-hover p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                    {!product.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Inativo</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {product.sku && <span>SKU: {product.sku}</span>}
                    {product.brand && <span>{product.brand}</span>}
                    <span>Custo: {formatCurrency(Number(product.cost))}</span>
                    <span>Preço: {formatCurrency(Number(product.price))}</span>
                    <span className="text-primary font-medium">Margem: {product.default_margin}%</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => toggleActive.mutate({ id: product.id, is_active: product.is_active ?? true })}
                >
                  {product.is_active ? <X className="w-3 h-3 mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                  {product.is_active ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
