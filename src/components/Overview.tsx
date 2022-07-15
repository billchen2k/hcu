// @ts-nocheck

import * as React from 'react';
import * as d3 from 'd3';
import UniInfo from '../data/uni_info.json';
import {Box} from '@mui/material';
import {svg} from 'd3';
import {IUniversityInfo} from '../types';
import config from '../config';
export interface IOverviewProps {
}

export default function Overview(props: IOverviewProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    // Core drawing code here
    // Ref: https://d3-graph-gallery.com/graph/circular_barplot_label.html
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const size = Math.min(width, height) * 0.95;
    const innerRadius = size * 0.4 / 2;
    const outerRadius = size * 1 / 2;
    // const marginX = (width - size) / 2;
    // const marginY = (height - size) / 2;
    const data = UniInfo
        .sort((a, b) => config.universityTypes[a.type].priority - config.universityTypes[b.type].priority);
    // .filter((d) => d.c9);

    const graph = d3.select(svg)
        .html('')
        .attr('width', width)
        .attr('hesght', height);


    const g = graph.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);


    // Scales
    const x = d3.scaleBand()
        .range([0, 1.8 * Math.PI])
        .align(0)
        .domain(data.map((d) => String(d.name)));

    const y = d3.scaleRadial()
        .range([innerRadius, outerRadius])
        .domain([0, 2022 - 1800]);


    // Bars

    const arc = d3.arc() // imagine your doing a part of a donut plot
        .innerRadius(innerRadius)
        .outerRadius((d) => y(2022 - d['establishYear']))
        .startAngle((d) => x(d['name']))
        .endAngle((d) => x(d['name']) + x.bandwidth())
        .padAngle(0.02)
        .padRadius(innerRadius);
    g.append('g')
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('fill', (d) => config.universityTypes[d.type].color)
        .transition()
        .duration(1000)
        .ease(d3.easeQuadOut)
        .delay((d, i) => i * 6)
        .attrTween('d', (d, i) => {
          const interpolate = d3.interpolate(innerRadius, y(2022 - d['establishYear']));
          return (t) => {
            arc.outerRadius(interpolate(t));
            return arc(d);
          };
        });


    const isRightHalf = (d: IUniversityInfo) => {
      return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI;
    };

    // Labels
    g.append('g')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('text-anchor', (d) => isRightHalf(d) ? 'end' : 'start')
        .attr('transform', (d) =>
          `rotate(${(x(d.name) + x.bandwidth() / 2) * 180 / Math.PI - 90}) translate(${y(2022 - d.establishYear) + 5}, ${isRightHalf(d) ? -2 : 2})`)
        .append('text')
        .text((d) =>d['name'])
        .attr('transform', function(d) {
          return isRightHalf(d) ? 'rotate(180)' : 'rotate(0)';
        })
        .style('font-size', '10px')
        .style('font-family', 'FZQKBYS')
        .attr('alignment-baseline', 'middle')
        .attr('opacity', 0.05)
        .transition()
        .delay((d, i) => i * 5)
        .duration(1000)
        .attr('opacity', 1);


    // Year Scales
    const years = [1800, 1900, 1950, 1990, 2022];
    const yearScale = g.append('g')
        .selectAll('g')
        .data(years)
        .enter().append('g');
    yearScale.append('circle')
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-width', '1px')
        .attr('opacity', 0.5)
        .attr('r', (d) => y(2022 - d))
        .attr('style', 'stroke-dasharray: 5, 5;');
    yearScale.append('text')
        .attr('y', (d) => -y(2022 - d) + 4)
        .attr('fill', '#aaa')
        .attr('text-anchor', 'middle')
        .attr('transform', (d) =>
          `rotate(${-18})`)
        .text((d) => d == 1800 ? '976' : d)
        .style('font-size', '13px')
        .style('font-family', 'FZQKBYS');

    g.transition()
        .ease(d3.easeQuadOut)
        .duration(3000)
        .attrTween('transform', () => {
          const interpolate = d3.interpolate(0.9, 1);
          return (t) => `translate(${width / 2}, ${height / 2}) scale(${interpolate(t)})`;
        });
  }, [svg]);

  return (
    <Box sx={{display: 'flex'}} width={'100%'} height={'97vh'}>
      <svg ref={svgRef} className={'container-overview-svg'}/>
    </Box>
  );
}

