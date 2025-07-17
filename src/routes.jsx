import Dashboard from './components/Dashboard'
// I have added the below components for testing the routing component, I will create the real components later:

const SiteManagement = () => (
  <div style={{ padding: '20px' }}>
    <h1>Site Management</h1>
    <p>Site management functionality coming soon...</p>
  </div>
);

const LeaseRequest = () => (
  <div style={{ padding: '20px' }}>
    <h1>New Lease Request</h1>
    <p>Lease request form coming soon...</p>
  </div>
);

const Workflow = () => (
  <div style={{ padding: '20px' }}>
    <h1>Workflow Tracker</h1>
    <p>Workflow tracking coming soon...</p>
  </div>
);

const Contracts = () => (
  <div style={{ padding: '20px' }}>
    <h1>Contracts</h1>
    <p>Contract management coming soon...</p>
  </div>
);

const Insights = () => (
  <div style={{ padding: '20px' }}>
    <h1>Operational Insights</h1>
    <p>Analytics and insights coming soon...</p>
  </div>
);


export const appRoutes = [
  { path: '/', element: <Dashboard /> },
  { path: '/sites', element: <SiteManagement /> },
  { path: '/lease-request', element: <LeaseRequest /> },
  { path: '/workflow', element: <Workflow /> },
  { path: '/contracts', element: <Contracts /> },
  { path: '/insights', element: <Insights /> },
];
