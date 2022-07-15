import {Box} from '@mui/material';
import * as React from 'react';
import Overview from './Overview';

export interface IContentLayoutProps {
}

export default function ContentLayout(props: IContentLayoutProps) {
  return (
    <Box>
      <Overview />
    </Box>
  );
}
