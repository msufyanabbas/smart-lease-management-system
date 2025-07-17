import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Store as StoreIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { db } from '../../services/supabase';

const SiteManagement = () => {
  const queryClient = useQueryClient();
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterZone, setFilterZone] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: sites, isLoading, error, refetch } = useQuery({
    queryKey: ['sites', filterStatus, filterZone],
    queryFn: () => db.sites.getAll({
      status: filterStatus !== 'all' ? filterStatus : undefined,
      usage_type: filterZone !== 'all' ? filterZone : undefined,
    }),
    refetchInterval: 30000,
  });

  const updateSiteMutation = useMutation({
    mutationFn: ({ siteId, updates }) => db.sites.update(siteId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setEditDialogOpen(false);
      toast.success('Site updated successfully');
    },
    onError: (error) => {
      toast.error('Error updating site: ' + error.message);
    }
  });

  const filteredSites = sites?.filter(site => 
    site.site_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.zone_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'vacant': return 'success';
      case 'leased': return 'primary';
      case 'reserved': return 'warning';
      case 'under_maintenance': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'vacant': return <CheckCircleIcon />;
      case 'leased': return <StoreIcon />;
      case 'reserved': return <WarningIcon />;
      case 'under_maintenance': return <BuildIcon />;
      default: return <StoreIcon />;
    }
  };

  const handleEditSite = (site) => {
    setSelectedSite(site);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedSite) {
      updateSiteMutation.mutate({
        siteId: selectedSite.site_id,
        updates: {
          zone_name: selectedSite.zone_name,
          description: selectedSite.description,
          status: selectedSite.status,
          base_price_per_sqm: selectedSite.base_price_per_sqm,
          current_price_per_sqm: selectedSite.current_price_per_sqm,
          readiness_index: selectedSite.readiness_index,
        }
      });
    }
  };

  const exportToExcel = () => {
    toast.success('Export functionality coming soon');
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading sites: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Site Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all Boulevard World rental sites
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refetch}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportToExcel}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Sites"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code, zone, or description"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="vacant">Vacant</MenuItem>
                  <MenuItem value="leased">Leased</MenuItem>
                  <MenuItem value="reserved">Reserved</MenuItem>
                  <MenuItem value="under_maintenance">Under Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Zone Type</InputLabel>
                <Select
                  value={filterZone}
                  label="Zone Type"
                  onChange={(e) => setFilterZone(e.target.value)}
                >
                  <MenuItem value="all">All Zones</MenuItem>
                  <MenuItem value="F&B">F&B</MenuItem>
                  <MenuItem value="Retail">Retail</MenuItem>
                  <MenuItem value="Entertainment">Entertainment</MenuItem>
                  <MenuItem value="Services">Services</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Chip 
                  label={`${filteredSites.length} Total`} 
                  color="primary" 
                  size="small"
                />
                <Chip 
                  label={`${filteredSites.filter(s => s.status === 'vacant').length} Available`} 
                  color="success" 
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Site Details</TableCell>
                    <TableCell>Zone & Type</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Pricing</TableCell>
                    <TableCell>Readiness</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSites.map((site) => (
                    <TableRow key={site.site_id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: '#1976d2' }}>
                            <StoreIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {site.site_code}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {site.description || 'No description'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {site.zone_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {site.usage_type}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {site.area_sqm?.toLocaleString()} sqm
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(site.status)}
                          label={site.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(site.status)}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {site.current_price_per_sqm?.toLocaleString()} SAR/sqm
                          </Typography>
                          {site.base_price_per_sqm !== site.current_price_per_sqm && (
                            <Box display="flex" alignItems="center">
                              {site.current_price_per_sqm > site.base_price_per_sqm ? (
                                <TrendingUpIcon fontSize="small" color="success" />
                              ) : (
                                <TrendingDownIcon fontSize="small" color="error" />
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {((site.current_price_per_sqm - site.base_price_per_sqm) / site.base_price_per_sqm * 100).toFixed(1)}%
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {site.readiness_index?.toFixed(1)}%
                          </Typography>
                          <Box 
                            sx={{ 
                              width: 50, 
                              height: 4, 
                              backgroundColor: '#e0e0e0', 
                              borderRadius: 2,
                              mt: 0.5
                            }}
                          >
                            <Box 
                              sx={{ 
                                width: `${site.readiness_index}%`, 
                                height: '100%', 
                                backgroundColor: site.readiness_index >= 80 ? '#4caf50' : 
                                               site.readiness_index >= 60 ? '#ff9800' : '#f44336',
                                borderRadius: 2 
                              }} 
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditSite(site)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton size="small">
                            <MoneyIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Site</DialogTitle>
        <DialogContent>
          {selectedSite && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Zone Name"
                  value={selectedSite.zone_name}
                  onChange={(e) => setSelectedSite({
                    ...selectedSite,
                    zone_name: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedSite.status}
                    label="Status"
                    onChange={(e) => setSelectedSite({
                      ...selectedSite,
                      status: e.target.value
                    })}
                  >
                    <MenuItem value="vacant">Vacant</MenuItem>
                    <MenuItem value="leased">Leased</MenuItem>
                    <MenuItem value="reserved">Reserved</MenuItem>
                    <MenuItem value="under_maintenance">Under Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={selectedSite.description || ''}
                  onChange={(e) => setSelectedSite({
                    ...selectedSite,
                    description: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Base Price per sqm (SAR)"
                  type="number"
                  value={selectedSite.base_price_per_sqm}
                  onChange={(e) => setSelectedSite({
                    ...selectedSite,
                    base_price_per_sqm: parseFloat(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Price per sqm (SAR)"
                  type="number"
                  value={selectedSite.current_price_per_sqm}
                  onChange={(e) => setSelectedSite({
                    ...selectedSite,
                    current_price_per_sqm: parseFloat(e.target.value)
                  })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            disabled={updateSiteMutation.isPending}
          >
            {updateSiteMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SiteManagement;