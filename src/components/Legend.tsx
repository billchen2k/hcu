import {Box, Button, ButtonGroup, Grid, Stack, Typography} from '@mui/material';
import * as React from 'react';
import config from '../config';
import {IUniversityInfo, SortingCriteria, UniversityType} from '../types';
import legendMain from '../assets/legends/legend.svg';
import legendDetail from '../assets/legends/legend-detail.svg';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import siteSlice from '../store/slices/siteSlice';
import HeadingWithSplit from '../elements/HeadingWithSplit';
import {useMatch} from 'react-router-dom';
import {useRef} from 'react';
import LegendInfoRendererManager from '../lib/LegendInfoRendererManager';
import {stat} from 'fs';


export interface ILegendProps {
}

export default function Legend(props: ILegendProps) {
  const dispatch = useAppDispatch();
  const {sortingCriteria} = useAppSelector((state) => state.site);
  const svgRef = useRef<SVGSVGElement>(null);
  const manager = useRef<LegendInfoRendererManager | null>(null);
  const {university} = useMatch('/:university')?.params || {};

  React.useEffect(() => {
    if (svgRef.current) {
      manager.current = new LegendInfoRendererManager(svgRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (!university || !svgRef.current || !manager.current) {
      return;
    }
    manager.current?.drawInfo(university);
  }, [university]);


  const setSortingCriteria = (criteria: SortingCriteria) => {
    dispatch(siteSlice.actions.setSortingCriteria(criteria));
  };

  const getImageSrc = () => {
    if (university) {
      return legendDetail;
    }
    return legendMain;
  };

  return (
    <Box sx={{display: 'flex', position: 'absolute', bottom: 20, left: 20, width: '23%'}}>
      <Stack spacing={2} width={'100%'}>
        {!university &&
          <React.Fragment>
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
                    onClick={() => setSortingCriteria(criteria as SortingCriteria)}
                    variant={sortingCriteria === criteria ? 'contained' : 'text'}
                  >
                    {{'default': '院校类型', 'manager': '主管部门', 'establishDate': '建校时间'}[criteria]}
                  </Button>
                ))
                }
              </ButtonGroup>
            </Grid>
          </React.Fragment>
        }
        {university && (
          <React.Fragment>
            <HeadingWithSplit title={'高校'} />
          </React.Fragment>
        )}
        <svg ref={svgRef} width={'100%'} height={university ? 150 : 0} />
        <HeadingWithSplit title={'图例'} />
        <img src={getImageSrc()} width={'100%'} height={300} />

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
