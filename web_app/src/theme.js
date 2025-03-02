import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
    allVariants: {
      fontFamily: 'Poppins, sans-serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Poppins, sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins, sans-serif',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins, sans-serif',
        },
      },
    },
  },
});

export default theme; 