import * as React from 'react';
import {svg} from 'd3';
import {Box} from '@mui/material';
import * as d3 from 'd3';
import {useParams} from 'react-router-dom';
import {DetailRendererManager} from '../lib/DetailRendererManager';
import {IUniversityDetailFile} from '../types';
import backgroundDetail from '../assets/bg-detail.png';

const UniDetail: IUniversityDetailFile = require('../data/uni_detail.json');


export interface IUniversityDetailProps {
}

export default function UniversityDetail(props: IUniversityDetailProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const manager = React.useRef<DetailRendererManager | null>(null);
  const {university} = useParams();

  React.useEffect(() => {
    if (!svgRef.current) {
      return;
    }
    const targetKey = Object.keys(UniDetail).find((key) => key.toLowerCase() === university);
    if (!targetKey) {
      return;
    }
    manager.current = new DetailRendererManager(svgRef.current);
    const data = UniDetail[targetKey];
    data.events = data.events.map((event) => {
      event.year = Math.floor(event.year);
      return event;
    });
    manager.current.setData(data);
    manager.current.draw();
  }, []);


  return (
    <Box id={'container-detail'} sx={{display: 'flex', position: 'absolute', right: 0}} width={'75%'} height={'97vh'}>
      <svg ref={svgRef} className={'container-detail-svg'}/>
    </Box>
  );
}
