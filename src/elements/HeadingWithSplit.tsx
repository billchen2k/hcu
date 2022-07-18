import * as React from 'react';
import {Box, Stack, Typography} from '@mui/material';
import config from '../config';

export interface IHeadingWithSplitProps {
  title: string;
  textPosition?: 'start' | 'end'
}

const HeadingWithSplit = (props: IHeadingWithSplitProps) => {
  return (
    <Stack direction={'row'} alignItems={'center'}>
      {props.textPosition === 'end' &&
          <Box sx={{display: 'flex', width: '100%', alignItems: 'center'}}>
            <Box sx={{
              flex: 1,
              height: '1px',
              backgroundColor: config.colors.primaryTint,
              mr: 2,
            }} />
            <Typography variant={'body1'}
              // className={'circle-before'}
            >{props.title}</Typography>
          </Box>
      }
      {props.textPosition !== 'end' &&
        <Box sx={{display: 'flex', width: '100%', alignItems: 'center'}}>
          <Typography variant={'body1'}
            // className={'circle-before'}
          >{props.title}</Typography>
          <Box sx={{
            flex: 1,
            height: '1px',
            backgroundColor: config.colors.primaryTint,
            ml: 2,
          }} />

        </Box>
      }
    </Stack>
  );
};

export default HeadingWithSplit;
