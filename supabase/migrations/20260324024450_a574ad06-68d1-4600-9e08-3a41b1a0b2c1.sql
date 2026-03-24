
-- Enum types
CREATE TYPE public.client_status AS ENUM ('active', 'warm', 'risk', 'inactive');
CREATE TYPE public.sale_status AS ENUM ('draft', 'confirmed', 'cancelled');
CREATE TYPE public.visit_status AS ENUM ('scheduled', 'completed', 'rescheduled', 'cancelled');
CREATE TYPE public.insight_type AS ENUM ('risk', 'opportunity', 'behavior', 'recommendation');
CREATE TYPE public.insight_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.opportunity_type AS ENUM ('churn_risk', 'repurchase', 'mix_increase', 'no_visit', 'ticket_drop', 'underexplored', 'reactivation');

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  segment TEXT,
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  full_name TEXT,
  role TEXT DEFAULT 'seller',
  phone TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Regions
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Segments
CREATE TABLE public.segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

-- Product categories
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  region_id UUID REFERENCES public.regions(id),
  segment_id UUID REFERENCES public.segments(id),
  status client_status NOT NULL DEFAULT 'active',
  potential_value NUMERIC(12,2) DEFAULT 0,
  average_purchase_frequency_days INTEGER,
  last_purchase_date DATE,
  last_visit_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_clients_company ON public.clients(company_id);
CREATE INDEX idx_clients_status ON public.clients(status);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sku TEXT,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.product_categories(id),
  brand TEXT,
  cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  default_margin NUMERIC(5,2) GENERATED ALWAYS AS (CASE WHEN price > 0 THEN ROUND(((price - cost) / price) * 100, 2) ELSE 0 END) STORED,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_products_company ON public.products(company_id);

-- Sales
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  seller_user_id UUID REFERENCES auth.users(id),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  margin_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  status sale_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_sales_company ON public.sales(company_id);
CREATE INDEX idx_sales_client ON public.sales(client_id);

-- Sale items
CREATE TABLE public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  margin_value NUMERIC(12,2) GENERATED ALWAYS AS (quantity * (unit_price - cost_price)) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Visits
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  seller_user_id UUID REFERENCES auth.users(id),
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  status visit_status NOT NULL DEFAULT 'scheduled',
  purpose TEXT,
  notes TEXT,
  next_action TEXT,
  next_visit_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_visits_company ON public.visits(company_id);
CREATE INDEX idx_visits_client ON public.visits(client_id);

-- Client notes
CREATE TABLE public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

-- Follow-ups
CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  user_id UUID REFERENCES auth.users(id),
  due_date DATE NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- AI Insights
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id),
  type insight_type NOT NULL,
  priority insight_priority NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommended_action TEXT,
  estimated_value NUMERIC(12,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Opportunities
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  type opportunity_type NOT NULL,
  estimated_value NUMERIC(12,2),
  priority insight_priority NOT NULL DEFAULT 'medium',
  justification TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Settings
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, key)
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update companies" ON public.companies FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Read regions" ON public.regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage regions" ON public.regions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update regions" ON public.regions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete regions" ON public.regions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Read segments" ON public.segments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage segments" ON public.segments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update segments" ON public.segments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete segments" ON public.segments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Read categories" ON public.product_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage categories" ON public.product_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update categories" ON public.product_categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete categories" ON public.product_categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Read clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update clients" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete clients" ON public.clients FOR DELETE TO authenticated USING (true);

CREATE POLICY "Read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete products" ON public.products FOR DELETE TO authenticated USING (true);

CREATE POLICY "Read sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update sales" ON public.sales FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Read sale_items" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert sale_items" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Read visits" ON public.visits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert visits" ON public.visits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update visits" ON public.visits FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Read notes" ON public.client_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert notes" ON public.client_notes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Read follow_ups" ON public.follow_ups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert follow_ups" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update follow_ups" ON public.follow_ups FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete follow_ups" ON public.follow_ups FOR DELETE TO authenticated USING (true);

CREATE POLICY "Read insights" ON public.ai_insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert insights" ON public.ai_insights FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update insights" ON public.ai_insights FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete insights" ON public.ai_insights FOR DELETE TO authenticated USING (true);

CREATE POLICY "Read opportunities" ON public.opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert opportunities" ON public.opportunities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update opportunities" ON public.opportunities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete opportunities" ON public.opportunities FOR DELETE TO authenticated USING (true);

CREATE POLICY "Read settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert settings" ON public.settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update settings" ON public.settings FOR UPDATE TO authenticated USING (true);

-- Triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
