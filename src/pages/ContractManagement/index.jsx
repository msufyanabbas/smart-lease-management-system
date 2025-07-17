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
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Description as DocumentIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

import { db } from '../../services/supabase';
import { generateLeaseContract } from '../../services/pdfGenerator';

const ContractManagement = () => {
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedContract, setSelectedContract] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [contractData, setContractData] = useState({
    request_id: '',
    start_date: null,
    end_date: null,
    monthly_rent: 0,
    security_deposit: 0,
    payment_day: 1,
  });

  const { data: approvedRequests } = useQuery({
    queryKey: ['approved-requests'],
    queryFn: async () => {
      const requests = await db.leaseRequests.getAll();
      return requests.filter(r => r.status === 'approved');
    },
  });

  const { data: contracts, isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const requests = await db.leaseRequests.getAll();
      
      return requests
        .filter(r => ['approved', 'contract_signed', 'paid', 'leased'].includes(r.status))
        .map(request => ({
          contract_id: `CONTRACT-${request.request_id.slice(-8)}`,
          request_id: request.request_id,
          contract_number: `BW-${new Date().getFullYear()}-${request.request_id.slice(-4)}`,
          start_date: request.requested_start_date,
          end_date: dayjs(request.requested_start_date).add(request.requested_duration_months, 'month').format('YYYY-MM-DD'),
          monthly_rent: request.total_amount,
          security_deposit: request.total_amount * 2,
          payment_day: 1,
          status: request.status === 'approved' ? 'pending_signature' : 
                  request.status === 'contract_signed' ? 'signed' :
                  request.status === 'paid' ? 'active' :
                  request.status === 'leased' ? 'active' : 'draft',
          created_at: request.created_at,
          business_name: request.business_name,
          clients: request.clients,
          operations_sites: request.operations_sites,
          lease_requests: request,
        }));
    },
    refetchInterval: 30000,
  });

  const createContractMutation = useMutation({
    mutationFn: async (contractData) => {
      await db.leaseRequests.update(contractData.request_id, {
        status: 'contract_signed'
      });

      await db.notifications.create({
        type: 'contract_deadline',
        title: 'Contract Created',
        message: `New contract created for ${contractData.business_name}`,
        recipient_email: 'contracts@boulevardworld.sa',
        status: 'pending',
      });

      return contractData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['approved-requests'] });
      setCreateDialogOpen(false);
      toast.success('Contract created successfully');
    },
    onError: (error) => {
      toast.error('Error creating contract: ' + error.message);
    }
  });

  const updateContractMutation = useMutation({
    mutationFn: async ({ contractId, updates }) => {
      const contract = contracts.find(c => c.contract_id === contractId);
      if (contract) {
        let newRequestStatus = contract.lease_requests.status;
        
        if (updates.status === 'signed') {
          newRequestStatus = 'contract_signed';
        } else if (updates.status === 'active') {
          newRequestStatus = 'paid';
        }

        await db.leaseRequests.update(contract.request_id, {
          status: newRequestStatus
        });
      }

      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contract updated successfully');
    },
    onError: (error) => {
      toast.error('Error updating contract: ' + error.message);
    }
  });

  const contractsByStatus = {
    all: contracts || [],
    pending: contracts?.filter(c => c.status === 'pending_signature') || [],
    active: contracts?.filter(c => c.status === 'active') || [],
    signed: contracts?.filter(c => c.status === 'signed') || [],
    expired: contracts?.filter(c => dayjs(c.end_date).isBefore(dayjs())) || [],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_signature': return 'warning';
      case 'signed': return 'info';
      case 'active': return 'success';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_signature': return <ScheduleIcon />;
      case 'signed': return <AssignmentIcon />;
      case 'active': return <CheckCircleIcon />;
      case 'expired': return <WarningIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getCurrentTabData = () => {
    switch (currentTab) {
      case 0: return contractsByStatus.all;
      case 1: return contractsByStatus.pending;
      case 2: return contractsByStatus.active;
      case 3: return contractsByStatus.signed;
      case 4: return contractsByStatus.expired;
      default: return [];
    }
  };

  const handleCreateContract = (request) => {
    setContractData({
      request_id: request.request_id,
      business_name: request.business_name,
      start_date: dayjs(request.requested_start_date),
      end_date: dayjs(request.requested_start_date).add(request.requested_duration_months, 'month'),
      monthly_rent: request.total_amount,
      security_deposit: request.total_amount * 2,
      payment_day: 1,
    });
    setCreateDialogOpen(true);
  };

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setDetailsDialogOpen(true);
  };

  const handleGeneratePDF = (contract) => {
    toast.success('PDF generation functionality will be implemented');
    
    // Uncomment when you have the PDF service
    /*
    const formData = {
      client_name: contract.clients?.client_name,
      business_name: contract.business_name,
      contact_phone: contract.clients?.contact_info?.phone,
      contact_email: contract.clients?.contact_info?.email,
      requested_start_date: contract.start_date,
      requested_duration_months: dayjs(contract.end_date).diff(dayjs(contract.start_date), 'month'),
      payment_method: 'bank_transfer',
    };

    const priceBreakdown = {
      base_rent: contract.monthly_rent * 0.87,
      vat_amount: contract.monthly_rent * 0.13,
      platform_fee: contract.monthly_rent * 0.02,
      total_amount: contract.monthly_rent,
    };

    generateLeaseContract(formData, contract.operations_sites, priceBreakdown);
    */
  };

  const handleSaveContract = () => {
    createContractMutation.mutate(contractData);
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading contracts: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Contract Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage lease contracts and agreements
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => queryClient.invalidateQueries({ queryKey: ['contracts'] })}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Contract
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Pending Signature
                    </Typography>
                    <Typography variant="h4">
                      {contractsByStatus.pending.length}
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
                      Active Contracts
                    </Typography>
                    <Typography variant="h4">
                      {contractsByStatus.active.length}
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
                      Total Revenue
                    </Typography>
                    <Typography variant="h4">
                      {contractsByStatus.active.reduce((sum, c) => sum + (c.monthly_rent || 0), 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      SAR/month
                    </Typography>
                  </Box>
                  <Avatar sx={{ backgroundColor: '#1976d2' }}>
                    <MoneyIcon />
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
                      Expiring Soon
                    </Typography>
                    <Typography variant="h4">
                      {contracts?.filter(c => 
                        dayjs(c.end_date).isBefore(dayjs().add(90, 'day'))
                      ).length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Next 90 days
                    </Typography>
                  </Box>
                  <Avatar sx={{ backgroundColor: '#f44336' }}>
                    <WarningIcon />
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
              <Tab label="All Contracts" />
              <Tab 
                label={
                  <Badge badgeContent={contractsByStatus.pending.length} color="warning">
                    Pending
                  </Badge>
                }
              />
              <Tab 
                label={
                  <Badge badgeContent={contractsByStatus.active.length} color="success">
                    Active
                  </Badge>
                }
              />
              <Tab label="Signed" />
              <Tab label="Expired" />
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
                      <TableCell>Contract Details</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Site</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Monthly Rent</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCurrentTabData().map((contract) => (
                      <TableRow key={contract.contract_id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {contract.contract_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {contract.business_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Created: {new Date(contract.created_at).toLocaleDateString()}
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
                                {contract.clients?.client_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {contract.clients?.contact_info?.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {contract.operations_sites?.site_code}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {contract.operations_sites?.zone_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(contract.status)}
                            label={contract.status.replace('_', ' ').toUpperCase()}
                            color={getStatusColor(contract.status)}
                            size="small"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {dayjs(contract.start_date).format('MMM DD, YYYY')}
                            </Typography>
                            <Typography variant="body2">
                              to {dayjs(contract.end_date).format('MMM DD, YYYY')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(contract.end_date).diff(dayjs(contract.start_date), 'month')} months
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {contract.monthly_rent?.toLocaleString()} SAR
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Security: {contract.security_deposit?.toLocaleString()} SAR
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewContract(contract)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleGeneratePDF(contract)}
                            >
                              <DownloadIcon />
                            </IconButton>
                            {contract.status === 'pending_signature' && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  updateContractMutation.mutate({
                                    contractId: contract.contract_id,
                                    updates: { status: 'signed' }
                                  });
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            )}
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

        {approvedRequests && approvedRequests.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Approved Requests Ready for Contract
              </Typography>
              <List>
                {approvedRequests.map((request) => (
                  <ListItem
                    key={request.request_id}
                    secondaryAction={
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleCreateContract(request)}
                      >
                        Create Contract
                      </Button>
                    }
                  >
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={request.business_name}
                      secondary={`${request.operations_sites?.site_code} - ${request.total_amount?.toLocaleString()} SAR/month`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create New Contract</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Approved Request</InputLabel>
                  <Select
                    value={contractData.request_id}
                    onChange={(e) => {
                      const selectedRequest = approvedRequests?.find(r => r.request_id === e.target.value);
                      if (selectedRequest) {
                        setContractData({
                          request_id: selectedRequest.request_id,
                          business_name: selectedRequest.business_name,
                          start_date: dayjs(selectedRequest.requested_start_date),
                          end_date: dayjs(selectedRequest.requested_start_date).add(selectedRequest.requested_duration_months, 'month'),
                          monthly_rent: selectedRequest.total_amount,
                          security_deposit: selectedRequest.total_amount * 2,
                          payment_day: 1,
                        });
                      }
                    }}
                  >
                    {approvedRequests?.map((request) => (
                      <MenuItem key={request.request_id} value={request.request_id}>
                        {request.business_name} - {request.operations_sites?.site_code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={contractData.start_date}
                  onChange={(date) => setContractData({
                    ...contractData,
                    start_date: date,
                    end_date: date ? date.add(12, 'month') : null
                  })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={contractData.end_date}
                  onChange={(date) => setContractData({ ...contractData, end_date: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Monthly Rent (SAR)"
                  type="number"
                  value={contractData.monthly_rent}
                  onChange={(e) => setContractData({
                    ...contractData,
                    monthly_rent: parseFloat(e.target.value)
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Security Deposit (SAR)"
                  type="number"
                  value={contractData.security_deposit}
                  onChange={(e) => setContractData({
                    ...contractData,
                    security_deposit: parseFloat(e.target.value)
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payment Day of Month"
                  type="number"
                  value={contractData.payment_day}
                  onChange={(e) => setContractData({
                    ...contractData,
                    payment_day: parseInt(e.target.value)
                  })}
                  inputProps={{ min: 1, max: 28 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveContract}
              variant="contained"
              disabled={!contractData.request_id || createContractMutation.isLoading}
            >
              {createContractMutation.isLoading ? 'Creating...' : 'Create Contract'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Contract Details</DialogTitle>
          <DialogContent>
            {selectedContract && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Contract Information
                      </Typography>
                      <Typography><strong>Contract Number:</strong> {selectedContract.contract_number}</Typography>
                      <Typography><strong>Status:</strong> 
                        <Chip 
                          label={selectedContract.status.replace('_', ' ')} 
                          color={getStatusColor(selectedContract.status)} 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography><strong>Duration:</strong> {dayjs(selectedContract.start_date).format('MMM DD, YYYY')} - {dayjs(selectedContract.end_date).format('MMM DD, YYYY')}</Typography>
                      <Typography><strong>Monthly Rent:</strong> {selectedContract.monthly_rent?.toLocaleString()} SAR</Typography>
                      <Typography><strong>Security Deposit:</strong> {selectedContract.security_deposit?.toLocaleString()} SAR</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Client & Site Information
                      </Typography>
                      <Box display="flex" alignItems="center" mb={2}>
                        <PersonIcon sx={{ mr: 1 }} />
                        <Typography>{selectedContract.clients?.client_name}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <BusinessIcon sx={{ mr: 1 }} />
                        <Typography>{selectedContract.business_name}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <StoreIcon sx={{ mr: 1 }} />
                        <Typography>{selectedContract.operations_sites?.site_code} - {selectedContract.operations_sites?.zone_name}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <PhoneIcon sx={{ mr: 1 }} />
                        <Typography>{selectedContract.clients?.contact_info?.phone}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <EmailIcon sx={{ mr: 1 }} />
                        <Typography>{selectedContract.clients?.contact_info?.email}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Contract Timeline
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
                            <Typography variant="h6">Contract Created</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(selectedContract.created_at).toLocaleString()}
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                        
                        {['signed', 'active'].includes(selectedContract.status) && (
                          <TimelineItem>
                            <TimelineSeparator>
                              <TimelineDot color="success">
                                <CheckCircleIcon />
                              </TimelineDot>
                              <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent>
                              <Typography variant="h6">Contract Signed</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Contract has been signed by all parties
                              </Typography>
                            </TimelineContent>
                          </TimelineItem>
                        )}
                        
                        {selectedContract.status === 'active' && (
                          <TimelineItem>
                            <TimelineSeparator>
                              <TimelineDot color="success">
                                <PaymentIcon />
                              </TimelineDot>
                            </TimelineSeparator>
                            <TimelineContent>
                              <Typography variant="h6">Contract Active</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Contract is now active and payments are being processed
                              </Typography>
                            </TimelineContent>
                          </TimelineItem>
                        )}
                      </Timeline>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedContract && (
              <Button
                onClick={() => handleGeneratePDF(selectedContract)}
                variant="contained"
                startIcon={<DownloadIcon />}
              >
                Download PDF
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ContractManagement;