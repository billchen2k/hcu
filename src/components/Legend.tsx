import {Box, Button, ButtonGroup, Grid, Stack, Typography} from '@mui/material';
import * as React from 'react';
import config from '../config';
import {SortingCriteria, UniversityType} from '../types';
import legend from '../assets/legend.svg';


export interface ILegendProps {
}

export default function Legend(props: ILegendProps) {
  const [sorting, setSorting] = React.useState<SortingCriteria>('default');

  const HeadingWithSplit = (props: {
    title: string
  }) => (
    <Stack direction={'row'} alignItems={'center'}>
      <Typography variant={'body1'}
        // className={'circle-before'}
      >{props.title}</Typography>
      <Box sx={{
        flex: 1,
        height: '1px',
        backgroundColor: config.colors.primaryTint,
        ml: 2,
      }} />
    </Stack>
  );

  const setSortingCriteria = (criteria: SortingCriteria) => {
    setSorting(criteria);
    window.dispatchEvent(new CustomEvent('sorting-criteria-changed', {
      detail: {
        criteria,
      },
    }));
  };

  return (
    <Box sx={{display: 'flex', position: 'absolute', bottom: 20, left: 20}}>
      <Stack spacing={2}>
        <HeadingWithSplit title={'排序'} />
        <Grid container>
          <ButtonGroup fullWidth={true}
            variant={'text'}
            color={'primary'}
            size={'small'}
            sx={{
              borderRadius: 0,
            }}
          >
            {['default', 'manager', 'establishDate'].map((criteria) => (
              <Button key={criteria}
                onClick={() => setSorting(criteria as SortingCriteria)}
                variant={sorting === criteria ? 'contained' : 'text'}
              >
                {{'default': '院校类型', 'manager': '直属部门', 'establishDate': '建校时间'}[criteria]}
              </Button>
            ))
            }
          </ButtonGroup>
        </Grid>
        <HeadingWithSplit title={'图例'} />
        <img src={legend} width={350} />

        {/* <Grid container width={350}>*/}
        {/*  <Stack width={150} direction={'row'} alignItems={'center'}*/}
        {/*    sx={{mb: 1}}*/}
        {/*  >*/}
        {/*    <Box sx={{*/}
        {/*      width: 8,*/}
        {/*      height: 8,*/}
        {/*      backgroundColor: config.colors.managerMarkers,*/}
        {/*      borderRadius: '50%',*/}
        {/*      mr: 2,*/}
        {/*    }}/>*/}
        {/*    <Typography variant={'body2'}>教育部直属</Typography>*/}

        {/*  </Stack>*/}
        {/*  <Stack width={150} direction={'row'} alignItems={'center'}>*/}
        {/*    <Box sx={{*/}
        {/*      lineHeight: '8px',*/}
        {/*      color: config.colors.managerMarkers,*/}
        {/*      mr: 2,*/}
        {/*    }}>&#43;</Box>*/}
        {/*    <Typography variant={'body2'}>中央部委直属</Typography>*/}
        {/*  </Stack>*/}
        {/* </Grid>*/}

        {/* <Box sx={{*/}
        {/*  width: '100%',*/}
        {/*  height: '1px',*/}
        {/*  backgroundColor: '#868686',*/}
        {/* }} />*/}
        {/* <Grid container width={350}>*/}
        {/*  {Object.keys(config.universityTypes)*/}
        {/*      .sort((a, b) => config.universityTypes[a as UniversityType].priority -*/}
        {/*        config.universityTypes[b as UniversityType].priority)*/}
        {/*      .map((type) => {*/}
        {/*        const typeConfig = config.universityTypes[type as UniversityType];*/}
        {/*        return (<Stack width={150} key={type} direction={'row'} alignItems={'center'}*/}
        {/*          sx={{mb: 1}}*/}
        {/*        >*/}
        {/*          {typeConfig.color && <Box sx={{*/}
        {/*            width: 10,*/}
        {/*            height: 10,*/}
        {/*            backgroundColor: typeConfig.color,*/}
        {/*            borderRadius: '50%',*/}
        {/*            marginRight: 2,*/}
        {/*          }}/>}*/}
        {/*          <Typography variant={'body2'}>{typeConfig.name}</Typography>*/}
        {/*        </Stack>);*/}
        {/*      })*/}
        {/*  }*/}

        {/* </Grid>*/}
      </Stack>
    </Box>
  );
}
