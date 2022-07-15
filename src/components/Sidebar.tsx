import {Box, Grid, Skeleton, Stack, Typography} from '@mui/material';
import * as React from 'react';

export interface ISidebarProps {
}

export default function Sidebar(props: ISidebarProps) {
  return (
    <Stack width={'100%'} height={'100%'} spacing={1}>
      <Grid container justifyContent={'center'}>
        <Typography variant={'h4'}>中国高校历史沿革</Typography>
        <Typography variant={'h5'}>History of Chinese Universities</Typography>
      </Grid>
      <Skeleton variant={'rectangular'} width={'100%'} height={50} />
    </Stack>
  );
}
