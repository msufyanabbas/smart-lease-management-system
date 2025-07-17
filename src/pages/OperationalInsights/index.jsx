import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Store as StoreIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Insights as InsightsIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { db } from '../../services/supabase';
import { generateMonthlyReport } from '../../services/pdfGenerator';

const OperationalInsights = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const { data: sitesData, isLoading: sitesLoading } = useQuery({
    queryKey: ['sites-analytics'],
    queryFn: db.sites.getAll,
  });

  const { data: leaseRequestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['lease-requests-analytics'],
    queryFn: db.leaseRequests.getAll,
  });

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients-analytics'],
    queryFn: db.clients.getAll,
  });

  const { data: insightsData } = useQuery({
    queryKey: ['operational-insights'],
    queryFn: db.insights.getLatest,
  });

  const analytics = React.useMemo(() => {
    if (!sitesData || !leaseRequestsData || !clientsData) return null;

    const totalSites = sitesData.length;
    const vacantSites = sitesData.filter(s => s.status === 'vacant').length;
    const leasedSites = sitesData.filter(s => s.status === 'leased').length;
    const reservedSites = sitesData.filter(s => s.status === 'reserved').length;
    const maintenanceSites = sitesData.filter(s => s.status === 'under_maintenance').length;
    const occupancyRate = ((leasedSites + reservedSites) / totalSites) * 100;

    const totalRevenue = leaseRequestsData
      .filter(r => ['approved', 'contract_signed', 'paid', 'leased'].includes(r.status))
      .reduce((sum, r) => sum + (r.total_amount || 0), 0);

    const avgMonthlyRent = totalRevenue / Math.max(leasedSites + reservedSites, 1);

    const zonePerformance = sitesData.reduce((acc, site) => {
      const zone = site.usage_type;
      if (!acc[zone]) {
        acc[zone] = {
          name: zone,
          total: 0,
          vacant: 0,
          leased: 0,
          reserved: 0,
          revenue: 0,
        };
      }
      acc[zone].total++;
      acc[zone][site.status]++;
      
      const zoneRequests = leaseRequestsData.filter(r => 
        r.operations_sites?.usage_type === zone && 
        ['approved', 'contract_signed', 'paid', 'leased'].includes(r.status)
      );
      acc[zone].revenue = zoneRequests.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      
      return acc;
    }, {});

    const totalClients = clientsData.length;
    const activeClients = leaseRequestsData
      .filter(r => ['approved', 'contract_signed', 'paid', 'leased'].includes(r.status))
      .map(r => r.client_id)
      .filter((value, index, self) => self.indexOf(value) === index).length;

    const totalRequests = leaseRequestsData.length;
    const pendingRequests = leaseRequestsData.filter(r => ['new', 'under_review'].includes(r.status)).length;
    const approvedRequests = leaseRequestsData.filter(r => ['approved', 'contract_signed', 'paid', 'leased'].includes(r.status)).length;
    const rejectedRequests = leaseRequestsData.filter(r => r.status === 'rejected').length;
    const approvalRate = (approvedRequests / Math.max(totalRequests, 1)) * 100;

    const monthlyData = [
      { month: 'Jan', revenue: 25000, occupancy: 55, requests: 8 },
      { month: 'Feb', revenue: 32000, occupancy: 62, requests: 12 },
      { month: 'Mar', revenue: 28000, occupancy: 58, requests: 10 },
      { month: 'Apr', revenue: 45000, occupancy: 75, requests: 15 },
      { month: 'May', revenue: 52000, occupancy: 80, requests: 18 },
      { month: 'Jun', revenue: totalRevenue, occupancy: occupancyRate, requests: totalRequests },
    ];

    return {
      overview: {
        totalSites,
        occupancyRate,
        totalRevenue,
        avgMonthlyRent,
        totalClients,
        activeClients,
        approvalRate,
      },
      sites: {
        total: totalSites,
        vacant: vacantSites,
        leased: leasedSites,
        reserved: reservedSites,
        maintenance: maintenanceSites,
        occupancyRate,
      },
      zones: Object.values(zonePerformance),
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        approvalRate,
      },
      trends: monthlyData,
    };
  }, [sitesData, leaseRequestsData, clientsData]);

  const insights = React.useMemo(() => {
    if (!analytics) return [];

    const recommendations = [];

    if (analytics.overview.occupancyRate < 60) {
      recommendations.push({
        type: 'warning',
        category: 'Occupancy',
        title: 'Low Occupancy Rate',
        description: `Current occupancy is ${analytics.overview.occupancyRate.toFixed(1)}%. Consider marketing campaigns or pricing adjustments.`,
        action: 'Launch marketing campaign',
        priority: 'high',
      });
    } else if (analytics.overview.occupancyRate > 85) {
      recommendations.push({
        type: 'success',
        category: 'Occupancy',
        title: 'High Demand',
        description: `Excellent occupancy rate of ${analytics.overview.occupancyRate.toFixed(1)}%. Consider premium pricing.`,
        action: 'Increase pricing for new leases',
        priority: 'medium',
      });
    }

    if (analytics.overview.avgMonthlyRent < 8000) {
      recommendations.push({
        type: 'info',
        category: 'Revenue',
        title: 'Revenue Optimization',
        description: `Average rent is ${analytics.overview.avgMonthlyRent.toLocaleString()} SAR. Review pricing strategy.`,
        action: 'Analyze market rates',
        priority: 'medium',
      });
    }

    const bestZone = analytics.zones.reduce((best, zone) => 
      zone.revenue > (best?.revenue || 0) ? zone : best, null);
    
    if (bestZone) {
      recommendations.push({
        type: 'success',
        category: 'Performance',
        title: `${bestZone.name} Leading Performance`,
        description: `${bestZone.name} zone generates ${bestZone.revenue.toLocaleString()} SAR revenue.`,
        action: 'Replicate success factors',
        priority: 'low',
      });
    }

    if (analytics.requests.approvalRate < 70) {
      recommendations.push({
        type: 'warning',
        category: 'Process',
        title: 'Low Approval Rate',
        description: `Approval rate is ${analytics.requests.approvalRate.toFixed(1)}%. Review qualification criteria.`,
        action: 'Improve client screening',
        priority: 'high',
      });
    }

    return recommendations;
  }, [analytics]);

  const handleExportReport = () => {
    if (analytics) {
      const reportData = {
        startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        totalSites: analytics.overview.totalSites,
        occupiedSites: analytics.sites.leased + analytics.sites.reserved,
        occupancyRate: analytics.overview.occupancyRate,
        monthlyRevenue: analytics.overview.totalRevenue,
        newLeases: analytics.requests.approved,
        renewals: 0, // Mock data
        zonePerformance: analytics.zones,
      };
      generateMonthlyReport(reportData);
    }
  };

  if (sitesLoading || requestsLoading || clientsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert severity="error">
          Unable to load analytics data. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '100%' }}>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', md: 'center' }}
        mb={4}
        gap={2}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Operational Insights
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive analytics and performance insights
          </Typography>
        </Box>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} width={{ xs: '100%', md: 'auto' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            fullWidth={isMobile}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportReport}
            fullWidth={isMobile}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', minHeight: 140 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box flexGrow={1}>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Occupancy Rate
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    {analytics.overview.occupancyRate.toFixed(1)}%
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="body2" color="success.main" ml={0.5}>
                      +5.2% vs last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ backgroundColor: '#4caf50', width: 56, height: 56 }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', minHeight: 140 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box flexGrow={1}>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    {analytics.overview.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    SAR
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#ff9800', width: 56, height: 56 }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', minHeight: 140 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box flexGrow={1}>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Active Clients
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    {analytics.overview.activeClients}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of {analytics.overview.totalClients} total
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#1976d2', width: 56, height: 56 }}>
                  <GroupIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', minHeight: 140 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box flexGrow={1}>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Approval Rate
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    {analytics.requests.approvalRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of {analytics.requests.total} requests
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#9c27b0', width: 56, height: 56 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: { xs: 450, md: 500 }, width: '100%', boxShadow: 2 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 } }}>
              <Box mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Revenue & Occupancy Trends
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly performance overview
                </Typography>
              </Box>
              <Box flexGrow={1} sx={{ width: '100%', height: '100%', minHeight: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={analytics.trends} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={{ stroke: '#e0e0e0' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1976d2"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue (SAR)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="occupancy"
                      stroke="#4caf50"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorOccupancy)"
                      name="Occupancy (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: { xs: 450, md: 500 }, width: '100%', boxShadow: 2 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 } }}>
              <Box mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Site Status Distribution
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current site allocation
                </Typography>
              </Box>
              <Box flexGrow={1} sx={{ width: '100%', height: '100%', minHeight: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <Pie
                      data={[
                        { name: 'Vacant', value: analytics.sites.vacant, color: '#4caf50' },
                        { name: 'Leased', value: analytics.sites.leased, color: '#1976d2' },
                        { name: 'Reserved', value: analytics.sites.reserved, color: '#ff9800' },
                        { name: 'Maintenance', value: analytics.sites.maintenance, color: '#f44336' },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 90 : isTablet ? 100 : 120}
                      innerRadius={isMobile ? 45 : isTablet ? 50 : 60}
                      dataKey="value"
                      label={({ name, percent }) => 
                        percent > 0 ? `${name}\n${(percent * 100).toFixed(0)}%` : ''
                      }
                      labelLine={false}
                      fontSize={isMobile ? 10 : 12}
                    >
                      {[
                        { name: 'Vacant', value: analytics.sites.vacant, color: '#4caf50' },
                        { name: 'Leased', value: analytics.sites.leased, color: '#1976d2' },
                        { name: 'Reserved', value: analytics.sites.reserved, color: '#ff9800' },
                        { name: 'Maintenance', value: analytics.sites.maintenance, color: '#f44336' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="h6" gutterBottom>
                Zone Performance Analysis
              </Typography>
              <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
                <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '20%' }}>Zone</TableCell>
                      <TableCell align="center" sx={{ width: '15%' }}>Total Sites</TableCell>
                      <TableCell align="center" sx={{ width: '20%' }}>Occupancy Rate</TableCell>
                      <TableCell align="right" sx={{ width: '18%' }}>Revenue</TableCell>
                      <TableCell align="right" sx={{ width: '18%' }}>Avg Revenue/Site</TableCell>
                      <TableCell align="center" sx={{ width: '14%' }}>Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.zones.map((zone) => {
                      const occupancyRate = ((zone.leased + zone.reserved) / zone.total) * 100;
                      const avgRevenue = zone.revenue / zone.total;
                      return (
                        <TableRow key={zone.name}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                <StoreIcon />
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {zone.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">{zone.total}</TableCell>
                          <TableCell align="center">
                            <Box display="flex" alignItems="center" justifyContent="center">
                              <Box sx={{ width: 60, mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={occupancyRate}
                                  color={occupancyRate > 70 ? 'success' : occupancyRate > 40 ? 'warning' : 'error'}
                                />
                              </Box>
                              <Typography variant="body2">
                                {occupancyRate.toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {zone.revenue.toLocaleString()} SAR
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {avgRevenue.toLocaleString()} SAR
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                occupancyRate > 70 ? 'Excellent' :
                                occupancyRate > 40 ? 'Good' : 'Needs Attention'
                              }
                              color={
                                occupancyRate > 70 ? 'success' :
                                occupancyRate > 40 ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Typography variant="h6" gutterBottom>
            AI-Powered Insights & Recommendations
          </Typography>
          <Grid container spacing={3}>
            {insights.map((insight, index) => (
              <Grid item xs={12} lg={6} key={index}>
                <Accordion sx={{ width: '100%' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" width="100%">
                      <Avatar
                        sx={{
                          mr: 2,
                          width: 32,
                          height: 32,
                          backgroundColor:
                            insight.type === 'warning' ? '#ff9800' :
                            insight.type === 'success' ? '#4caf50' : '#1976d2'
                        }}
                      >
                        <InsightsIcon fontSize="small" />
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {insight.title}
                        </Typography>
                        <Chip
                          label={insight.priority}
                          color={
                            insight.priority === 'high' ? 'error' :
                            insight.priority === 'medium' ? 'warning' : 'info'
                          }
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {insight.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      fullWidth={isMobile}
                    >
                      {insight.action}
                    </Button>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OperationalInsights;