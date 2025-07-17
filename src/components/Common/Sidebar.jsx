import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Language as LanguageIcon,
  AccountCircle as AccountCircleIcon,
  Timeline as WorkflowIcon,
  Add as AddIcon,
  Assignment as ContractIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DRAWER_WIDTH = 280;

const Sidebar = ({ isMobile, mobileOpen, onDrawerToggle, user }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageSwitch = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const navigationItems = [
    {
      text: t('Dashboard'),
      icon: <DashboardIcon />,
      path: '/',
      color: '#1976d2'
    },
    {
      text: t('Site Management'),
      icon: <StoreIcon />,
      path: '/sites',
      color: '#2e7d32'
    },
    {
      text: t('New Lease Request'),
      icon: <AddIcon />,
      path: '/lease-request',
      color: '#ed6c02'
    },
    {
      text: t('Workflow Tracker'),
      icon: <WorkflowIcon />,
      path: '/workflow',
      color: '#9c27b0'
    },
    {
      text: t('Contracts'),
      icon: <ContractIcon />,
      path: '/contracts',
      color: '#d32f2f'
    },
    {
      text: t('Operational Insights'),
      icon: <AssessmentIcon />,
      path: '/insights',
      color: '#0288d1'
    },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', minHeight: 64 }}>
        <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
          <StoreIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Boulevard World
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('Leasing Management')}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, px: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: `${item.color}15`,
                  color: item.color,
                  '& .MuiListItemIcon-root': {
                    color: item.color,
                  },
                },
                '&:hover': {
                  backgroundColor: `${item.color}08`,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List sx={{ pt: 1 }}>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: 2, mx: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary={t('Settings')}
              primaryTypographyProps={{ fontSize: '0.875rem' }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: '#1976d2' }}>
            <AccountCircleIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              {user?.email || 'Demo User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('System Administrator')}
            </Typography>
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={i18n.language === 'ar'}
              onChange={handleLanguageSwitch}
              size="small"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LanguageIcon sx={{ mr: 1, fontSize: 16 }} />
              <Typography variant="caption">
                {i18n.language === 'ar' ? 'العربية' : 'English'}
              </Typography>
            </Box>
          }
        />
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
            backgroundColor: '#fff',
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;