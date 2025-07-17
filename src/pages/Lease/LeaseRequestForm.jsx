import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Store as StoreIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

import { db } from '../../services/supabase';
import { calculateLeasePrice, calculatePriorityScore } from '../../utils/pricingCalculator';

const LeaseRequestForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    client_name: '',
    business_name: '',
    contact_phone: '',
    contact_email: '',
    business_type: '',
    business_license: '',
    cr_number: '',
    vat_number: '',
    
    site_id: '',
    activity_type: '',
    
    requested_start_date: null,
    requested_duration_months: 12,
    payment_method: 'bank_transfer',
    
    monthly_rent: 0,
    vat_amount: 0,
    platform_fee: 0,
    total_amount: 0,
  });

  const [selectedSite, setSelectedSite] = useState(null);
  const [existingClient, setExistingClient] = useState(null);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['available-sites'],
    queryFn: async () => {
      const allSites = await db.sites.getAll();
      return allSites.filter(site => site.status === 'vacant' && site.is_ready);
    },
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: db.clients.getAll,
  });

  const submitMutation = useMutation({
    mutationFn: async (requestData) => {
      let clientId = existingClient?.client_id;
      
      if (!clientId) {
        const newClient = await db.clients.create({
          client_name: requestData.client_name,
          business_name: requestData.business_name,
          contact_info: {
            phone: requestData.contact_phone,
            email: requestData.contact_email,
          },
          business_type: requestData.business_type,
          business_license: requestData.business_license,
          cr_number: requestData.cr_number,
          vat_number: requestData.vat_number,
          sector: requestData.activity_type,
        });
        clientId = newClient.client_id;
      }

      const leaseRequest = await db.leaseRequests.create({
        client_id: clientId,
        site_id: requestData.site_id,
        business_name: requestData.business_name,
        activity_type: requestData.activity_type,
        requested_start_date: requestData.requested_start_date,
        requested_duration_months: requestData.requested_duration_months,
        monthly_rent: requestData.monthly_rent,
        vat_amount: requestData.vat_amount,
        platform_fee: requestData.platform_fee,
        total_amount: requestData.total_amount,
        payment_method: requestData.payment_method,
        status: 'new',
        priority_score: calculatePriorityScore(requestData, selectedSite, existingClient),
      });

      await db.sites.update(requestData.site_id, { status: 'reserved' });

      await db.notifications.create({
        type: 'lease_request',
        title: 'New Lease Request',
        message: `New lease request from ${requestData.business_name} for site ${selectedSite?.site_code}`,
        recipient_email: 'manager@boulevardworld.sa',
        status: 'pending',
      });

      return leaseRequest;
    },
    onSuccess: () => {
      toast.success('Lease request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['available-sites'] });
      navigate('/workflow');
    },
    onError: (error) => {
      toast.error('Error submitting request: ' + error.message);
    }
  });

  const handleSiteSelect = (site) => {
    setSelectedSite(site);
    setFormData({ ...formData, site_id: site.site_id });
    
    const pricing = calculateLeasePrice(site, formData.requested_duration_months);
    setPriceBreakdown(pricing);
    
    if (pricing) {
      setFormData({
        ...formData,
        site_id: site.site_id,
        monthly_rent: pricing.base_rent,
        vat_amount: pricing.vat_amount,
        platform_fee: pricing.platform_fee,
        total_amount: pricing.total_amount,
      });
    }
  };

  const handleClientSelect = (client) => {
    if (client) {
      setExistingClient(client);
      setFormData({
        ...formData,
        client_name: client.client_name,
        business_name: client.business_name,
        contact_phone: client.contact_info?.phone || '',
        contact_email: client.contact_info?.email || '',
        business_type: client.business_type || '',
        business_license: client.business_license || '',
        cr_number: client.cr_number || '',
        vat_number: client.vat_number || '',
      });
    } else {
      setExistingClient(null);
    }
  };

  useEffect(() => {
    if (selectedSite && formData.requested_duration_months) {
      const pricing = calculateLeasePrice(selectedSite, formData.requested_duration_months);
      setPriceBreakdown(pricing);
      
      if (pricing) {
        setFormData(prev => ({
          ...prev,
          monthly_rent: pricing.base_rent,
          vat_amount: pricing.vat_amount,
          platform_fee: pricing.platform_fee,
          total_amount: pricing.total_amount,
        }));
      }
    }
  }, [selectedSite, formData.requested_duration_months]);

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.client_name && formData.business_name && formData.contact_phone && formData.contact_email;
      case 1:
        return formData.site_id && formData.activity_type;
      case 2:
        return formData.requested_start_date && formData.requested_duration_months && formData.payment_method;
      default:
        return true;
    }
  };

  const steps = [
    { label: 'Client Information', icon: <PersonIcon /> },
    { label: 'Site Selection', icon: <StoreIcon /> },
    { label: 'Lease Details', icon: <ScheduleIcon /> },
    { label: 'Review & Submit', icon: <AssignmentIcon /> },
  ];

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    } else {
      toast.error('Please complete all required fields');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      submitMutation.mutate(formData);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ClientInformationStep
            formData={formData}
            setFormData={setFormData}
            clients={clients}
            onClientSelect={handleClientSelect}
          />
        );
      case 1:
        return (
          <SiteSelectionStep
            sites={sites}
            selectedSite={selectedSite}
            onSiteSelect={handleSiteSelect}
            formData={formData}
            setFormData={setFormData}
            sitesLoading={sitesLoading}
          />
        );
      case 2:
        return (
          <LeaseDetailsStep
            formData={formData}
            setFormData={setFormData}
            selectedSite={selectedSite}
            priceBreakdown={priceBreakdown}
          />
        );
      case 3:
        return (
          <ReviewStep
            formData={formData}
            selectedSite={selectedSite}
            priceBreakdown={priceBreakdown}
          />
        );
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography variant="h4" gutterBottom>
            New Lease Request
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Submit a new lease request for Boulevard World
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel icon={step.icon}>
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ minHeight: '400px' }}>
              {renderStepContent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
              >
                Back
              </Button>
              
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!validateStep(activeStep) || submitMutation.isPending}
                    startIcon={submitMutation.isPending ? <CircularProgress size={20} /> : <SendIcon />}
                  >
                    {submitMutation.isPending ? 'Submitting...' : 'Submit Request'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    disabled={!validateStep(activeStep)}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

const ClientInformationStep = ({ formData, setFormData, clients, onClientSelect }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Client Information
    </Typography>
    
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Autocomplete
          options={clients || []}
          getOptionLabel={(option) => `${option.client_name} - ${option.business_name}`}
          onChange={(_, value) => onClientSelect(value)}
          renderInput={(params) => (
            <TextField {...params} label="Search Existing Client" />
          )}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Client Name"
          value={formData.client_name}
          onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Business Name"
          value={formData.business_name}
          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contact Phone"
          value={formData.contact_phone}
          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contact Email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Business Type"
          value={formData.business_type}
          onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="CR Number"
          value={formData.cr_number}
          onChange={(e) => setFormData({ ...formData, cr_number: e.target.value })}
        />
      </Grid>
    </Grid>
  </Box>
);

const SiteSelectionStep = ({ sites, selectedSite, onSiteSelect, formData, setFormData, sitesLoading }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Site Selection
    </Typography>
    
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Activity Type</InputLabel>
          <Select
            value={formData.activity_type}
            label="Activity Type"
            onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
            required
          >
            <MenuItem value="F&B">Food & Beverage</MenuItem>
            <MenuItem value="Retail">Retail</MenuItem>
            <MenuItem value="Entertainment">Entertainment</MenuItem>
            <MenuItem value="Services">Services</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Available Sites
        </Typography>
        
        {sitesLoading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2}>
            {sites?.map((site) => (
              <Grid item xs={12} md={6} key={site.site_id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedSite?.site_id === site.site_id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    '&:hover': { borderColor: '#1976d2' },
                  }}
                  onClick={() => onSiteSelect(site)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ backgroundColor: '#1976d2', mr: 2 }}>
                        <StoreIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{site.site_code}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {site.zone_name}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Area:</strong> {site.area_sqm} sqm
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Type:</strong> {site.usage_type}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Price:</strong> {site.current_price_per_sqm} SAR/sqm
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Traffic:</strong> {site.foot_traffic_score}/10
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </Grid>
  </Box>
);

const LeaseDetailsStep = ({ formData, setFormData, selectedSite, priceBreakdown }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Lease Details
    </Typography>
    
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <DatePicker
          label="Requested Start Date"
          value={formData.requested_start_date}
          onChange={(date) => setFormData({ ...formData, requested_start_date: date })}
          renderInput={(params) => <TextField {...params} fullWidth required />}
          minDate={dayjs()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Duration (Months)"
          type="number"
          value={formData.requested_duration_months}
          onChange={(e) => setFormData({ ...formData, requested_duration_months: parseInt(e.target.value) })}
          inputProps={{ min: 1, max: 60 }}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <FormLabel>Payment Method</FormLabel>
          <RadioGroup
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
          >
            <FormControlLabel value="bank_transfer" control={<Radio />} label="Bank Transfer" />
            <FormControlLabel value="credit_card" control={<Radio />} label="Credit Card" />
            <FormControlLabel value="cash" control={<Radio />} label="Cash" />
          </RadioGroup>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        {priceBreakdown && (
          <Card sx={{ backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Price Breakdown
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Base Monthly Rent</TableCell>
                      <TableCell align="right">{priceBreakdown.base_rent?.toLocaleString()} SAR</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>VAT (15%)</TableCell>
                      <TableCell align="right">{priceBreakdown.vat_amount?.toLocaleString()} SAR</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Platform Fee (2%)</TableCell>
                      <TableCell align="right">{priceBreakdown.platform_fee?.toLocaleString()} SAR</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Total Monthly</strong></TableCell>
                      <TableCell align="right"><strong>{priceBreakdown.total_amount?.toLocaleString()} SAR</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  </Box>
);

const ReviewStep = ({ formData, selectedSite, priceBreakdown }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Review & Submit
    </Typography>
    
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Client Information
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Client Name</TableCell>
                    <TableCell>{formData.client_name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Business Name</TableCell>
                    <TableCell>{formData.business_name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Contact Phone</TableCell>
                    <TableCell>{formData.contact_phone}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Contact Email</TableCell>
                    <TableCell>{formData.contact_email}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Site & Lease Details
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Site Code</TableCell>
                    <TableCell>{selectedSite?.site_code}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Zone</TableCell>
                    <TableCell>{selectedSite?.zone_name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Area</TableCell>
                    <TableCell>{selectedSite?.area_sqm} sqm</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Duration</TableCell>
                    <TableCell>{formData.requested_duration_months} months</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Monthly Total</TableCell>
                    <TableCell><strong>{priceBreakdown?.total_amount?.toLocaleString()} SAR</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please review all information carefully before submitting. Once submitted, 
          the request will be processed by our team within 24-48 hours.
        </Alert>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Financial Summary
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Monthly Amount</TableCell>
                    <TableCell align="right">Total for Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Base Rent</TableCell>
                    <TableCell align="right">{priceBreakdown?.base_rent?.toLocaleString()} SAR</TableCell>
                    <TableCell align="right">{(priceBreakdown?.base_rent * formData.requested_duration_months)?.toLocaleString()} SAR</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>VAT (15%)</TableCell>
                    <TableCell align="right">{priceBreakdown?.vat_amount?.toLocaleString()} SAR</TableCell>
                    <TableCell align="right">{(priceBreakdown?.vat_amount * formData.requested_duration_months)?.toLocaleString()} SAR</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Platform Fee (2%)</TableCell>
                    <TableCell align="right">{priceBreakdown?.platform_fee?.toLocaleString()} SAR</TableCell>
                    <TableCell align="right">{(priceBreakdown?.platform_fee * formData.requested_duration_months)?.toLocaleString()} SAR</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{priceBreakdown?.total_amount?.toLocaleString()} SAR</strong></TableCell>
                    <TableCell align="right"><strong>{(priceBreakdown?.total_amount * formData.requested_duration_months)?.toLocaleString()} SAR</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default LeaseRequestForm;