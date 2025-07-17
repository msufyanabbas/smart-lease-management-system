import { Box, Typography, Button } from '@mui/material';

export default function HeaderActions() {
  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      sx={{ 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}
    >
      <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
        Dashboard
      </Typography>
      <Button 
        variant="contained" 
        color="primary"
        sx={{ 
          minWidth: { xs: '100%', sm: 'auto' },
          fontSize: { xs: '0.875rem', sm: '0.875rem' }
        }}
      >
        Create Report
      </Button>
    </Box>
  );
}