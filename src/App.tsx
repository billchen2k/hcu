import React from 'react';
import {Box, createTheme, CssBaseline, Grid, rgbToHex, ThemeProvider, Typography} from '@mui/material';
import './styles/main.scss';
import Sidebar from './components/Sidebar';
import ContentLayout from './components/ContentLayout';

const headingFont = {
  fontFamily: 'FZQingKeBenYueSong, serif, --apple-family',
};
const bodyFont = {
  fontFamily: 'FZCuSong, serif, --apple-family',
};

const theme = createTheme({
  palette: {
    background: {
      default: rgbToHex('rgb(252, 249, 236)'),
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
        <Box sx={{p: 2, display: 'flex'}}>
          <Box sx={{display: 'flex', width: 400}}>
            <Sidebar />
          </Box>
          <Box sx={{display: 'flex', flex: 1, ml: 2}}>
            <ContentLayout />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
