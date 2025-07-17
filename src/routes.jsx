import Dashboard from './pages/Dashboard'
import SiteManagement from './pages/SiteManagement';
import LeaseRequest from './pages/Lease/LeaseRequestForm';
import WorkflowTracker from './pages/WorkflowTracker';
import ContractManagement from './pages/ContractManagement';
import OperationalInsights from './pages/OperationalInsights';

export const appRoutes = [
  { path: '/', element: <Dashboard /> },
  { path: '/sites', element: <SiteManagement /> },
  { path: '/lease-request', element: <LeaseRequest /> },
  { path: '/workflow', element: <WorkflowTracker /> },
  { path: '/contracts', element: <ContractManagement /> },
  { path: '/insights', element: <OperationalInsights /> },
];
