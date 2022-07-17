import {Box} from '@mui/material';
import * as React from 'react';

export interface ILegendProps {
}

export default function Legend(props: ILegendProps) {
  return (
    <Box sx={{display: 'flex', position: 'absolute', bottom: 10, left: 10}}>
      Legend.
    </Box>
  );
}
