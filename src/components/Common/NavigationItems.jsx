import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  Add as AddIcon,
  Timeline as WorkflowIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

export const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Site Management', icon: <StoreIcon />, path: '/sites' },
  { text: 'New Lease Request', icon: <AddIcon />, path: '/lease-request' },
  { text: 'Workflow', icon: <WorkflowIcon />, path: '/workflow' },
  { text: 'Contracts', icon: <AssignmentIcon />, path: '/contracts' },
  { text: 'Insights', icon: <AssessmentIcon />, path: '/insights' },
];
