import { Grid, Card, CardContent, Typography, List, ListItem, ListItemText, Box, CircularProgress, Chip } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Notifications } from '@mui/icons-material';

const ChartsAndNotifications = ({ 
  sitesData, 
  leaseRequestsData, 
  isLoading, 
  notifications, 
  notificationsLoading 
}) => {
  const sitesChartData = sitesData ? [
    { name: 'Vacant', value: sitesData.vacant, color: '#4caf50' },
    { name: 'Leased', value: sitesData.leased, color: '#2196f3' },
    { name: 'Reserved', value: sitesData.reserved, color: '#ff9800' },
    { name: 'Maintenance', value: sitesData.maintenance, color: '#f44336' }
  ].filter(item => item.value > 0) : [];

  const requestsChartData = leaseRequestsData ? [
    { name: 'New', value: leaseRequestsData.new, color: '#9c27b0' },
    { name: 'Under Review', value: leaseRequestsData.under_review, color: '#ff9800' },
    { name: 'Approved', value: leaseRequestsData.approved, color: '#4caf50' },
    { name: 'Rejected', value: leaseRequestsData.rejected, color: '#f44336' }
  ].filter(item => item.value > 0) : [];

  const formatNotificationDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'urgent': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sites Status
              </Typography>
              {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sitesChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {sitesChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lease Requests Status
              </Typography>
              {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={requestsChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {requestsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Notifications />
                <Typography variant="h6">
                  Recent Notifications
                </Typography>
              </Box>
              {notificationsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <CircularProgress />
                </Box>
              ) : (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <ListItem key={notification.id} divider>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {notification.message}
                              </Typography>
                              <Chip 
                                label={notification.type} 
                                size="small" 
                                color={getNotificationColor(notification.type)}
                              />
                            </Box>
                          }
                          secondary={formatNotificationDate(notification.created_at)}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText 
                        primary="No new notifications"
                        secondary="All caught up!"
                      />
                    </ListItem>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChartsAndNotifications;