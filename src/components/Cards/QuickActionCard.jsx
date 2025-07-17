import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { 
  Add, 
  Assignment, 
  LocationOn, 
  Business,
  TrendingUp,
  Warning
} from '@mui/icons-material';

const QuickActions = ({ sitesData, leaseRequestsData, systemHealth }) => {
  const quickActions = [
    {
      title: 'Add New Site',
      description: 'Register a new site location',
      icon: <Add />,
      color: '#1976d2',
      action: () => {
        // Navigate to add site form
        console.log('Navigate to add site');
      }
    },
    {
      title: 'New Lease Request',
      description: 'Create a new lease request',
      icon: <Assignment />,
      color: '#9c27b0',
      action: () => {
        console.log('Navigate to lease request');
      }
    },
    {
      title: 'View Available Sites',
      description: `${sitesData?.vacant || 0} sites available`,
      icon: <LocationOn />,
      color: '#4caf50',
      action: () => {
        console.log('Navigate to available sites');
      }
    },
    {
      title: 'Pending Requests',
      description: `${(leaseRequestsData?.new || 0) + (leaseRequestsData?.under_review || 0)} requests pending`,
      icon: <Business />,
      color: '#ff9800',
      action: () => {
        console.log('Navigate to pending requests');
      }
    },
    {
      title: 'Occupancy Report',
      description: `${sitesData?.occupancy_rate?.toFixed(1) || 0}% occupancy rate`,
      icon: <TrendingUp />,
      color: '#2e7d32',
      action: () => {
        console.log('Navigate to reports');
      }
    },
    {
      title: 'System Health',
      description: `Status: ${systemHealth}`,
      icon: <Warning />,
      color: systemHealth === 'healthy' ? '#4caf50' : '#f44336',
      action: () => {
        console.log('Navigate to system settings');
      }
    }
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={action.action}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box 
                    sx={{ 
                      backgroundColor: action.color, 
                      color: 'white', 
                      borderRadius: 1, 
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="h6">
                    {action.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {action.description}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ borderColor: action.color, color: action.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.action();
                  }}
                >
                  Go
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickActions;