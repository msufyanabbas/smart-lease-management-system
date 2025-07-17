import { Alert, AlertTitle, Box, Collapse } from '@mui/material';
import { CheckCircle, Error, Warning } from '@mui/icons-material';

const SystemHealthAlert = ({ systemHealth }) => {
  const getHealthConfig = (health) => {
    switch (health) {
      case 'healthy':
        return {
          severity: 'success',
          icon: <CheckCircle />,
          title: 'System Healthy',
          message: 'All systems are operational'
        };
      case 'checking':
        return {
          severity: 'info',
          icon: <Warning />,
          title: 'System Check',
          message: 'Checking system health...'
        };
      case 'error':
        return {
          severity: 'error',
          icon: <Error />,
          title: 'System Error',
          message: 'Database connection issues detected'
        };
      default:
        return {
          severity: 'warning',
          icon: <Warning />,
          title: 'System Status Unknown',
          message: 'Unable to determine system health'
        };
    }
  };

  const config = getHealthConfig(systemHealth);

  return (
    <Box sx={{ mb: 2 }}>
      <Collapse in={systemHealth !== 'healthy'}>
        <Alert 
          severity={config.severity} 
          icon={config.icon}
          sx={{ mb: 2 }}
        >
          <AlertTitle>{config.title}</AlertTitle>
          {config.message}
        </Alert>
      </Collapse>
    </Box>
  );
};

export default SystemHealthAlert;