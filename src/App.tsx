import React from 'react';
import {Box, createTheme, CssBaseline, Grid, rgbToHex, ThemeProvider, Typography} from '@mui/material';
import './styles/main.scss';
import ContentLayout from './components/ContentLayout';
import config from './config';
import {Provider} from 'react-redux';
import {store} from './store';
import {BrowserRouter} from 'react-router-dom';

const headingFont = {
  fontFamily: 'New York, FZQKBYS, sans-serif, --apple-family',
};
const bodyFont = {
  fontFamily: 'New York, FZQKBYS, FZCS, sans-serif, --apple-family',
};

const theme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
        disableTouchRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
      // Name of the slot
        root: {
        // Some CSS
          borderRadius: 0,
          boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
  palette: {
    background: {
      default: config.colors.background,
    },
    primary: {
      main: config.colors.primaryTint,
    },
    secondary: {
      main: config.colors.secondaryText,
    },
  },
  typography: {
    h1: headingFont,
    h2: headingFont,
    h3: headingFont,
    h4: headingFont,
    h5: headingFont,
    h6: headingFont,
    body1: bodyFont,
    body2: bodyFont,
    caption: bodyFont,
    subtitle1: bodyFont,
    subtitle2: bodyFont,
    button: bodyFont,
  },
});

const App = () => {
  React.useEffect(() => {
    const curs = document.querySelector('.cursor');
    document.addEventListener('mousemove', (e) => {
      const x = e.pageX;
      const y = e.pageY;
      // @ts-ignore
      curs.style.left = (x - 10) + 'px';
      // @ts-ignore
      curs.style.top = (y - 10) + 'px';
    });

    document.addEventListener('mouseleave', (e) => {
      const x = e.pageX;
      const y = e.pageY;
      // @ts-ignore
      curs.style.left = (x - 10) + 'px';
      // @ts-ignore
      curs.style.top = (y - 10) + 'px';
    });
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Box sx={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
          <CssBaseline />
          <Box sx={{display: 'flex', flex: 1}}>
            <ContentLayout />
            <div className={'cursor'} />
          </Box>
        </Box>
      </Provider>
    </ThemeProvider>
  );
};

export default App;
