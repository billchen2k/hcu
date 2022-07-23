import * as React from 'react';
import {Box, Grid, IconButton, Typography} from '@mui/material';
import {matchPath, useLocation, useMatch, useNavigate, useParams} from 'react-router-dom';
import {ChevronLeft, Close} from '@mui/icons-material';
import hcuHeading from '../assets/hcu-heading-v6.png';
import {useTranslation} from 'react-i18next';

export interface IHeadingsProps {
}

const Headings = (props: IHeadingsProps) => {
  const {university} = useMatch('/:university')?.params || {};
  const {t, i18n} = useTranslation();
  const navigate = useNavigate();

  const navigateBack = () => {
    navigate('/');
  };

  return (
    <Box sx={{position: 'absolute', width: '23%', top: 20, left: 20}}>
      {university &&
        <Box sx={{position: 'absolute', top: 10, right: -80}}>
          <IconButton size={'large'} sx={{border: '1px solid #888'}}
            onClick={() => navigateBack()}
          >
            <Close />
          </IconButton>
        </Box>
      }
      <Grid container justifyContent={'flex-start'} sx={{mb: 2}}>
        {/*<Typography variant={'h4'}>中国高校历史沿革</Typography>*/}
        {/*<Typography variant={'h6'}>History of Chinese Uniaversities</Typography>*/}
        <img src={hcuHeading} width={'100%'} alt={'中国高校历史沿革'} />
      </Grid>
      <Typography variant={'body1'} textAlign={'justify'}>
        {t('intro-text')}
      </Typography>
    </Box>
  );
};

export default Headings;
