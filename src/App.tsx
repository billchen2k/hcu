import React from 'react';
import {Box, createTheme, CssBaseline, Grid, rgbToHex, ThemeProvider, Typography} from '@mui/material';
import './styles/main.scss';
import ContentLayout from './components/ContentLayout';
import config from './config';

const headingFont = {
  fontFamily: 'New York, FZQKBYS, serif, --apple-family',
};
const bodyFont = {
  fontFamily: 'New York, FZQKBYS, FZCS, serif, --apple-family',
};

const theme = createTheme({
  palette: {
    background: {
      default: config.colors.background,
    },
    primary: {
      main: config.colors.primaryText,
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
        <CssBaseline />
        <Box sx={{display: 'flex', flex: 1}}>
          <ContentLayout />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
