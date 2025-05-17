import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#f7cad0', // pastel pink
      light: '#fae0e4',
      dark: '#ff9aa2',
    },
    secondary: {
      main: '#b5e5cf', // pastel mint
      light: '#d8f3dc',
      dark: '#95d5b2',
    },
    background: {
      default: '#fff8f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3436',
      secondary: '#636e72',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#2d3436',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#2d3436',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
}); 