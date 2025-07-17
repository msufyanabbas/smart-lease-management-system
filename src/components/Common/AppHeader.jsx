import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Avatar,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';

const AppHeader = ({ onDrawerToggle, user }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm')); // mobile
  const isMdDown = useMediaQuery(theme.breakpoints.down('md')); // tablets

  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  const handleUserMenuClick = (event) => setUserMenuAnchor(event.currentTarget);
  const handleNotificationClick = (event) => setNotificationAnchor(event.currentTarget);
  const handleMenuClose = () => {
    setUserMenuAnchor(null);
    setNotificationAnchor(null);
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#fff',
          color: '#333',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar sx={{ px: isXs ? 1 : 2 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant={isXs ? 'body1' : 'h6'}
            sx={{ flexGrow: 1, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {t('Boulevard World Leasing System')}
          </Typography>

          {!isXs && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Chip label={t('System Online')} color="success" size="small" sx={{ mr: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
              </Typography>
            </Box>
          )}

          <IconButton color="inherit" onClick={handleNotificationClick} sx={{ mr: 1 }}>
            <Badge badgeContent={notifications?.length || 0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={handleUserMenuClick} color="inherit">
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { width: 200, mt: 1.5 } }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          {t('Profile')}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          {t('Settings')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {t('Logout')}
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { width: isXs ? '90vw' : 350, mt: 1.5, maxHeight: 400 } }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6">{t('Notifications')}</Typography>
        </Box>

        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem key={notification.notification_id} onClick={handleMenuClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight="medium">
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.message}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  {new Date(notification.created_at).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleMenuClose}>
            <Box sx={{ width: '100%', textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('No new notifications')}
              </Typography>
            </Box>
          </MenuItem>
        )}

        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
            {t('View All Notifications')}
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AppHeader;
