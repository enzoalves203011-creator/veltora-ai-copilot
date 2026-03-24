import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, ShoppingCart, DollarSign, TrendingUp, Minus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import StatCard from '@/components/dashboard/StatCard';

interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
}

export default function Sales() {
  const [search, setSearch] = useState('');
  const [showNewSale, setShowNewSale] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const { data: sales } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data } = await supabase.from('sales').select('*, clients(company_name)').order('sale_date', { ascending: false });
      return data || [];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('id, company_name').order('company_name');
      return data || [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').eq('is_active', true).order('name');
      return data || [];
    },
  });

  const createSale = useMutation({
    mutationFn: async () => {
      if (!selectedClient || cart.length === 0) throw new Error('Selecione cliente e adicione itens');

      const totalValue = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const marginValue = cart.reduce((sum, item) => sum + item.quantity * (item.unit_price - item.cost_price), 0);

      const { data: companies } = await supabase.from('companies').select('id').limit(1);
      const companyId = companies?.[0]?.id;
      if (!companyId) throw new Error('Empresa não encontrada');

      const { data: sale, error: saleError } = await supabase.from('sales').insert({
        company_id: companyId,
        client_id: selectedClient,
        total_value: totalValue,
        margin_value: marginValue,
        status: 'confirmed',
      }).select().single();
      if (saleError) throw saleError;

      const items = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        cost_price: item.cost_price,
      }));
      const { error: itemsError } = await supabase.from('sale_items').insert(items);
      if (itemsError) throw itemsError;

      // Update client last_purchase_date
      await supabase.from('clients').update({ last_purchase_date: new Date().toISOString().split('T')[0] }).eq('id', selectedClient);
    },
    onSuccess: () => {
      toast.success('Venda registrada com sucesso!');
      setShowNewSale(false);
      setCart([]);
      setSelectedClient('');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const addToCart = (product: any) => {
    const existing = cart.find(i => i.product_id === product.id);
    if (existing) {
      setCart(cart.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { product_id: product.id, name: product.name, quantity: 1, unit_price: Number(product.price), cost_price: Number(product.cost) }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(i => i.product_id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(i => i.product_id !== productId));
  };

  const cartTotal = cart.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const cartMargin = cart.reduce((s, i) => s + i.quantity * (i.unit_price - i.cost_price), 0);

  const filtered = sales?.filter(s =>
    (s as any).clients?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.id.includes(search)
  ) || [];

  const totalRevenue = sales?.reduce((s, sale) => s + Number(sale.total_value), 0) || 0;
  const totalMarginAll = sales?.reduce((s, sale) => s + Number(sale.margin_value), 0) || 0;
  const avgTicket = sales && sales.length > 0 ? totalRevenue / sales.length : 0;

  const formatCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())) || [];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="page-header">
          <div>
            <h1 className="page-title">Vendas</h1>
            <p className="page-subtitle">{sales?.length || 0} vendas registradas</p>
          </div>
          <Dialog open={showNewSale} onOpenChange={setShowNewSale}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Nova venda</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display">Nova venda</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Cliente *</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                    <SelectContent>
                      {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Adicionar produtos</Label>
                  <Input placeholder="Buscar produto..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="bg-muted/50" />
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {filteredProducts.slice(0, 8).map(p => (
                      <div key={p.id} onClick={() => addToCart(p)} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 cursor-pointer text-sm">
                        <span>{p.name}</span>
                        <span className="text-muted-foreground">{formatCurrency(Number(p.price))}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {cart.length > 0 && (
                  <div className="space-y-2">
                    <Label>Itens ({cart.length})</Label>
                    {cart.map(item => (
                      <div key={item.product_id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.unit_price)} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product_id, -1)}><Minus className="w-3 h-3" /></Button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product_id, 1)}><Plus className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.product_id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                        <p className="text-sm font-semibold w-20 text-right">{formatCurrency(item.quantity * item.unit_price)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-border text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-success">{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Margem:</span>
                      <span className="font-medium">{formatCurrency(cartMargin)}</span>
                    </div>
                  </div>
                )}

                <Button onClick={() => createSale.mutate()} className="w-full gradient-primary text-primary-foreground" disabled={!selectedClient || cart.length === 0 || createSale.isPending}>
                  {createSale.isPending ? 'Salvando...' : 'Salvar venda'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="Total vendido" value={formatCurrency(totalRevenue)} icon={DollarSign} variant="success" />
          <StatCard title="Margem total" value={formatCurrency(totalMarginAll)} icon={TrendingUp} variant="primary" />
          <StatCard title="Ticket médio" value={formatCurrency(avgTicket)} icon={ShoppingCart} variant="default" />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar venda..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-muted/50 border-border" />
        </div>

        {/* Sales list */}
        <div className="space-y-2">
          {filtered.map((sale, i) => (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-card-hover p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{(sale as any).clients?.company_name || 'Cliente'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(sale.sale_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success text-sm">{formatCurrency(Number(sale.total_value))}</p>
                  <p className="text-xs text-muted-foreground">Margem: {formatCurrency(Number(sale.margin_value))}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhuma venda encontrada</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
