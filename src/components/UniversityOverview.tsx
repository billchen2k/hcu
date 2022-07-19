import * as React from 'react';
import {svg} from 'd3';
import {Box} from '@mui/material';
import {IUniversityEvent, IUniversityInfo, IUniversityTrendItem} from '../types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {OverviewRenderManager} from '../lib/OverviewRenderManager';
import {useNavigate} from 'react-router-dom';

const UniInfo: IUniversityInfo[] = require('../data/uni_info.json');
const UniEvent: IUniversityEvent[] = require('../data/uni_event.json');
const UniTrend: Record<string, IUniversityTrendItem[]> = require('../data/uni_trend.json');

export interface IOverviewProps {
}

export default function UniversityOverview(props: IOverviewProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const svgRef = React.useRef<SVGSVGElement>(null);
  const manager = React.useRef<OverviewRenderManager | null>(null);
  const {sortingCriteria, highlightingEvent} = useAppSelector((state) => state.site);

  React.useEffect(() => {
    if (!svgRef.current) {
      return;
    }
    manager.current = new OverviewRenderManager(svgRef.current, navigate);
    manager.current.setData(
        UniInfo,
        UniEvent,
        UniTrend,
    );
    manager.current.drawCircle(sortingCriteria);
  }, []);

  React.useEffect(() => {
    if (!manager.current) {
      return;
    }
    manager.current.drawCircle(sortingCriteria);
    manager.current.drawEventMarks(highlightingEvent);

    // @ts-ignore
    document.circleLoadFinished = false;
  }, [sortingCriteria]);

  React.useEffect(() => {
    if (!manager.current) {
      return;
    }
    manager.current.drawEventMarks(highlightingEvent);
    manager.current.drawTrends('all', highlightingEvent);
  }, [highlightingEvent]);

  return (
    <Box sx={{display: 'flex', position: 'absolute'}} width={'100%'} height={'97vh'}>
      <svg id={'container-overview'} ref={svgRef} className={'container-overview-svg'}/>
    </Box>
  );
}

