
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Divider,
} from '@mui/material';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';

import {
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { db } from '../../services/supabase';

const WorkflowTracker = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updateData, setUpdateData] = useState({
    status: '',
    review_notes: '',
  });

  const { data: leaseRequests, isLoading, error } = useQuery({
    queryKey: ['lease-requests', statusFilter],
    queryFn: () => db.leaseRequests.getAll({
      status: statusFilter !== 'all' ? statusFilter : undefined
    }),
    refetchInterval: 30000,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, updates }) => {
      const updatedRequest = await db.leaseRequests.update(requestId, updates);
      
      if (updates.status === 'approved') {
        await db.sites.update(selectedRequest.site_id, { status: 'reserved' });
      } else if (updates.status === 'rejected') {
        await db.sites.update(selectedRequest.site_id, { status: 'vacant' });
      } else if (updates.status === 'leased') {
        await db.sites.update(selectedRequest.site_id, { status: 'leased' });
      }

      return updatedRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lease-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setUpdateDialogOpen(false);
      toast.success('Lease request updated successfully');
    },
    onError: (error) => {
      toast.error('Error updating request: ' + error.message);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'info';
      case 'under_review': return 'warning';
      case 'approved': return 'success';
      case 'contract_signed': return 'primary';
      case 'paid': return 'success';
      case 'leased': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <AssignmentIcon />;
      case 'under_review': return <ScheduleIcon />;
      case 'approved': return <CheckCircleIcon />;
      case 'contract_signed': return <AssignmentIcon />;
      case 'paid': return <PaymentIcon />;
      case 'leased': return <StoreIcon />;
      case 'rejected': return <WarningIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const filteredRequests = leaseRequests?.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  }) || [];

  const requestsByStatus = {
    all: leaseRequests || [],
    pending: leaseRequests?.filter(r => ['new', 'under_review'].includes(r.status)) || [],
    approved: leaseRequests?.filter(r => ['approved', 'contract_signed', 'paid'].includes(r.status)) || [],
    completed: leaseRequests?.filter(r => r.status === 'leased') || [],
    rejected: leaseRequests?.filter(r => r.status === 'rejected') || [],
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleUpdateRequest = (request) => {
    setSelectedRequest(request);
    setUpdateData({
      status: request.status,
      review_notes: request.review_notes || '',
    });
    setUpdateDialogOpen(true);
  };

  const handleSaveUpdate = () => {
    if (selectedRequest) {
      updateRequestMutation.mutate({
        requestId: selectedRequest.request_id,
        updates: {
          ...updateData,
          reviewed_by: 'current_user_id', // In real app, get from auth
        }
      });
    }
  };

  const getCurrentTabData = () => {
    switch (currentTab) {
      case 0: return requestsByStatus.all;
      case 1: return requestsByStatus.pending;
      case 2: return requestsByStatus.approved;
      case 3: return requestsByStatus.completed;
      case 4: return requestsByStatus.rejected;
      default: return [];
    }
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading lease requests: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Workflow Tracker
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage lease request workflows
          </Typography>
        </Box>
        <Button variant="contained" href="/lease-request">
          New Lease Request
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Review
                  </Typography>
                  <Typography variant="h4">
                    {requestsByStatus.pending.length}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#ff9800' }}>
                  <ScheduleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Approved
                  </Typography>
                  <Typography variant="h4">
                    {requestsByStatus.approved.length}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#4caf50' }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4">
                    {requestsByStatus.completed.length}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#1976d2' }}>
                  <StoreIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h4">
                    {requestsByStatus.all.length}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#9c27b0' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Tabs 
            value={currentTab} 
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="All Requests" />
            <Tab 
              label={
                <Badge badgeContent={requestsByStatus.pending.length} color="warning">
                  Pending
                </Badge>
              }
            />
            <Tab 
              label={
                <Badge badgeContent={requestsByStatus.approved.length} color="success">
                  Approved
                </Badge>
              }
            />
            <Tab label="Completed" />
            <Tab label="Rejected" />
          </Tabs>

          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request Details</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Site</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentTabData().map((request) => (
                    <TableRow key={request.request_id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {request.business_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.activity_type} • {request.requested_duration_months} months
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(request.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {request.clients?.client_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {request.clients?.contact_info?.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {request.operations_sites?.site_code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.operations_sites?.zone_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(request.status)}
                          label={request.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" fontWeight="bold">
                            {request.priority_score?.toFixed(1)}
                          </Typography>
                          <Box
                            sx={{
                              width: 40,
                              height: 4,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 2,
                              ml: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: `${(request.priority_score / 10) * 100}%`,
                                height: '100%',
                                backgroundColor: request.priority_score >= 8 ? '#4caf50' : 
                                               request.priority_score >= 6 ? '#ff9800' : '#f44336',
                                borderRadius: 2,
                              }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {request.total_amount?.toLocaleString()} SAR
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          per month
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(request)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateRequest(request)}
                            disabled={request.status === 'leased' || request.status === 'rejected'}
                          >
                            <EditIcon />
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
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Lease Request Details
            <IconButton onClick={() => setDetailsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Client Information
                    </Typography>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PersonIcon sx={{ mr: 1 }} />
                      <Typography>{selectedRequest.clients?.client_name}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={2}>
                      <BusinessIcon sx={{ mr: 1 }} />
                      <Typography>{selectedRequest.business_name}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PhoneIcon sx={{ mr: 1 }} />
                      <Typography>{selectedRequest.clients?.contact_info?.phone}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <EmailIcon sx={{ mr: 1 }} />
                      <Typography>{selectedRequest.clients?.contact_info?.email}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <StoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Site Information
                    </Typography>
                    <Typography mb={1}><strong>Site Code:</strong> {selectedRequest.operations_sites?.site_code}</Typography>
                    <Typography mb={1}><strong>Zone:</strong> {selectedRequest.operations_sites?.zone_name}</Typography>
                    <Typography mb={1}><strong>Area:</strong> {selectedRequest.operations_sites?.area_sqm} sqm</Typography>
                    <Typography mb={1}><strong>Activity:</strong> {selectedRequest.activity_type}</Typography>
                    <Typography mb={1}><strong>Duration:</strong> {selectedRequest.requested_duration_months} months</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <AttachMoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Financial Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography><strong>Monthly Rent:</strong> {selectedRequest.monthly_rent?.toLocaleString()} SAR</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography><strong>VAT Amount:</strong> {selectedRequest.vat_amount?.toLocaleString()} SAR</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography><strong>Platform Fee:</strong> {selectedRequest.platform_fee?.toLocaleString()} SAR</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography><strong>Total Monthly:</strong> {selectedRequest.total_amount?.toLocaleString()} SAR</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6">
                          <strong>Total Contract Value:</strong> {(selectedRequest.total_amount * selectedRequest.requested_duration_months)?.toLocaleString()} SAR
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Workflow Timeline
                    </Typography>
                    <Timeline>
                      <TimelineItem>
                        <TimelineSeparator>
                          <TimelineDot color="primary">
                            <AssignmentIcon />
                          </TimelineDot>
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="h6">Request Submitted</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(selectedRequest.created_at).toLocaleString()}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                      
                      {selectedRequest.status !== 'new' && (
                        <TimelineItem>
                          <TimelineSeparator>
                            <TimelineDot color="warning">
                              <ScheduleIcon />
                            </TimelineDot>
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="h6">Under Review</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Status changed to under review
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                      )}
                      
                      {['approved', 'contract_signed', 'paid', 'leased'].includes(selectedRequest.status) && (
                        <TimelineItem>
                          <TimelineSeparator>
                            <TimelineDot color="success">
                              <CheckCircleIcon />
                            </TimelineDot>
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="h6">Approved</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Request approved for lease
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                      )}
                      
                      {selectedRequest.status === 'leased' && (
                        <TimelineItem>
                          <TimelineSeparator>
                            <TimelineDot color="primary">
                              <StoreIcon />
                            </TimelineDot>
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="h6">Lease Active</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Tenant has taken possession
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                      )}
                      
                      {selectedRequest.status === 'rejected' && (
                        <TimelineItem>
                          <TimelineSeparator>
                            <TimelineDot color="error">
                              <WarningIcon />
                            </TimelineDot>
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="h6">Rejected</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Request was rejected
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                      )}
                    </Timeline>
                  </CardContent>
                </Card>
              </Grid>
              
              {selectedRequest.review_notes && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Review Notes
                      </Typography>
                      <Typography variant="body2">
                        {selectedRequest.review_notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Lease Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={updateData.status}
                  label="Status"
                  onChange={(e) => setUpdateData({
                    ...updateData,
                    status: e.target.value
                  })}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="contract_signed">Contract Signed</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="leased">Leased</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Review Notes"
                multiline
                rows={4}
                value={updateData.review_notes}
                onChange={(e) => setUpdateData({
                  ...updateData,
                  review_notes: e.target.value
                })}
                placeholder="Add notes about this status change..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUpdate}
            variant="contained"
            disabled={updateRequestMutation.isPending}
            startIcon={updateRequestMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {updateRequestMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowTracker;