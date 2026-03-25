import { createContext, useContext, useState, ReactNode } from 'react';

// Demo seed data - isolated, never persisted
const demoClients = [
  { id: 'd-c1', company_name: 'Construtora Horizonte', contact_name: 'Carlos Silva', city: 'São Paulo', state: 'SP', status: 'active' as const, potential_value: 50000, last_purchase_date: '2026-03-10', last_visit_date: '2026-03-18', average_purchase_frequency_days: 15, phone: '(11) 99999-0001', email: 'carlos@horizonte.com' },
  { id: 'd-c2', company_name: 'Materiais Express', contact_name: 'Ana Souza', city: 'Campinas', state: 'SP', status: 'active' as const, potential_value: 35000, last_purchase_date: '2026-03-08', last_visit_date: '2026-03-15', average_purchase_frequency_days: 20, phone: '(19) 99999-0002', email: 'ana@express.com' },
  { id: 'd-c3', company_name: 'Engenharia Viva', contact_name: 'Pedro Lima', city: 'Curitiba', state: 'PR', status: 'risk' as const, potential_value: 28000, last_purchase_date: '2026-02-01', last_visit_date: '2026-02-10', average_purchase_frequency_days: 25, phone: '(41) 99999-0003', email: 'pedro@viva.com' },
  { id: 'd-c4', company_name: 'Distribuidora Norte', contact_name: 'Maria Oliveira', city: 'Belo Horizonte', state: 'MG', status: 'warm' as const, potential_value: 42000, last_purchase_date: '2026-02-20', last_visit_date: '2026-03-01', average_purchase_frequency_days: 30, phone: '(31) 99999-0004', email: 'maria@norte.com' },
  { id: 'd-c5', company_name: 'Acabamentos Premium', contact_name: 'João Santos', city: 'Rio de Janeiro', state: 'RJ', status: 'active' as const, potential_value: 60000, last_purchase_date: '2026-03-12', last_visit_date: '2026-03-20', average_purchase_frequency_days: 12, phone: '(21) 99999-0005', email: 'joao@premium.com' },
  { id: 'd-c6', company_name: 'Ferro & Aço Industrial', contact_name: 'Roberto Costa', city: 'Porto Alegre', state: 'RS', status: 'inactive' as const, potential_value: 18000, last_purchase_date: '2025-12-15', last_visit_date: '2026-01-05', average_purchase_frequency_days: 45, phone: '(51) 99999-0006', email: 'roberto@ferraco.com' },
  { id: 'd-c7', company_name: 'Cerâmica Brasil', contact_name: 'Fernanda Dias', city: 'Florianópolis', state: 'SC', status: 'active' as const, potential_value: 38000, last_purchase_date: '2026-03-15', last_visit_date: '2026-03-22', average_purchase_frequency_days: 18, phone: '(48) 99999-0007', email: 'fernanda@ceramica.com' },
  { id: 'd-c8', company_name: 'Elétrica Total', contact_name: 'Lucas Mendes', city: 'Goiânia', state: 'GO', status: 'risk' as const, potential_value: 22000, last_purchase_date: '2026-01-28', last_visit_date: '2026-02-05', average_purchase_frequency_days: 35, phone: '(62) 99999-0008', email: 'lucas@eletrica.com' },
];

const demoSales = [
  { id: 'd-s1', client_id: 'd-c1', total_value: 12500, margin_value: 3750, sale_date: '2026-03-10', status: 'confirmed', created_at: '2026-03-10T10:00:00Z', clients: { company_name: 'Construtora Horizonte' } },
  { id: 'd-s2', client_id: 'd-c2', total_value: 8900, margin_value: 2670, sale_date: '2026-03-08', status: 'confirmed', created_at: '2026-03-08T14:00:00Z', clients: { company_name: 'Materiais Express' } },
  { id: 'd-s3', client_id: 'd-c5', total_value: 22000, margin_value: 6600, sale_date: '2026-03-12', status: 'confirmed', created_at: '2026-03-12T09:00:00Z', clients: { company_name: 'Acabamentos Premium' } },
  { id: 'd-s4', client_id: 'd-c7', total_value: 9800, margin_value: 2940, sale_date: '2026-03-15', status: 'confirmed', created_at: '2026-03-15T11:00:00Z', clients: { company_name: 'Cerâmica Brasil' } },
  { id: 'd-s5', client_id: 'd-c4', total_value: 15200, margin_value: 4560, sale_date: '2026-02-20', status: 'confirmed', created_at: '2026-02-20T16:00:00Z', clients: { company_name: 'Distribuidora Norte' } },
  { id: 'd-s6', client_id: 'd-c1', total_value: 18700, margin_value: 5610, sale_date: '2026-03-18', status: 'confirmed', created_at: '2026-03-18T08:00:00Z', clients: { company_name: 'Construtora Horizonte' } },
];

const demoVisits = [
  { id: 'd-v1', client_id: 'd-c1', scheduled_date: '2026-03-26T09:00:00Z', status: 'scheduled', purpose: 'Apresentar nova linha', clients: { company_name: 'Construtora Horizonte' } },
  { id: 'd-v2', client_id: 'd-c3', scheduled_date: '2026-03-26T14:00:00Z', status: 'scheduled', purpose: 'Reativação de conta', clients: { company_name: 'Engenharia Viva' } },
  { id: 'd-v3', client_id: 'd-c5', scheduled_date: '2026-03-27T10:00:00Z', status: 'scheduled', purpose: 'Follow-up pedido', clients: { company_name: 'Acabamentos Premium' } },
  { id: 'd-v4', client_id: 'd-c2', scheduled_date: '2026-03-20T11:00:00Z', status: 'completed', purpose: 'Revisão trimestral', completed_date: '2026-03-20T12:00:00Z', clients: { company_name: 'Materiais Express' } },
];

const demoInsights = [
  { id: 'd-i1', type: 'risk', priority: 'high', title: 'Engenharia Viva está sumindo', description: 'Sem compra há 52 dias, acima da média de 25 dias. Risco alto de churn.', recommended_action: 'Agendar visita urgente e oferecer condição especial', estimated_value: 8400, status: 'active', clients: { company_name: 'Engenharia Viva' } },
  { id: 'd-i2', type: 'opportunity', priority: 'high', title: 'Acabamentos Premium tem alta chance de recompra', description: 'Frequência de 12 dias, próxima compra prevista em 2 dias.', recommended_action: 'Ligar e oferecer mix complementar', estimated_value: 15000, status: 'active', clients: { company_name: 'Acabamentos Premium' } },
  { id: 'd-i3', type: 'behavior', priority: 'medium', title: 'Região Sul caiu 18% em frequência', description: 'Clientes do PR e SC reduziram cadência de compra no último mês.', recommended_action: 'Planejar roteiro de visitas na região', status: 'active', clients: null },
  { id: 'd-i4', type: 'recommendation', priority: 'medium', title: 'Clientes de construção têm maior ticket médio', description: 'Segmento construção gera 40% mais receita por pedido que os demais.', recommended_action: 'Priorizar prospecção no segmento', status: 'active', clients: null },
  { id: 'd-i5', type: 'risk', priority: 'high', title: 'Elétrica Total sem visita há 48 dias', description: 'Cliente em risco com potencial de R$ 22.000 sem atenção recente.', recommended_action: 'Visita presencial com proposta personalizada', estimated_value: 6600, status: 'active', clients: { company_name: 'Elétrica Total' } },
  { id: 'd-i6', type: 'opportunity', priority: 'medium', title: 'Ferro & Aço pode ser reativado', description: 'Inativo há 3 meses, mas historicamente bom pagador com ticket alto.', recommended_action: 'Oferecer condição de reativação', estimated_value: 12000, status: 'active', clients: { company_name: 'Ferro & Aço Industrial' } },
];

const demoOpportunities = [
  { id: 'd-o1', client_id: 'd-c3', type: 'churn_risk', priority: 'high', justification: 'Sem compra há 52 dias, frequência média é 25 dias', recommended_action: 'Visita urgente + proposta especial', estimated_value: 8400, status: 'open', clients: { company_name: 'Engenharia Viva', city: 'Curitiba' } },
  { id: 'd-o2', client_id: 'd-c5', type: 'repurchase', priority: 'high', justification: 'Próxima compra prevista em 2 dias pela frequência histórica', recommended_action: 'Ligar e oferecer catálogo atualizado', estimated_value: 22000, status: 'open', clients: { company_name: 'Acabamentos Premium', city: 'Rio de Janeiro' } },
  { id: 'd-o3', client_id: 'd-c6', type: 'reactivation', priority: 'medium', justification: 'Inativo há 3 meses, bom histórico de pagamento', recommended_action: 'Condição especial de reativação', estimated_value: 12000, status: 'open', clients: { company_name: 'Ferro & Aço Industrial', city: 'Porto Alegre' } },
  { id: 'd-o4', client_id: 'd-c8', type: 'no_visit', priority: 'high', justification: 'Sem visita há 48 dias, potencial de R$ 22.000', recommended_action: 'Agendar visita presencial', estimated_value: 6600, status: 'open', clients: { company_name: 'Elétrica Total', city: 'Goiânia' } },
  { id: 'd-o5', client_id: 'd-c4', type: 'mix_increase', priority: 'medium', justification: 'Compra apenas 2 categorias, potencial para 5+', recommended_action: 'Apresentar catálogo completo', estimated_value: 14000, status: 'open', clients: { company_name: 'Distribuidora Norte', city: 'Belo Horizonte' } },
];

const demoFollowUps = [
  { id: 'd-f1', client_id: 'd-c3', due_date: '2026-03-26', description: 'Retornar sobre proposta enviada', completed: false, clients: { company_name: 'Engenharia Viva' } },
  { id: 'd-f2', client_id: 'd-c8', due_date: '2026-03-27', description: 'Verificar status do pedido pendente', completed: false, clients: { company_name: 'Elétrica Total' } },
  { id: 'd-f3', client_id: 'd-c4', due_date: '2026-03-28', description: 'Enviar apresentação de novos produtos', completed: false, clients: { company_name: 'Distribuidora Norte' } },
];

const demoProducts = [
  { id: 'd-p1', name: 'Cimento CP-II 50kg', sku: 'CIM-001', brand: 'Votorantim', cost: 28, price: 42, default_margin: 33, is_active: true },
  { id: 'd-p2', name: 'Argamassa AC-III 20kg', sku: 'ARG-001', brand: 'Quartzolit', cost: 18, price: 29, default_margin: 38, is_active: true },
  { id: 'd-p3', name: 'Porcelanato 60x60 Polido', sku: 'POR-001', brand: 'Portobello', cost: 45, price: 78, default_margin: 42, is_active: true },
  { id: 'd-p4', name: 'Fio Elétrico 2.5mm 100m', sku: 'FIO-001', brand: 'Pirelli', cost: 120, price: 189, default_margin: 37, is_active: true },
  { id: 'd-p5', name: 'Tubo PVC 100mm 6m', sku: 'TUB-001', brand: 'Tigre', cost: 35, price: 58, default_margin: 40, is_active: true },
  { id: 'd-p6', name: 'Tinta Acrílica 18L', sku: 'TIN-001', brand: 'Suvinil', cost: 180, price: 299, default_margin: 40, is_active: true },
  { id: 'd-p7', name: 'Vergalhão CA-50 10mm 12m', sku: 'VER-001', brand: 'Gerdau', cost: 38, price: 62, default_margin: 39, is_active: true },
  { id: 'd-p8', name: 'Rejunte Flexível 5kg', sku: 'REJ-001', brand: 'Weber', cost: 22, price: 38, default_margin: 42, is_active: true },
];

export interface DemoContextType {
  isDemoMode: boolean;
  enableDemo: () => void;
  disableDemo: () => void;
  demoData: {
    clients: typeof demoClients;
    sales: typeof demoSales;
    visits: typeof demoVisits;
    insights: typeof demoInsights;
    opportunities: typeof demoOpportunities;
    followUps: typeof demoFollowUps;
    products: typeof demoProducts;
  };
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  return (
    <DemoContext.Provider value={{
      isDemoMode,
      enableDemo: () => setIsDemoMode(true),
      disableDemo: () => setIsDemoMode(false),
      demoData: { clients: demoClients, sales: demoSales, visits: demoVisits, insights: demoInsights, opportunities: demoOpportunities, followUps: demoFollowUps, products: demoProducts },
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within DemoProvider');
  return context;
};
