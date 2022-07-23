import {Box, Button, ButtonGroup, Grid, IconButton, Stack} from '@mui/material';
import * as React from 'react';
import {useRef} from 'react';
import {SortingCriteria} from '../types';
import legendRename from '../assets/legends/legend-rename.svg';
import legendRelocation from '../assets/legends/legend-relocation.svg';
import legendRestructure from '../assets/legends/legend-restructure.svg';
import legendDetail from '../assets/legends/legend-detail.png';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import siteSlice from '../store/slices/siteSlice';
import HeadingWithSplit from '../elements/HeadingWithSplit';
import {useMatch} from 'react-router-dom';
import LegendInfoRendererManager from '../lib/LegendInfoRendererManager';
import {Close, GitHub, Translate} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';


export interface ILegendProps {
}

export default function Legend(props: ILegendProps) {
  const dispatch = useAppDispatch();
  const {sortingCriteria, highlightingEvent, language} = useAppSelector((state) => state.site);
  const svgRef = useRef<SVGSVGElement>(null);
  const manager = useRef<LegendInfoRendererManager | null>(null);
  const {t, i18n} = useTranslation();
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

  const toggleLanguage = () => {
    if (language == 'en') {
      i18n.changeLanguage('zh');
      dispatch(siteSlice.actions.setLanguage('zh'));
    } else {
      i18n.changeLanguage('en');
      dispatch(siteSlice.actions.setLanguage('en'));
    }
  };


  const setSortingCriteria = (criteria: SortingCriteria) => {
    dispatch(siteSlice.actions.setSortingCriteria(criteria));
  };

  const getImageSrc = () => {
    if (university) {
      return legendDetail;
    }
    switch (highlightingEvent) {
      case 'rename':
        return legendRename;
      case 'relocation':
        return legendRelocation;
      case 'restructure':
        return legendRestructure;
    }
  };

  return (
    <Box sx={{display: 'flex', position: 'absolute', bottom: 20, left: 20, width: '22%'}}>
      <Stack spacing={2} width={'100%'}>
        {!university &&
          <React.Fragment>
            <HeadingWithSplit title={t('heading-sorting')} />
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
                    {{'default': t('sorting-school-type'), 'manager': t('sorting-manager'), 'establishDate': t('sorting-establish-date')}[criteria]}
                  </Button>
                ))
                }
              </ButtonGroup>
            </Grid>
          </React.Fragment>
        }
        {university && (
          <React.Fragment>
            <HeadingWithSplit title={t('heading-university')} />
          </React.Fragment>
        )}
        <svg ref={svgRef} width={'100%'} height={university ? 150 : 0} />
        <HeadingWithSplit title={t('heading-legend')} />
        <img src={getImageSrc()} style={{maxHeight: 325}} />
        <Box sx={{position: 'absolute', bottom: 10, right: -80}}>
          <Stack spacing={2}>
            <IconButton size={'medium'} sx={{border: '1px solid #888'}}
              onClick={() => window.open('https://github.com/billchen2k/hcu', '__blank')}
            >
              <GitHub width={10} />
            </IconButton>
            <IconButton size={'medium'} sx={{border: '1px solid #888'}}
              onClick={() => toggleLanguage()}
            >
              <Translate width={10} />
            </IconButton>
          </Stack>

        </Box>

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
