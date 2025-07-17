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
    getAll: async (filters = {}) => {
      let query = supabase.from('operations_sites').select(`
        *,
        cost_centers(name)
      `);

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.usage_type) query = query.eq('usage_type', filters.usage_type);
      if (filters.zone_name) query = query.eq('zone_name', filters.zone_name);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (siteId) => {
      const { data, error } = await supabase
        .from('operations_sites')
        .select('*')
        .eq('site_id', siteId)
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (siteId, updates) => {
      const { data, error } = await supabase
        .from('operations_sites')
        .update(updates)
        .eq('site_id', siteId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    getAvailable: async () => {
      const { data, error } = await supabase
        .from('operations_sites')
        .select('*')
        .eq('status', 'vacant')
        .eq('is_ready', true)
        .order('zone_name');
      
      if (error) throw error;
      return data;
    },

    getStats: async () => {
      const { data, error } = await supabase
        .from('operations_sites')
        .select('status, usage_type');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        vacant: data.filter(s => s.status === 'vacant').length,
        leased: data.filter(s => s.status === 'leased').length,
        reserved: data.filter(s => s.status === 'reserved').length,
        maintenance: data.filter(s => s.status === 'under_maintenance').length,
      };
      
      stats.occupancy_rate = stats.total > 0 ? 
        ((stats.leased + stats.reserved) / stats.total) * 100 : 0;
      
      return stats;
    }
  },

  clients: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    getById: async (clientId) => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('client_id', clientId)
        .single();
      
      if (error) throw error;
      return data;
    },

    create: async (clientData) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    searchByName: async (searchTerm) => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or(`client_name.ilike.%${searchTerm}%,business_name.ilike.%${searchTerm}%`)
        .order('client_name');
      
      if (error) throw error;
      return data;
    }
  },

  leaseRequests: {
    getAll: async (filters = {}) => {
      let query = supabase.from('lease_requests').select(`
        *,
        clients(client_name, business_name, contact_info),
        operations_sites(site_code, zone_name, area_sqm, usage_type)
      `);

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.client_id) query = query.eq('client_id', filters.client_id);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (requestId) => {
      const { data, error } = await supabase
        .from('lease_requests')
        .select(`
          *,
          clients(*),
          operations_sites(*)
        `)
        .eq('request_id', requestId)
        .single();
      
      if (error) throw error;
      return data;
    },

    create: async (requestData) => {
      const { data, error } = await supabase
        .from('lease_requests')
        .insert(requestData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (requestId, updates) => {
      const { data, error } = await supabase
        .from('lease_requests')
        .update(updates)
        .eq('request_id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    getStats: async () => {
      const { data, error } = await supabase
        .from('lease_requests')
        .select('status');
      
      if (error) throw error;
      
      return {
        total: data.length,
        new: data.filter(r => r.status === 'new').length,
        under_review: data.filter(r => r.status === 'under_review').length,
        approved: data.filter(r => r.status === 'approved').length,
        rejected: data.filter(r => r.status === 'rejected').length,
      };
    }
  },

  notifications: {
    getPending: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },

    create: async (notificationData) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  insights: {
    getLatest: async () => {
      const { data, error } = await supabase
        .from('operational_insights')
        .select('*')
        .order('date', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data[0] || null;
    },

    create: async (insightData) => {
      const { data, error } = await supabase
        .from('operational_insights')
        .insert(insightData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};

export const utils = {
  healthCheck: async () => {
    try {
      const { data, error } = await supabase
        .from('operations_sites')
        .select('site_id')
        .limit(1);
      
      return {
        database: error ? 'error' : 'healthy',
        timestamp: new Date().toISOString(),
        error: error?.message
      };
    } catch (err) {
      return {
        database: 'error',
        timestamp: new Date().toISOString(),
        error: err.message
      };
    }
  },

  calculateOccupancyRate: async () => {
    const { data, error } = await supabase
      .from('operations_sites')
      .select('status');
    
    if (error) throw error;
    
    const total = data.length;
    const occupied = data.filter(s => s.status === 'leased' || s.status === 'reserved').length;
    
    return total > 0 ? (occupied / total) * 100 : 0;
  }
};

export default supabase;