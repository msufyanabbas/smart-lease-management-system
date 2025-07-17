import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});


// I have added the below components for testing the routing component, I will create the real components later:
const Dashboard = () => <div>Dashboard Coming Soon...</div>;
const SiteManagement = () => <div>Site Management Coming Soon...</div>;
const LeaseRequest = () => <div>Lease Request Coming Soon...</div>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sites" element={<SiteManagement />} />
              <Route path="/lease-request" element={<LeaseRequest />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;