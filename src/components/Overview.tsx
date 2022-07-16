// @ts-nocheck

import * as React from 'react';
import * as d3 from 'd3';
import {Box} from '@mui/material';
import {svg} from 'd3';
import {IUniversityEvent, IUniversityInfo} from '../types';
import config from '../config';

const UniInfo: IUniversityInfo[] = require('../data/uni_info.json');
const UniEvent: IUniversityEvent[] = require('../data/uni_event.json');

export interface IOverviewProps {
}

export default function Overview(props: IOverviewProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  const hcuLogoTimer = React.useRef<number>(0);
  const hoverSwitchTimer = React.useRef<number>(0);

  React.useEffect(() => {
    // Core drawing code here
    // Ref: https://d3-graph-gallery.com/graph/circular_barplot_label.html
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    // Global data
    let loaded = false;

    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const size = Math.min(width, height) * 0.95;
    const paddingAngle = 0.015;
    const innerRadius = size * 0.4 / 2;
    const outerRadius = size * 1 / 2;
    const logoRadius = size * 0.12 / 2;
    // const marginX = (width - size) / 2;
    // const marginY = (height - size) / 2;
    const data = UniInfo
        .sort((a, b) => {
          return config.universityTypes[a.type].priority - config.universityTypes[b.type].priority;
        });
    // .filter((d) => d.c9);

    const graph = d3.select(svg)
        .html('')
        .attr('width', width)
        .attr('height', height);


    /**
     * Center anchor
     */
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
        .padAngle(paddingAngle)
        .padRadius(innerRadius);
    const arcSvg = g.append('g')
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('fill', (d) => config.universityTypes[d.type].color)
        .style('cursor', (d) => d.c9 ? 'pointer' : 'default');

    arcSvg.transition()
        .duration(500)
        .ease(d3.easeQuadOut)
        .delay((d, i) => i * 5)
        .attrTween('d', (d, i) => {
          const interpolate = d3.interpolate(innerRadius, y(2022 - d['establishYear']));
          return (t) => {
            arc.outerRadius(interpolate(t));
            return arc(d);
          };
        })
        .on('end', (d) => {
          setInterval(() => {
            loaded = true;
          }, 5 * data.length);
        });

    arcSvg
        .on('mouseover', (event, d) => {
          onUniversityHover(d);
        })
        .on('mouseout', (event, d) => {
          onUniversityUnhover(d);
        });

    // Event markers
    const eventMarker = g.append('g')
        .selectAll('path')
        .data(UniEvent.filter((d) => d.event == 'rename'))
        .enter()
        .append('path')
        .attr('fill', (d) => config.universityEvents[d.event].color)
        .attr('d', d3.arc()
            .innerRadius((d: IUniversityEvent) => y(2022 - d.year))
            .outerRadius((d: IUniversityEvent) => y(2022 - d.year) + 1)
            .startAngle((d: IUniversityEvent) => x(d.university))
            .endAngle((d) => x(d.university) + x.bandwidth())
            .padAngle(paddingAngle)
            .padRadius(innerRadius),
        );


    const isRightHalf = (d: IUniversityInfo) => {
      return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI;
    };

    // Labels
    const labels = g.append('g')
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
        .style('font-size', '9px')
        .style('font-family', (d) => d.c9 ? 'FZCS, sans-serif' : 'FZQKBYS, sans-serif')
        .attr('fill', (d) => d.c9 ? config.colors.importantText : config.colors.primaryText)
        .attr('alignment-baseline', 'middle');
    labels.attr('opacity', 0.05)
        .transition()
        .delay((d, i) => i * 5)
        .duration(1000)
        .attr('opacity', 1);
    labels
        .on('mouseover', (event, d) => {
          onUniversityHover(d);
        })
        .on('mouseout', (event, d) => {
          onUniversityUnhover(d);
        });

    // Center detail
    const detail = g.append('g')
        .attr('id', 'center-detail');

    const logo = detail.append('svg:image')
        .attr('id', 'center-detail-logo')
        .attr('x', -logoRadius)
        .attr('y', -logoRadius)
        .attr('width', logoRadius * 2)
        .attr('height', logoRadius * 2)
        .style('opacity', 0.8)
        // .style('filter', 'saturate(0)')
        .attr('href', '');

    const hcuLogo = detail.append('svg:image')
        .attr('id', 'center-detail-logo')
        .attr('x', -logoRadius * 1.5)
        .attr('y', -logoRadius * 1.5)
        .attr('width', logoRadius * 2 * 1.5)
        .attr('height', logoRadius * 2 * 1.5)
        .attr('href', '/assets/hcu.png');

    const universityName = detail.append('text')
        .attr('id', 'center-detail-university-name')
        .attr('x', 0)
        .attr('y', -logoRadius * 1.5)
        .style('font-size', '14px')
        .style('font-family', 'FZCS, FZQKBYS, sans-serif')
        .attr('fill', config.colors.primaryText)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .text('');

    // 3 lines of text can be displayed here
    const universityDetails = detail.append('g')
        .selectAll('g')
        .data(['', '', ''])
        .enter()
        .append('text')
        .attr('id', (d, i) => `center-detail-university-detail-${i + 1}`)
        .attr('x', 0)
        .attr('y', (d, i) => logoRadius * 1.5 + i * 20)
        .style('font-size', '12px')
        .style('font-family', 'FZQKBYS, sans-serif')
        .attr('fill', config.colors.primaryText)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .text((d) => d);


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
        .attr('style', 'stroke-dasharray: 5, 5;')
        .attr('filter', 'drop-shadow(0px 10px 10px rgba(0, 0, 0, 0.9))');
    yearScale.append('text')
        .attr('y', (d) => -y(2022 - d) + 4)
        .attr('fill', '#aaa')
        .attr('text-anchor', 'middle')
        .attr('transform', (d) =>
          `rotate(${-18})`)
        .text((d) => d == 1800 ? '976' : d)
        .style('font-size', '13px')
        .style('font-family', 'FZQKBYS');

    // Initial transition
    g.transition()
        .ease(d3.easeQuadOut)
        .duration(3000)
        .attrTween('transform', () => {
          const scaleInterp = d3.interpolate(0.9, 1);
          const rotateInterp = d3.interpolate(10, 0);
          return (t) => `translate(${width / 2}, ${height / 2}) scale(${scaleInterp(t)}) rotate(${rotateInterp(t)})`;
        });

    const onUniversityHover = (d: IUniversityInfo) => {
      if (!loaded) {
        return;
      }
      labels
          .transition()
          .duration(200)
          .style('opacity', (d2) => d2.name === d.name ? 1 : 0.5);
      arcSvg
          .transition()
          .duration(200)
          .style('opacity', (d2) => d2.name === d.name ? 1 : 0.5);
      arcSvg.filter((d2) => d2.name === d.name)
          .attr('fill', config.colors.universityHover);
      hcuLogo.attr('opacity', 0);
      if (hcuLogoTimer.current) {
        clearTimeout(hcuLogoTimer.current);
      }
      if (hoverSwitchTimer.current) {
        clearTimeout(hoverSwitchTimer.current);
      }

      universityName.text(d.name);
      console.log(`/assets/logo/${d.logo}`);
      logo.attr('href', `/assets/logo/${d.logo}`);
      universityDetails.text((d2, i) => {
        const line = [];
        d.c9 && line.push('C9');
        d[985] && line.push('985');
        d[211] && line.push('211');
        line.push(`${d.manager}主管`);
        switch (i) {
          case 0:
            return `建校于 ${d.name == '湖南大学' ? 976 : d.establishYear} 年`;
          case 1:
            return line.join(' · ');
          case 2:
            return `${d.location}`;
        };
      });
    };

    const onUniversityUnhover = (d: IUniversityInfo) => {
      if (!loaded) {
        return;
      }

      labels
          .transition()
          .duration(200)
          .style('opacity', 1);
      arcSvg
          .transition()
          .duration(200)
          .style('opacity', 1);
      arcSvg.filter((d2) => d2.name === d.name)
          .attr('fill', config.universityTypes[d.type].color);

      hoverSwitchTimer.current = setTimeout(() => {
        universityName.text('');
        logo.attr('href', null);
        universityDetails.text('');
      }, 200);

      hcuLogoTimer.current = setTimeout(() => {
        hcuLogo.
            transition()
            .duration(400)
            .attr('opacity', 1);
      }, 600);
    };
  }, [svg]);

  return (
    <Box sx={{display: 'flex'}} width={'100%'} height={'97vh'}>
      <svg ref={svgRef} className={'container-overview-svg'}/>
    </Box>
  );
}

