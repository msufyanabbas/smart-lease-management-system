import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', 
    primary: {
      main: '#2563eb', 
      light: '#60a5fa', 
      dark: '#1e40af',  
    },
    secondary: {
      main: '#6366f1', 
      light: '#a5b4fc',
      dark: '#4f46e5',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    success: {
      main: '#22c55e', 
    },
    warning: {
      main: '#f59e0b', 
    },
    error: {
      main: '#ef4444', 
    },
    info: {
      main: '#3b82f6', 
    },
    text: {
      primary: '#1f2937', 
      secondary: '#4b5563', 
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          padding: '24px 0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          fontSize: '0.875rem',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e5e7eb',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f3f4f6',
            fontWeight: 600,
            borderBottom: '2px solid #d1d5db',
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableHead-root .MuiTableCell-root': {
            backgroundColor: '#f3f4f6',
            fontWeight: 600,
            color: '#374151',
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: '#f9fafb',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
