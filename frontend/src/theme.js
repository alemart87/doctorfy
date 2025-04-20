import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bcd4',
      light: '#33c9dc',
      dark: '#008394',
    },
    secondary: {
      main: '#7c4dff',
      light: '#9670ff',
      dark: '#5635b2',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    h3: {
      fontSize: '1.8rem',
      '@media (max-width:600px)': {
        fontSize: '1.6rem',
      },
    },
    h4: {
      fontSize: '1.6rem',
      '@media (max-width:600px)': {
        fontSize: '1.4rem',
      },
    },
    h5: {
      fontSize: '1.4rem',
      '@media (max-width:600px)': {
        fontSize: '1.3rem',
      },
    },
    h6: {
      fontSize: '1.2rem',
      '@media (max-width:600px)': {
        fontSize: '1.15rem',
      },
    },
    body1: {
      fontSize: '1.1rem',
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    body2: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.95rem',
      },
    },
    button: {
      fontSize: '1.1rem',
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1.1rem',
          padding: '8px 16px',
          '@media (max-width:600px)': {
            padding: '10px 20px',
            fontSize: '1rem',
          },
        },
        containedPrimary: {
          boxShadow: '0 4px 6px rgba(33, 150, 243, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 10px rgba(33, 150, 243, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
          },
          backgroundColor: 'rgba(18, 18, 18, 0.8)',
          backdropFilter: 'blur(10px)',
          '@media (max-width:600px)': {
            padding: '16px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem',
          '@media (max-width:600px)': {
            fontSize: '1rem',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '1.1rem',
          '@media (max-width:600px)': {
            fontSize: '1rem',
          },
        },
        secondary: {
          fontSize: '1rem',
          '@media (max-width:600px)': {
            fontSize: '0.9rem',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          '@media (max-width:600px)': {
            margin: '16px',
            width: 'calc(100% - 32px)',
            maxHeight: 'calc(100% - 32px)',
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: '1.5rem',
          '@media (max-width:600px)': {
            fontSize: '1.75rem',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '12px',
            maxWidth: '100%',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingTop: 'env(safe-area-inset-top)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            margin: '8px 0',
            width: '100%',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        container: {
          '@media (max-width:600px)': {
            width: '100%',
            margin: 0,
            padding: '8px',
          },
        },
        item: {
          '@media (max-width:600px)': {
            padding: '8px',
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            height: '64px',
            paddingBottom: 'env(safe-area-inset-bottom)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          '@media (max-width:600px)': {
            width: '100%',
            maxWidth: '320px',
            borderRadius: '0',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingTop: '12px',
            paddingBottom: '12px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            minHeight: '48px',
            fontSize: '1rem',
            padding: '12px 24px',
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            minHeight: '56px',
            paddingLeft: '12px',
            paddingRight: '12px',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '@media (max-width:600px)': {
            overscrollBehavior: 'none',
            WebkitOverflowScrolling: 'touch',
            minHeight: '100vh',
            minHeight: '-webkit-fill-available',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            minHeight: '100vh',
            minHeight: '-webkit-fill-available',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      },
    },
  },
  spacing: (factor) => `${0.8 * factor}rem`,
});

if (window.matchMedia('(display-mode: standalone)').matches) {
  theme.components = {
    ...theme.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '@media (max-width:600px)': {
            overscrollBehavior: 'none',
            WebkitOverflowScrolling: 'touch',
            minHeight: '100vh',
            minHeight: '-webkit-fill-available',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            minHeight: '100vh',
            minHeight: '-webkit-fill-available',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      },
    },
  };
}

export default theme; 