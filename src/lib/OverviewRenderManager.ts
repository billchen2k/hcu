// @ts-nocheck

import * as d3 from 'd3';
import {
  IUniversityEvent,
  IUniversityInfo,
  IUniversityTrendItem,
  SortingCriteria, UniversityEventType,
  UniversityManagerType,
} from '../types';
import config from '../config';
import {ScaleBand, ScaleRadial} from 'd3';
import {NavigateFunction, useNavigate} from 'react-router-dom';

export class OverviewRenderManager {
  private svg: SVGSVGElement;
  private navigate: ReturnType<typeof useNavigate>;
  private firstLoad: boolean;
  private data?: { trend: Record<string, IUniversityTrendItem[]>; event: IUniversityEvent[]; info: IUniversityInfo[]; };

  private hcuLogoTimer?: NodeJS.Timeout;
  private hoverSwitchTimer?: NodeJS.Timeout;
  private lastDrawnEventType?: string;

  private centerG: d3.Selection;
  private labels: any;
  private arcSvg: any;
  private logo: any;
  private hcuLogo: any;
  private universityName: any;
  private universityDetails: any;
  private circleX?: ScaleBand<string>;
  private circleY?: ScaleRadial<number, number, never>;
  private outerRadius?: number;
  private innerRadius?: number;
  private logoRadius?: number;
  private trendSvg: d3.Selection;

  public constructor(svg: SVGSVGElement, navigate: NavigateFunction) {
    this.svg = svg;
    this.navigate = navigate;
    this.firstLoad = true;
    this.hcuLogoTimer = undefined;
    this.hoverSwitchTimer = undefined;
    this.initConfig();
  }

  private initConfig() {
    this.bar_opacity = 0.9;
    this.width = this.svg.clientWidth;
    this.height = this.svg.clientHeight;
    this.size = Math.min(this.width, this.height) * 0.95;
    this.paddingAngle = 0.015;
    this.innerRadius = this.size * 0.35 / 2;
    this.outerRadius = this.size * 0.8 / 2;
    this.logoRadius = this.size * 0.12 / 2;

    d3.select(this.svg)
        .attr('width', this.width)
        .attr('height', this.height);
  }

  // Feed data
  public setData(info: IUniversityInfo[], event: IUniversityEvent[], trend: Record<string, IUniversityTrendItem[]>) {
    this.data = {info, event, trend};
  }

  private onUniversityHover(d: IUniversityInfo) {
    this.labels
        .transition()
        .duration(200)
        .style('opacity', (d2) => d2.name === d.name ? 1 : 0.5);
    this.arcSvg
        .transition()
        .duration(200)
        .style('opacity', (d2) => d2.name === d.name ? 1 : 0.5);
    this.arcSvg.filter((d2) => d2.name === d.name)
        .attr('fill', config.colors.universityHover);
    this.hcuLogo.attr('opacity', 0);
    if (this.hcuLogoTimer) {
      clearTimeout(this.hcuLogoTimer);
    }
    if (this.hoverSwitchTimer) {
      clearTimeout(this.hoverSwitchTimer);
    }

    this.universityName.text(d.name);
    this.logo.style('opacity', 0.9);
    this.logo.attr('href', `/assets/logo/${d.logo}`);

    this.universityDetails.text((d2, i) => {
      const line = [];
      d.c9 && line.push('C9');
      d[985] && line.push('985');
      d[211] && line.push('211');
      line.push(`${d.manager}主管`);
      switch (i) {
        case 0:
          return `建校于 ${d.establishYear} 年`;
        case 1:
          return line.join(' · ');
        case 2:
          return `${d.location}`;
      }
      ;
    });
    this.drawTrends(d.englishName, this.lastDrawnEventType);
  }

  private onUniversityUnhover(d: IUniversityInfo) {
    this.labels
        .transition()
        .duration(200)
        .style('opacity', 1);
    this.arcSvg
        .transition()
        .duration(200)
        .style('opacity', 1);
    this.arcSvg.filter((d2) => d2.name === d.name)
        .attr('fill', config.universityTypes[d.type].color);

    this.hoverSwitchTimer = setTimeout(() => {
      this.universityName.text('');
      this.logo.style('opacity', 0);
      this.universityDetails.text('');
      this.drawTrends('all', this.lastDrawnEventType);
    }, 200);

    this.hcuLogoTimer = setTimeout(() => {
      this.hcuLogo.transition()
          .duration(100)
          .attr('opacity', 1);
    }, 1000);
  };

  private onUniversityClick(d: IUniversityInfo) {
    if (d.c9 && this.navigate) {
      this.navigate(`/${d.englishName.toLowerCase()}`);
    }
  };

  public drawCircle(sortingCriteria: SortingCriteria) {
    let data = [...this.data.info]
        .sort((a, b) => {
          return config.universityTypes[a.type].priority - config.universityTypes[b.type].priority;
        });

    switch (sortingCriteria) {
      case 'default':
        break;
      case 'manager':
        data = data.sort((a, b) => {
          return config.universityManagers[a.managerType as UniversityManagerType].priority! -
            config.universityManagers[b.managerType as UniversityManagerType].priority!;
        });
        break;
      case 'establishDate':
        data = data.sort((a, b) => {
          return a.establishYear - b.establishYear;
        });
    };

    /**
     * Center anchor
     */
    if (!d3.select('#center-circle').empty()) {
      d3.select('#center-circle').remove();
    }
    const g = d3.select(this.svg).append('g')
        .attr('id', 'center-circle')
        .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

    this.centerG = g;

    // Scales
    const x = d3.scaleBand()
        .range([0, 1.85 * Math.PI])
        .align(0)
        .domain(data.map((d) => String(d.name)));

    const y = d3.scaleRadial()
        .range([this.outerRadius, this.innerRadius])
        .domain([0, 2022 - 1900]);

    this.circleX = x;
    this.circleY = y;

    // Bars
    const arc = d3.arc() // imagine your doing a part of a donut plot
        .innerRadius((d) => y(2022 - d['establishYear']))
        .outerRadius(this.outerRadius)
        .startAngle((d) => x(d['name']))
        .endAngle((d) => x(d['name']) + x.bandwidth())
        .padAngle(this.paddingAngle)
        .padRadius(this.innerRadius);
    this.arcSvg = g.append('g')
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('fill', (d) => config.universityTypes[d.type].color)
        .attr('opacity', 1)
        .style('cursor', (d) => d.c9 ? 'pointer' : 'default');

    this.arcSvg.transition()
        .duration(500)
        .ease(d3.easeQuadOut)
        .delay((d, i) => i * 5)
        .attrTween('d', (d, i) => {
          const interpolate = d3.interpolate(this.outerRadius, y(2022 - d['establishYear']));
          return (t) => {
            arc.innerRadius(interpolate(t));
            return arc(d);
          };
        });


    const isRightHalf = (d: IUniversityInfo) => {
      return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI;
    };

    // Labels
    this.labels = g.append('g')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('text-anchor', (d) => isRightHalf(d) ? 'end' : 'start')
        .attr('transform', (d) =>
          `rotate(${(x(d.name) + x.bandwidth() / 2) * 180 / Math.PI - 90}) translate(${this.outerRadius + 10}, ${isRightHalf(d) ? -2 : 2})`)
        .append('text')
        .text((d) => d['name'])
        .attr('transform', function(d) {
          return isRightHalf(d) ? 'rotate(180)' : 'rotate(0)';
        })
        .style('font-size', '10px')
        .style('font-family', (d) => d.c9 ? 'FZCS, sans-serif' : 'FZQKBYS, sans-serif')
        .attr('fill', (d) => d.c9 ? config.colors.importantText : config.colors.primaryText)
        .attr('alignment-baseline', 'middle');
    this.labels.attr('opacity', 0.05)
        .transition()
        .delay((d, i) => i * 5)
        .duration(1000)
        .attr('opacity', 1);

    setInterval(() => {
      this.labels
          .on('mouseover', (event, d) => {
            this.onUniversityHover(d);
          })
          .on('mouseout', (event, d) => {
            this.onUniversityUnhover(d);
          })
          .on('click', (event, d) => {
            this.onUniversityClick(d);
          });
      this.arcSvg
          .on('mouseover', (event, d) => {
            this.onUniversityHover(d);
          })
          .on('mouseout', (event, d) => {
            this.onUniversityUnhover(d);
          }).on('click', (event, d) => {
            this.onUniversityClick(d);
          });
    }
    , 1000);


    const getUniversityManageSymbol = (manager: UniversityManagerType) => {
      switch (manager) {
        case 'central':
          return d3.symbol().type(d3.symbolCross).size(20);
        case 'ministry_of_edu':
          return d3.symbol().type(d3.symbolCircle).size(20);
        case 'local':
          return d3.symbol().type(d3.symbolAsterisk).size(20);
      }
    };

    // Managers
    ['ministry_of_edu', 'central', 'local'].forEach((manager: UniversityManagerType) => {
      g.append('g')
          .selectAll('path')
          .data(this.data.info.filter((d) => d.managerType == manager))
          .enter()
          .append('path')
          .attr('id', (d) => `manager-{d.name}`)
          .attr('d', getUniversityManageSymbol(manager))
          // .attr('fill', (d) => config.universityTypes[d.type].color)
          .attr('fill', config.colors.managerMarkers)
          .attr('transform', (d) =>
            `rotate(${(x(d.name) + x.bandwidth() / 2) * 180 / Math.PI - 90}) translate(${this.outerRadius + 5}, 0)`);
    });

    // Center detail
    const detail = g.append('g')
        .attr('id', 'center-detail');

    const logo = detail.append('svg:image')
        .attr('id', 'center-detail-logo')
        .attr('x', -this.logoRadius)
        .attr('y', -this.logoRadius)
        .attr('width', this.logoRadius * 2)
        .attr('height', this.logoRadius * 2)
        .style('opacity', 0);
    // .style('filter', 'saturate(0)')

    const hcuLogo = detail.append('svg:image')
        .attr('id', 'center-detail-logo')
        .attr('x', -this.logoRadius * 2)
        .attr('y', -this.logoRadius * 2)
        .attr('width', this.logoRadius * 2 * 2)
        .attr('height', this.logoRadius * 2 * 2)
        .attr('href', '/assets/hcu-v3.png');

    const universityName = detail.append('text')
        .attr('id', 'center-detail-university-name')
        .attr('x', 0)
        .attr('y', -this.logoRadius * 1.5)
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
        .attr('y', (d, i) => this.logoRadius * 1.5 + i * 20)
        .style('font-size', '12px')
        .style('font-family', 'FZQKBYS, sans-serif, --apple-system, BlinkMacSystemFont')
        .attr('fill', config.colors.primaryText)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .text((d) => d);

    this.universityDetails = universityDetails;
    this.universityName = universityName;
    this.logo = logo;
    this.hcuLogo = hcuLogo;

    // Year Scales
    const years = [1900, 1949, 1990, 2022];
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
          `rotate(${-15})`)
        .text((d) => d)
        .style('font-size', '13px')
        .style('font-family', 'FZQKBYS');

    if (this.firstLoad) {
      // Initial transition
      g.transition()
          .ease(d3.easeQuadOut)
          .duration(3000)
          .attrTween('transform', () => {
            const scaleInterp = d3.interpolate(0.9, 1);
            const rotateInterp = d3.interpolate(10, 0);
            return (t) => `translate(${this.width / 2}, ${this.height / 2}) scale(${scaleInterp(t)}) rotate(${rotateInterp(t)})`;
          });
      setTimeout(() => {
        this.firstLoad = false;
      }, 1000);
    }

    // This mask is used to block the hover events while loading.
    const mask = g.append('rect')
        .attr('fill', '#fff')
        .attr('opacity', 0)
        .attr('x', -this.outerRadius * 1.3)
        .attr('y', -this.outerRadius * 1.3)
        .attr('width', this.outerRadius * 3)
        .attr('height', this.outerRadius * 3);

    setInterval(() => {
      mask.remove();
    }
    , 1000);
  }

  public drawEventMarks(highlightingEvent: UniversityEventType) {
    if (!d3.select('#event-marks').empty()) {
      d3.select('#event-marks').remove();
    }
    const eventMarker = this.centerG?.append('g')
        .attr('id', 'event-marks')
        .selectAll('path')
        .data(this.data.event.filter((d) => d.event == highlightingEvent))
        .enter()
        .append('path')
        .attr('fill', (d) => config.universityEvents[d.event].color)
        .attr('d', d3.arc()
            .innerRadius((d: IUniversityEvent) => this.circleY(2022 - d.year))
            .outerRadius((d: IUniversityEvent) => this.circleY(2022 - d.year) + 2.5)
            .startAngle((d: IUniversityEvent) => this.circleX(d.university))
            .endAngle((d) => this.circleX(d.university) + this.circleX.bandwidth())
            .padAngle(this.PADDING_ANGLE)
            .padRadius(this.innerRadius),
        );
    eventMarker
        .attr('opacity', 0)
        .transition()
        .duration(200)
        .delay((d, i) => i * 1.5)
        .attr('opacity', 1);
  }

  private fillPaddingData(d: IUniversityTrendItem[]) : IUniversityTrendItem[] {
    for (let i = 1893; i <= 2022; i++) {
      if (!d.find((d2) => d2.year === i)) {
        d.push({
          year: i,
          establish: 0,
          rename: 0,
          relocation: 0,
          restructure: 0,
        });
      }
    }
    d.sort((a, b) => a.year - b.year);
    return d;
  };

  /**
   * Drawing details. Ref: https://d3-graph-gallery.com/graph/density_double.html
   */
  public drawTrends(scope?: string, highlightingEvent?: UniversityEventType) {
    const width = this.width * 0.2;
    const height = this.height * 0.84;
    const margin = {
      top: 120,
      right: 60,
    };
    const data = this.fillPaddingData(this.data?.trend[scope || 'all']);
    this.lastDrawnEventType = highlightingEvent;

    if (!d3.select('#right-detail').empty()) {
      d3.select('#right-detail').remove();
    }
    const trendSvg = d3.select(this.svg).append('g')
        .attr('id', 'right-detail')
        .attr('width', width)
        .attr('height', height)
        .attr('transform', `translate(${this.svg.clientWidth - width - margin.right}, ${margin.top})`);

    this.trendSvg = trendSvg;

    const x = d3.scaleLinear()
        .domain([1893, 2022])
        .range([0, height]);

    let y;
    if (scope === 'all') {
      y = d3.scaleSqrt()
          .domain([60, 0])
          .range([0, width]);
    } else {
      y = d3.scaleSqrt()
          .domain([8, 0])
          .range([0, width]);
    }

    // Add vertical axis
    trendSvg.append('g')
        .attr('transform', `translate(${width}, 0)`)
        .call(d3.axisRight(x)
            .tickFormat((d) => d)
            .tickSize(5),
        )
        .style('font-size', '12px')
        .style('font-family', 'FZQKBYS, sans-serif, --apple-system, BlinkMacSystemFont');

    // Add horizontal axis
    trendSvg.append('g')
        .attr('transform', `translate(${0}, ${height})`)
        .call(d3.axisBottom(y)
            .tickFormat((d) => d)
            .tickSize(5))
        .style('font-size', '12px')
        .style('font-family', 'FZQKBYS, sans-serif, --apple-system, BlinkMacSystemFont');

    trendSvg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .attr('class', 'grid')
        .call(d3.axisBottom(y)
            .tickFormat('')
            .tickSize(-height),
        );

    const areas = trendSvg.append('g');
    const eventTypes: UniversityEventType[] = ['rename', 'relocation', 'restructure'];
    const orderedEventTypes = eventTypes.filter((t) => t != highlightingEvent);
    orderedEventTypes.push(highlightingEvent);
    orderedEventTypes.forEach((type) => {
      areas.append('path')
          .datum(data)
          .attr('fill',
            type == highlightingEvent ? config.universityEvents[type].trendColor: config.colors.inactiveTrend)
          .attr('stroke',
            type == highlightingEvent ? config.universityEvents[type].trendColor: config.colors.inactiveTrend)
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.8)
          .attr('fill-opacity', 0.4)
          .attr('d', d3.area()
              .curve(d3.curveMonotoneY)
              .y((d) => x(d.year))
              .x0(y(0))
              .x1((d) => y(d[type])),
          );
    });

    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .attr('id', 'trend-tooltip')
        .style('background-color', config.universityEvents[highlightingEvent].trendColor)
        .style('opacity', 0)
        .style('color', 'white');

    const circleMouseOver = (event, d) => {
      tooltip
          .style('opacity', 1);
    };
    const circleMouseMove = (event, d: IUniversityTrendItem) => {
      tooltip
          .html(`${d.year}年，共 ${d[highlightingEvent]} 次`)
          .style('left', `${event.layerX-110}px`)
          .style('top', `${event.layerY}px`);
    };
    const circleMouseLeave = (event, d) => {
      tooltip
          .style('opacity', 0);
    };

    trendSvg.append('g')
        .selectAll('dot')
        .data(data.filter((d) => d[highlightingEvent] > 0))
        .join('circle')
        .attr('cx', (d) => y(d[highlightingEvent]))
        .attr('cy', (d) => x(d.year))
        .attr('r', 4)
        .attr('fill', config.universityEvents[highlightingEvent].trendColor)
        .attr('stroke', config.universityEvents[highlightingEvent].trendColor)
        .attr('stroke-width', 2)
        .attr('fill-opacity', 0.2)
        .attr('stroke-opacity', 0.4)
        .on('mouseover', circleMouseOver)
        .on('mousemove', circleMouseMove)
        .on('mouseleave', circleMouseLeave);
  }
}

