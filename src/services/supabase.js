import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const db = {
  sites: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('operations_sites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    
    getById: async (id) => {
      const { data, error } = await supabase
        .from('operations_sites')
        .select('*')
        .eq('site_id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  },
  
  leaseRequests: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('lease_requests')
        .select(`
          *,
          clients(client_name, business_name),
          operations_sites(site_code, zone_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  }
};

export default supabase;