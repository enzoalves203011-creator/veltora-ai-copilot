import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useIsNewUser() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['is-new-user', user?.id],
    queryFn: async () => {
      const [{ count: clientCount }, { count: salesCount }, { count: visitCount }] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('sales').select('*', { count: 'exact', head: true }),
        supabase.from('visits').select('*', { count: 'exact', head: true }),
      ]);
      return {
        hasClients: (clientCount ?? 0) > 0,
        hasSales: (salesCount ?? 0) > 0,
        hasVisits: (visitCount ?? 0) > 0,
        isNew: (clientCount ?? 0) === 0 && (salesCount ?? 0) === 0 && (visitCount ?? 0) === 0,
      };
    },
    enabled: !!user,
  });

  return { ...data, isLoading, isNew: data?.isNew ?? false };
}
