import {Box, Grid, Skeleton, Stack, Typography} from '@mui/material';
import * as React from 'react';

export interface ISidebarProps {
}

export default function Sidebar(props: ISidebarProps) {
  return (
    <Stack width={'100%'} height={'100%'} spacing={3}>
      <Grid container justifyContent={'center'}>
        <Typography variant={'h4'}>中国高校历史沿革</Typography>
        <Typography variant={'h5'}>History of Chinese Universities</Typography>
      </Grid>
      <Typography variant={'body1'} textAlign={'justify'}>
        我国大学的历史始于清末的「洋务运动」和后来的「维新运动」，
        在19世纪末、20世纪初成立了大批高校。1950 年代初期，大批原有综合性大学内的院系拆分，重组成为新的高校。
        1990年代开始，大量高校合并，而近年来又有大量院校在各地设立分校。
        以可视化的方式，我们在这里展示中国高校的建校、改名、迁址、合并等历史轨迹。
        数据范围为截至 2022 年的「双一流建设高校」与「双一流建设学科」名单。
      </Typography>
      {/* <Skeleton variant={'rectangular'} width={'100%'} height={100} /> */}
    </Stack>
  );
}
