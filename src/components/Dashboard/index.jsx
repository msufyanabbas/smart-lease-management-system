import {
  Box,
  Grid,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Store as StoreIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

import MetricCard from '../Cards/MetricCard';
import QuickActionCard from '../Cards/QuickActionCard';

const Dashboard = () => {
  const mockData = {
    totalSites: 16,
    occupancyRate: 43.75,
    monthlyRevenue: 45000,
    activeContracts: 4,
    pendingRequests: 3,
    overduePayments: 0,
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to Boulevard World Leasing Management System
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="contained" startIcon={<AddIcon />} href="/lease-request">
            New Lease Request
          </Button>
          <Button variant="outlined" startIcon={<AssessmentIcon />} href="/insights">
            View Insights
          </Button>
        </Box>
      </Box>

      {/* System Status Alert */}
      <Alert severity="success" sx={{ mb: 3 }}>
        System is online and operational. All services are running normally.
      </Alert>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Sites"
            value={mockData.totalSites}
            icon={<StoreIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Occupancy Rate"
            value={`${mockData.occupancyRate}%`}
            icon={<TrendingUpIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Revenue"
            value={`${mockData.monthlyRevenue.toLocaleString()} SAR`}
            icon={<MoneyIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Contracts"
            value={mockData.activeContracts}
            icon={<AssignmentIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <QuickActionCard
                title="Pending Requests"
                value={mockData.pendingRequests}
                valueColor="primary"
                description="Lease requests requiring review"
                buttonLabel="Review Now"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <QuickActionCard
                title="Overdue Payments"
                value={mockData.overduePayments}
                valueColor="error"
                description="Payments requiring attention"
                buttonLabel="View Details"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <QuickActionCard
                title="System Health"
                value="100%"
                valueColor="success.main"
                description="All systems operational"
                buttonLabel="View Status"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
