import {Box} from '@mui/material';
import * as React from 'react';
import UniversityOverview from './UniversityOverview';
import Headings from './Headings';
import Legend from './Legend';

export interface IContentLayoutProps {
}

export default function ContentLayout(props: IContentLayoutProps) {
  return (
    <Box sx={{'width': '100%',
      '& > div': {
        position: 'absolute',
      },
    }}>
      <UniversityOverview />
      <Legend />
      <Headings />
    </Box>
  );
}
