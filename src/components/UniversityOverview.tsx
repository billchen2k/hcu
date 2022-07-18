// @ts-nocheck

import * as React from 'react';
import * as d3 from 'd3';
import {Box} from '@mui/material';
import {svg} from 'd3';
import {IUniversityEvent, IUniversityInfo, IUniversityTrendItem, UniversityManagerType} from '../types';
import config from '../config';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import siteSlice from '../store/slices/siteSlice';
import {kernelDensityEstimator, kernelEpanechnikov} from '../utils/utils';
import {OverviewRenderManager} from '../lib/OverviewRenderManager';

const UniInfo: IUniversityInfo[] = require('../data/uni_info.json');
const UniEvent: IUniversityEvent[] = require('../data/uni_event.json');
const UniTrend: Record<string, IUniversityTrendItem[]> = require('../data/uni_trend.json');

export interface IOverviewProps {
}

export default function UniversityOverview(props: IOverviewProps) {
  const dispatch = useAppDispatch();

  const svgRef = React.useRef<SVGSVGElement>(null);

  const hcuLogoTimer = React.useRef<number>(0);
  const hoverSwitchTimer = React.useRef<number>(0);

  const manager = React.useRef<OverviewRenderManager>(null);

  const {sortingCriteria, firstLoaded, highlightingEvent} = useAppSelector((state) => state.site);

  /**
   * Drawing circles.
   */
  // React.useEffect(() => {
  //   // Core drawing code here
  //   // Ref: https://d3-graph-gallery.com/graph/circular_barplot_label.html
  //   const svg = svgRef.current;
  //   if (!svg) {
  //     return;
  //   }
  //   // Global data
  //   let loaded = false;
  //
  //   const width = svg.clientWidth;
  //   const height = svg.clientHeight;
  //   const size = Math.min(width, height) * 0.95;
  //   const paddingAngle = 0.015;
  //   const innerRadius = size * 0.35 / 2;
  //   const outerRadius = size * 0.8 / 2;
  //   const logoRadius = size * 0.12 / 2;
  //   // const marginX = (width - size) / 2;
  //   // const marginY = (height - size) / 2;
  //   let data = [...UniInfo]
  //       .sort((a, b) => {
  //         return config.universityTypes[a.type].priority - config.universityTypes[b.type].priority;
  //       });
  //   // .filter((d) => d.c9);
  //
  //   switch (sortingCriteria) {
  //     case 'default':
  //       break;
  //     case 'manager':
  //       data = data.sort((a, b) => {
  //         return config.universityManagers[a.managerType].priority -
  //           config.universityManagers[b.managerType].priority;
  //       });
  //       break;
  //     case 'establishDate':
  //       data = data.sort((a, b) => {
  //         return a.establishYear - b.establishYear;
  //       });
  //   };
  //
  //
  //   const graph = d3.select(svg)
  //       .html('')
  //       .attr('width', width)
  //       .attr('height', height);
  //
  //   /**
  //    * Center anchor
  //    */
  //   const g = graph.append('g')
  //       .attr('id', 'center-circle')
  //       .attr('transform', `translate(${width / 2}, ${height / 2})`);
  //
  //   // Scales
  //   const x = d3.scaleBand()
  //       .range([0, 1.85 * Math.PI])
  //       .align(0)
  //       .domain(data.map((d) => String(d.name)));
  //
  //   const y = d3.scaleRadial()
  //       .range([outerRadius, innerRadius])
  //       .domain([0, 2022 - 1900]);
  //
  //
  //   // Bars
  //   const arc = d3.arc() // imagine your doing a part of a donut plot
  //       .innerRadius((d) => y(2022 - d['establishYear']))
  //       .outerRadius(outerRadius)
  //       .startAngle((d) => x(d['name']))
  //       .endAngle((d) => x(d['name']) + x.bandwidth())
  //       .padAngle(paddingAngle)
  //       .padRadius(innerRadius);
  //   const arcSvg = g.append('g')
  //       .selectAll('path')
  //       .data(data)
  //       .enter()
  //       .append('path')
  //       .attr('fill', (d) => config.universityTypes[d.type].color)
  //       .attr('opacity', 1)
  //       .style('cursor', (d) => d.c9 ? 'pointer' : 'default');
  //
  //   arcSvg.transition()
  //       .duration(500)
  //       .ease(d3.easeQuadOut)
  //       .delay((d, i) => i * 5)
  //       .attrTween('d', (d, i) => {
  //         const interpolate = d3.interpolate(outerRadius, y(2022 - d['establishYear']));
  //         return (t) => {
  //           arc.innerRadius(interpolate(t));
  //           return arc(d);
  //         };
  //       })
  //       .on('end', (d) => {
  //         setInterval(() => {
  //           loaded = true;
  //         }, 5 * data.length);
  //       });
  //
  //   arcSvg
  //       .on('mouseover', (event, d) => {
  //         onUniversityHover(d);
  //       })
  //       .on('mouseout', (event, d) => {
  //         onUniversityUnhover(d);
  //       });
  //
  //   // Event markers
  //   const eventMarker = g.append('g')
  //       .selectAll('path')
  //       .data(UniEvent.filter((d) => d.event == highlightingEvent))
  //       .enter()
  //       .append('path')
  //       .attr('fill', (d) => config.universityEvents[d.event].color)
  //       .style('opacity', 0.8)
  //       .attr('d', d3.arc()
  //           .innerRadius((d: IUniversityEvent) => y(2022 - d.year))
  //           .outerRadius((d: IUniversityEvent) => y(2022 - d.year) + 3)
  //           .startAngle((d: IUniversityEvent) => x(d.university))
  //           .endAngle((d) => x(d.university) + x.bandwidth())
  //           .padAngle(paddingAngle)
  //           .padRadius(innerRadius),
  //       );
  //
  //
  //   const isRightHalf = (d: IUniversityInfo) => {
  //     return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI;
  //   };
  //
  //   // Labels
  //   const labels = g.append('g')
  //       .selectAll('g')
  //       .data(data)
  //       .enter()
  //       .append('g')
  //       .attr('text-anchor', (d) => isRightHalf(d) ? 'end' : 'start')
  //       .attr('transform', (d) =>
  //         `rotate(${(x(d.name) + x.bandwidth() / 2) * 180 / Math.PI - 90}) translate(${outerRadius + 10}, ${isRightHalf(d) ? -2 : 2})`)
  //       .append('text')
  //       .text((d) => d['name'])
  //       .attr('transform', function(d) {
  //         return isRightHalf(d) ? 'rotate(180)' : 'rotate(0)';
  //       })
  //       .style('font-size', '10px')
  //       .style('font-family', (d) => d.c9 ? 'FZCS, sans-serif' : 'FZQKBYS, sans-serif')
  //       .attr('fill', (d) => d.c9 ? config.colors.importantText : config.colors.primaryText)
  //       .attr('alignment-baseline', 'middle');
  //   labels.attr('opacity', 0.05)
  //       .transition()
  //       .delay((d, i) => i * 5)
  //       .duration(1000)
  //       .attr('opacity', 1);
  //   labels
  //       .on('mouseover', (event, d) => {
  //         onUniversityHover(d);
  //       })
  //       .on('mouseout', (event, d) => {
  //         onUniversityUnhover(d);
  //       });
  //
  //   const getUniversityManageSymbol = (manager: UniversityManagerType) => {
  //     switch (manager) {
  //       case 'central':
  //         return d3.symbol().type(d3.symbolCross).size(20);
  //       case 'ministry_of_edu':
  //         return d3.symbol().type(d3.symbolCircle).size(20);
  //       case 'local':
  //         return d3.symbol().type(d3.symbolAsterisk).size(20);
  //     }
  //   };
  //
  //   // Managers
  //   ['ministry_of_edu', 'central', 'local'].forEach((manager: UniversityManagerType) => {
  //     g.append('g')
  //         .selectAll('path')
  //         .data(UniInfo.filter((d) => d.managerType == manager))
  //         .enter()
  //         .append('path')
  //         .attr('id', (d) => `manager-{d.name}`)
  //         .attr('d', getUniversityManageSymbol(manager))
  //         // .attr('fill', (d) => config.universityTypes[d.type].color)
  //         .attr('fill', config.colors.managerMarkers)
  //         .attr('transform', (d) =>
  //           `rotate(${(x(d.name) + x.bandwidth() / 2) * 180 / Math.PI - 90}) translate(${outerRadius + 5}, 0)`);
  //   });
  //
  //   // Center detail
  //   const detail = g.append('g')
  //       .attr('id', 'center-detail');
  //
  //   const logo = detail.append('svg:image')
  //       .attr('id', 'center-detail-logo')
  //       .attr('x', -logoRadius)
  //       .attr('y', -logoRadius)
  //       .attr('width', logoRadius * 2)
  //       .attr('height', logoRadius * 2)
  //       .style('opacity', 0);
  //   // .style('filter', 'saturate(0)')
  //
  //   const hcuLogo = detail.append('svg:image')
  //       .attr('id', 'center-detail-logo')
  //       .attr('x', -logoRadius * 1.5)
  //       .attr('y', -logoRadius * 1.5)
  //       .attr('width', logoRadius * 2 * 1.5)
  //       .attr('height', logoRadius * 2 * 1.5)
  //       .attr('href', '/assets/hcu.png');
  //
  //   const universityName = detail.append('text')
  //       .attr('id', 'center-detail-university-name')
  //       .attr('x', 0)
  //       .attr('y', -logoRadius * 1.5)
  //       .style('font-size', '14px')
  //       .style('font-family', 'FZCS, FZQKBYS, sans-serif')
  //       .attr('fill', config.colors.primaryText)
  //       .attr('alignment-baseline', 'middle')
  //       .attr('text-anchor', 'middle')
  //       .text('');
  //
  //   // 3 lines of text can be displayed here
  //   const universityDetails = detail.append('g')
  //       .selectAll('g')
  //       .data(['', '', ''])
  //       .enter()
  //       .append('text')
  //       .attr('id', (d, i) => `center-detail-university-detail-${i + 1}`)
  //       .attr('x', 0)
  //       .attr('y', (d, i) => logoRadius * 1.5 + i * 20)
  //       .style('font-size', '12px')
  //       .style('font-family', 'FZQKBYS, sans-serif, --apple-system, BlinkMacSystemFont')
  //       .attr('fill', config.colors.primaryText)
  //       .attr('alignment-baseline', 'middle')
  //       .attr('text-anchor', 'middle')
  //       .text((d) => d);
  //
  //
  //   // Year Scales
  //   const years = [1900, 1949, 1990, 2022];
  //   const yearScale = g.append('g')
  //       .selectAll('g')
  //       .data(years)
  //       .enter().append('g');
  //   yearScale.append('circle')
  //       .attr('fill', 'none')
  //       .attr('stroke', '#ccc')
  //       .attr('stroke-width', '1px')
  //       .attr('opacity', 0.5)
  //       .attr('r', (d) => y(2022 - d))
  //       .attr('style', 'stroke-dasharray: 5, 5;')
  //       .attr('filter', 'drop-shadow(0px 10px 10px rgba(0, 0, 0, 0.9))');
  //   yearScale.append('text')
  //       .attr('y', (d) => -y(2022 - d) + 4)
  //       .attr('fill', '#aaa')
  //       .attr('text-anchor', 'middle')
  //       .attr('transform', (d) =>
  //         `rotate(${-15})`)
  //       .text((d) => d)
  //       .style('font-size', '13px')
  //       .style('font-family', 'FZQKBYS');
  //
  //   if (!firstLoaded) {
  //     // Initial transition
  //     g.transition()
  //         .ease(d3.easeQuadOut)
  //         .duration(3000)
  //         .attrTween('transform', () => {
  //           const scaleInterp = d3.interpolate(0.9, 1);
  //           const rotateInterp = d3.interpolate(10, 0);
  //           return (t) => `translate(${width / 2}, ${height / 2}) scale(${scaleInterp(t)}) rotate(${rotateInterp(t)})`;
  //         });
  //     dispatch(siteSlice.actions.setFirstLoaded(true));
  //   }
  //
  //   const onUniversityHover = (d: IUniversityInfo) => {
  //     if (!loaded) {
  //       return;
  //     }
  //     labels
  //         .transition()
  //         .duration(200)
  //         .style('opacity', (d2) => d2.name === d.name ? 1 : 0.5);
  //     arcSvg
  //         .transition()
  //         .duration(200)
  //         .style('opacity', (d2) => d2.name === d.name ? 1 : 0.5);
  //     arcSvg.filter((d2) => d2.name === d.name)
  //         .attr('fill', config.colors.universityHover);
  //     hcuLogo.attr('opacity', 0);
  //     if (hcuLogoTimer.current) {
  //       clearTimeout(hcuLogoTimer.current);
  //     }
  //     if (hoverSwitchTimer.current) {
  //       clearTimeout(hoverSwitchTimer.current);
  //     }
  //
  //     universityName.text(d.name);
  //     logo.style('opacity', 0.9);
  //     logo.attr('href', `/assets/logo/${d.logo}`);
  //
  //     universityDetails.text((d2, i) => {
  //       const line = [];
  //       d.c9 && line.push('C9');
  //       d[985] && line.push('985');
  //       d[211] && line.push('211');
  //       line.push(`${d.manager}主管`);
  //       switch (i) {
  //         case 0:
  //           return `建校于 ${d.establishYear} 年`;
  //         case 1:
  //           return line.join(' · ');
  //         case 2:
  //           return `${d.location}`;
  //       }
  //       ;
  //     });
  //   };
  //
  //   const onUniversityUnhover = (d: IUniversityInfo) => {
  //     if (!loaded) {
  //       return;
  //     }
  //
  //     labels
  //         .transition()
  //         .duration(200)
  //         .style('opacity', 1);
  //     arcSvg
  //         .transition()
  //         .duration(200)
  //         .style('opacity', 1);
  //     arcSvg.filter((d2) => d2.name === d.name)
  //         .attr('fill', config.universityTypes[d.type].color);
  //
  //     hoverSwitchTimer.current = setTimeout(() => {
  //       universityName.text('');
  //       logo.style('opacity', 0);
  //       universityDetails.text('');
  //     }, 200);
  //
  //     hcuLogoTimer.current = setTimeout(() => {
  //       hcuLogo.transition()
  //           .duration(100)
  //           .attr('opacity', 1);
  //     }, 1000);
  //   };
  // }, [svg, sortingCriteria, highlightingEvent]);

  // React.useEffect(() => {
  //   const svg = svgRef.current;
  //   if (!svg) {
  //     return;
  //   }
  //
  //   const fillPaddingData = (d: IUniversityTrendItem[]) : IUniversityTrendItem[] => {
  //     for (let i = 1893; i <= 2022; i++) {
  //       if (!d.find((d2) => d2.year === i)) {
  //         d.push({
  //           year: i,
  //           establish: 0,
  //           rename: 0,
  //           relocation: 0,
  //           restructure: 0,
  //         });
  //       }
  //     }
  //     return d;
  //   };
  //
  //   const width = svg.clientWidth * 0.2;
  //   const height = svg.clientHeight * 0.84;
  //   const margin = {
  //     top: 120,
  //     right: 60,
  //   };
  //   const data = fillPaddingData(UniTrend['all']);
  //
  //
  //   const trendSvg = d3.select(svg)
  //       .append('g')
  //       .attr('id', 'right-density')
  //       .attr('width', width)
  //       .attr('height', height)
  //       .attr('transform', `translate(${svg.clientWidth - width - margin.right}, ${margin.top})`);
  //
  //   const x = d3.scaleLinear()
  //       .domain([1893, 2022])
  //       .range([0, height]);
  //
  //   const y = d3.scaleSqrt()
  //       .domain([60, 0])
  //       .range([0, width]);
  //
  //   // Add vertical axis
  //   trendSvg.append('g')
  //       .attr('transform', `translate(${width}, 0)`)
  //       .call(d3.axisRight(x)
  //           .tickFormat((d) => d)
  //           .tickSize(5),
  //       )
  //       .style('font-size', '12px')
  //       .style('font-family', 'FZQKBYS, sans-serif, --apple-system, BlinkMacSystemFont');
  //
  //   // Add horizontal axis
  //   trendSvg.append('g')
  //       .attr('transform', `translate(${0}, ${height})`)
  //       .call(d3.axisBottom(y)
  //           .tickFormat((d) => d)
  //           .tickSize(5))
  //       .style('font-size', '12px')
  //       .style('font-family', 'FZQKBYS, sans-serif, --apple-system, BlinkMacSystemFont');
  //
  //   trendSvg.append('g')
  //       .attr('transform', `translate(0, ${height})`)
  //       .attr('class', 'grid')
  //       .call(d3.axisBottom(y)
  //           .tickFormat('')
  //           .tickSize(-height),
  //       );
  //
  //   const areas = trendSvg.append('g');
  //   ['rename', 'relocation', 'restructure'].forEach((type) => {
  //     areas.append('path')
  //         .datum(data)
  //         .attr('fill', config.universityEvents[type].trendColor)
  //         .attr('stroke', config.universityEvents[type].trendColor)
  //         .attr('stroke-width', 1.5)
  //         .attr('stroke-opacity', 0.8)
  //         .attr('fill-opacity', 0.4)
  //         .attr('d', d3.area()
  //             .curve(d3.curveMonotoneY)
  //             .y((d) => x(d.year))
  //             .x0(y(0))
  //             .x1((d) => y(d[type])),
  //         );
  //   });
  // }, [sortingCriteria]);


  React.useEffect(() => {
    if (!svgRef.current) {
      return;
    }
    manager.current = new OverviewRenderManager(svgRef.current);
    manager.current.setData(
        UniInfo,
        UniEvent,
        UniTrend,
    );
    manager.current && manager.current.drawCircle(sortingCriteria);
  }, []);

  React.useEffect(() => {
    manager.current && manager.current.drawCircle(sortingCriteria);
    manager.current && manager.current.drawEventMarks(highlightingEvent);
  }, [sortingCriteria]);

  React.useEffect(() => {
    manager.current && manager.current.drawEventMarks(highlightingEvent);
    manager.current && manager.current.drawTrends('all', highlightingEvent);
  }, [highlightingEvent]);


  return (
    <Box sx={{display: 'flex', position: 'absolute'}} width={'100%'} height={'97vh'}>
      <svg id={'container-overview'} ref={svgRef} className={'container-overview-svg'}/>
    </Box>
  );
}

