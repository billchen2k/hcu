import {Box} from '@mui/material';
import * as React from 'react';
import UniversityOverview from './UniversityOverview';
import Headings from './Headings';
import Legend from './Legend';
import EventSelector from './EventSelector';

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
      <EventSelector />
    </Box>
  );
}
