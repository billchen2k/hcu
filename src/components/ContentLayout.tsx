import {Box, Link} from '@mui/material';
import * as React from 'react';
import UniversityOverview from './UniversityOverview';
import Headings from './Headings';
import Legend from './Legend';
import EventSelector from './EventSelector';
import UniversityDetail from './UniversityDetail';
import {Route, Routes} from 'react-router-dom';

export interface IContentLayoutProps {
}

export default function ContentLayout(props: IContentLayoutProps) {
  return (
    <Box
      id={'container-main'}
      sx={{'width': '100%'}}>
      <Routes>
        <Route path={'/'} element={
          <React.Fragment>
            <UniversityOverview />
            <EventSelector />
          </React.Fragment>
        } />
        <Route path={'/:university'} element={<UniversityDetail/>}/>
      </Routes>
      <Legend />
      <Headings />
    </Box>
  );
}
