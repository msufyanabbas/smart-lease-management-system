import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Change to 'dark' if you prefer
    primary: {
      main: '#2563eb', // blue-600
      light: '#60a5fa', // blue-400
      dark: '#1e40af',  // blue-800
    },
    secondary: {
      main: '#6366f1', // indigo-500
      light: '#a5b4fc',
      dark: '#4f46e5',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    success: {
      main: '#22c55e', // green-500
    },
    warning: {
      main: '#f59e0b', // amber-500
    },
    error: {
      main: '#ef4444', // red-500
    },
    info: {
      main: '#3b82f6', // blue-500
    },
    text: {
      primary: '#1f2937', // gray-800
      secondary: '#4b5563', // gray-600
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
