import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { db } from '../services/supabase';

export const useDashboardData = () => {
  const [systemHealth, setSystemHealth] = useState('checking');

  const { data: sitesData, isLoading: sitesLoading } = useQuery({
    queryKey: ['sites-stats'],
    queryFn: db.sites.getStats,
    refetchInterval: 30000,
  });

  const { data: leaseRequestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['lease-requests-stats'],
    queryFn: db.leaseRequests.getStats,
    refetchInterval: 30000,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: db.notifications.getPending,
    refetchInterval: 30000,
  });

  const { data: insights } = useQuery({
    queryKey: ['operational-insights'],
    queryFn: db.insights.getLatest,
    refetchInterval: 60000,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await db.utils.healthCheck();
        setSystemHealth(health?.database || 'healthy');
      } catch (error) {
        setSystemHealth('error');
      }
    };
    checkHealth();
  }, []);

  return {
    sitesData,
    sitesLoading,
    leaseRequestsData,
    requestsLoading,
    notifications,
    notificationsLoading,
    insights,
    systemHealth,
  };
};