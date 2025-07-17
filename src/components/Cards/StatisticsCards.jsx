import { Grid, Card, CardContent, Typography, LinearProgress, Box, Chip } from '@mui/material';
import { 
  LocationOn, 
  Business, 
  Assignment, 
  CheckCircle,
  Schedule,
  Cancel
} from '@mui/icons-material';

const StatusSummary = ({ sitesData, leaseRequestsData }) => {
  const summaryCards = [
    {
      title: 'Sites Overview',
      icon: <LocationOn />,
      color: '#1976d2',
      data: sitesData ? [
        { label: 'Total Sites', value: sitesData.total, color: '#1976d2' },
        { label: 'Vacant', value: sitesData.vacant, color: '#4caf50' },
        { label: 'Leased', value: sitesData.leased, color: '#2196f3' },
        { label: 'Reserved', value: sitesData.reserved, color: '#ff9800' },
        { label: 'Under Maintenance', value: sitesData.maintenance, color: '#f44336' }
      ] : []
    },
    {
      title: 'Lease Requests',
      icon: <Assignment />,
      color: '#9c27b0',
      data: leaseRequestsData ? [
        { label: 'Total Requests', value: leaseRequestsData.total, color: '#9c27b0' },
        { label: 'New', value: leaseRequestsData.new, color: '#9c27b0' },
        { label: 'Under Review', value: leaseRequestsData.under_review, color: '#ff9800' },
        { label: 'Approved', value: leaseRequestsData.approved, color: '#4caf50' },
        { label: 'Rejected', value: leaseRequestsData.rejected, color: '#f44336' }
      ] : []
    },
    {
      title: 'Performance Metrics',
      icon: <Business />,
      color: '#2e7d32',
      data: sitesData ? [
        { 
          label: 'Occupancy Rate', 
          value: `${sitesData.occupancy_rate?.toFixed(1) || 0}%`, 
          color: sitesData.occupancy_rate >= 80 ? '#4caf50' : sitesData.occupancy_rate >= 60 ? '#ff9800' : '#f44336'
        },
        { 
          label: 'Vacancy Rate', 
          value: `${sitesData.total > 0 ? ((sitesData.vacant / sitesData.total) * 100).toFixed(1) : 0}%`, 
          color: '#2196f3' 
        },
        { 
          label: 'Utilization', 
          value: `${sitesData.total > 0 ? (((sitesData.leased + sitesData.reserved) / sitesData.total) * 100).toFixed(1) : 0}%`, 
          color: '#9c27b0' 
        }
      ] : []
    }
  ];

  const getStatusIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'approved':
        return <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />;
      case 'under review':
        return <Schedule sx={{ fontSize: 16, color: '#ff9800' }} />;
      case 'rejected':
        return <Cancel sx={{ fontSize: 16, color: '#f44336' }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Status Summary
      </Typography>
      <Grid container spacing={3}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Box 
                    sx={{ 
                      backgroundColor: card.color, 
                      color: 'white', 
                      borderRadius: 1, 
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6">
                    {card.title}
                  </Typography>
                </Box>
                
                {card.data.map((item, itemIndex) => (
                  <Box key={itemIndex} sx={{ mb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(item.label)}
                        <Typography variant="body2" color="text.secondary">
                          {item.label}
                        </Typography>
                      </Box>
                      <Chip 
                        label={item.value} 
                        size="small" 
                        sx={{ 
                          backgroundColor: item.color, 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    
                    {/* Progress bar for percentage values */}
                    {typeof item.value === 'string' && item.value.includes('%') && (
                      <LinearProgress 
                        variant="determinate" 
                        value={parseFloat(item.value)} 
                        sx={{ 
                          height: 4, 
                          borderRadius: 2,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: item.color
                          }
                        }} 
                      />
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatusSummary;