import { Grid, Box } from '@mui/material';
import MetricCard from '../Cards/MetricCard';
import { 
  Business, 
  LocationOn, 
  Assignment, 
  TrendingUp 
} from '@mui/icons-material';

const MetricCardsSection = ({ 
  sitesData, 
  sitesLoading, 
  insights, 
  leaseRequestsData, 
  requestsLoading 
}) => {
  const getOccupancyColor = (rate) => {
    if (rate >= 80) return '#4caf50'; 
    if (rate >= 60) return '#ff9800'; 
    return '#f44336'; 
  };

  const metrics = [
    {
      title: 'Total Sites',
      value: sitesLoading ? '...' : sitesData?.total || 0,
      icon: <LocationOn />,
      color: '#1976d2',
      loading: sitesLoading
    },
    {
      title: 'Occupancy Rate',
      value: sitesLoading ? '...' : `${sitesData?.occupancy_rate?.toFixed(1) || 0}%`,
      icon: <TrendingUp />,
      color: getOccupancyColor(sitesData?.occupancy_rate || 0),
      loading: sitesLoading
    },
    {
      title: 'Lease Requests',
      value: requestsLoading ? '...' : leaseRequestsData?.total || 0,
      icon: <Assignment />,
      color: '#9c27b0',
      loading: requestsLoading
    },
    {
      title: 'Active Leases',
      value: sitesLoading ? '...' : sitesData?.leased || 0,
      icon: <Business />,
      color: '#2e7d32',
      loading: sitesLoading
    }
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MetricCardsSection;