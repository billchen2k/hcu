import * as React from 'react';
import {Box, Grid, Typography, Stack, ButtonGroup, Button} from '@mui/material';
import HeadingWithSplit from '../elements/HeadingWithSplit';
import {SortingCriteria, UniversityEventType} from '../types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import config from '../config';
import siteSlice from '../store/slices/siteSlice';
import {useTranslation} from 'react-i18next';

export interface IEventSelectorProps {
}

const EventSelector = (props: IEventSelectorProps) => {
  const dispatch = useAppDispatch();
  const {highlightingEvent} = useAppSelector((state) => state.site);
  const {t, i18n} = useTranslation();
  const eventTypes: UniversityEventType[] = ['rename', 'relocation', 'restructure'];

  const setEventType = (type: UniversityEventType) => {
    dispatch(siteSlice.actions.setHighlightingEvent(type));
  };

  return (
    <Box sx={{position: 'absolute', width: '23%', top: 20, right: 20}}>
      <Stack spacing={2}>
        <HeadingWithSplit title={t('heading-event')} textPosition={'end'}/>
        <ButtonGroup fullWidth={true}
          variant={'text'}
          color={'primary'}
          size={'small'}
          sx={{
            borderRadius: 0,
          }}
        >
          {eventTypes.map((eventType) => (
            <Button key={eventType}
              onClick={() => setEventType(eventType as UniversityEventType)}
              variant={highlightingEvent === eventType ? 'contained' : 'text'}
            >
              {t(`event-${eventType}`)}
            </Button>
          ))
          }
        </ButtonGroup>
      </Stack>
    </Box>
  );
};

export default EventSelector;
