import { Box } from '@mui/material';
import { useDashboardData } from '../../hooks/useDashboardData';
import HeaderActions from '../../components/Cards/HeaderActions';
import SystemHealthAlert from '../../components/Alerts/SystemHealthAlert';
import MetricCardsSection from '../../components/Sections/MetricCardsSection';
import ChartsAndNotifications from '../../components/Cards/ChartCard';
import QuickActions from '../../components/Cards/QuickActionCard';
import StatusSummary from '../../components/Cards/StatisticsCards';

const Dashboard = () => {
  const {
    sitesData,
    sitesLoading,
    leaseRequestsData,
    requestsLoading,
    notifications,
    notificationsLoading,
    insights,
    systemHealth,
  } = useDashboardData();

  return (
    <Box sx={{ p: 3 }}>
      <HeaderActions />
      <SystemHealthAlert systemHealth={systemHealth} />
      <MetricCardsSection
        sitesData={sitesData}
        sitesLoading={sitesLoading}
        insights={insights}
        leaseRequestsData={leaseRequestsData}
        requestsLoading={requestsLoading}
      />
      <ChartsAndNotifications
        sitesData={sitesData}
        leaseRequestsData={leaseRequestsData}
        isLoading={sitesLoading || requestsLoading || notificationsLoading}
        notifications={notifications}
        notificationsLoading={notificationsLoading}
      />
      <QuickActions
        sitesData={sitesData}
        leaseRequestsData={leaseRequestsData}
        systemHealth={systemHealth}
      />
      <StatusSummary
        sitesData={sitesData}
        leaseRequestsData={leaseRequestsData}
      />
    </Box>
  );
};

export default Dashboard;