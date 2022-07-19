// @ts-nocheck

import {
  IUniversityDetail,
  IUniversityDetailEventItem,
  IUniversityDetailFile,
  IUniversityEvent,
  UniversityDetailEventTypes,
} from '../types';
import * as d3 from 'd3';
import {arithmeticArray, chunkSubstring} from '../utils/utils';
import app from '../App';
import config from '../config';

export class DetailRendererManager {
  private svg: SVGSVGElement;
  private data?: IUniversityDetail;
  private yearScaleConfigs: any;
  private xs?: ReturnType<typeof d3.ScaleLinear>[];
  private eventDetailTimer = null;

  private innerCircleBaseRadius?: number;
  private innerCircleStepRadius?: number;
  private entityCircleRadius?: number;
  private eventLineLength?: number;
  private detailUI?: d3.Selection<ElementTagNameMap[string], unknown, null, undefined>;
  private detailEventYear?: d3.Selection<ElementTagNameMap[string], unknown, null, undefined>;
  private detailEventHeading?: d3.Selection<ElementTagNameMap[string], unknown, null, undefined>;
  private detailEventContent?: d3.Selection<ElementTagNameMap[string], unknown, null, undefined>;

  constructor(svg: SVGSVGElement) {
    this.svg = svg;
    this.initConfig();
  }

  private initConfig() {
    this.yearScaleConfigs = [
      {
        domain: [1890, 1950],
        left: [0.104, 0.875],
        top: [0.285, 0.285],
        values: arithmeticArray(1890, 1950, 10),
        secondaryValues: arithmeticArray(1890, 1950, 2),
      },
      {
        domain: [2000, 1950],
        left: [0.265, 0.875],
        top: [0.545, 0.545],
        values: arithmeticArray(1960, 2000, 10),
        secondaryValues: arithmeticArray(1950, 2000, 2),
      },
      {
        domain: [2000, 2020],
        left: [0.265, 0.513],
        top: [0.806, 0.806],
        values: arithmeticArray(2010, 2020, 10),
        secondaryValues: arithmeticArray(2000, 2020, 2),
      },
    ];

    // Three x scales
    this.xs = this.yearScaleConfigs.map((c) => {
      return d3.scaleLinear()
          .domain(c.domain)
          .range(c.left.map((v) => this.svg.clientWidth * v));
    });

    // Circle sizes
    this.innerCircleBaseRadius = 30;
    this.innerCircleStepRadius = 100;
    this.entityCircleRadius = 6;
    this.eventLineLength = 100;
  }

  public setData(data: IUniversityDetail) {
    this.data = data;
  }

  private distance([x1, y1], [x2, y2]) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  private innerCircleRadius(entityCount: number) {
    return this.innerCircleBaseRadius + Math.sqrt(entityCount * this.innerCircleStepRadius);
  }

  private scaleX(year: number) {
    const yearScale = this.xs.find((c) => {
      const domain = [...c.domain()];
      domain.sort();
      return domain[0] <= year && year <= domain[1];
    });
    return yearScale ? yearScale(year) : 0;
  }

  private scaleY(year: number) {
    const yearConfig = this.yearScaleConfigs.find((c) => {
      const domain = [...c.domain];
      domain.sort();
      return domain[0] <= year && year <= domain[1];
    });
    return yearConfig ? this.svg.clientHeight * yearConfig.top[0] : 0;
  }

  private showEventDetail(event: IUniversityDetailEventItem) {
    if (this.eventDetailTimer) {
      clearTimeout(this.eventDetailTimer);
    }
    const eventNameMap: Partial<Record<UniversityDetailEventTypes, string>> = {
      'rename': '更名',
      'establish': '建校',
      'relocation': '迁址',
      'major_restructure': '院系' + [...(event.in_count ? ['迁入'] : []), ...(event.out_count ? ['迁出'] : [])].join('、'),
      'school_restructure': '院校' + [...(event.in_count ? ['迁入'] : []), ...(event.out_count ? ['迁出'] : [])].join('、'),
    };
    let fullContentLine = '';
    let contentLines = [];
    if (event.detail_heading) {
      fullContentLine += event.detail_heading;
    }
    if (event.detail_content) {
      if (typeof event.detail_content === 'string') {
        fullContentLine += event.detail_content;
      } else {
        fullContentLine += event.detail_content.join('；');
      }
    }
    const lines = chunkSubstring(fullContentLine, fullContentLine.length > 100 ? 22 : 17);
    contentLines = contentLines.concat(lines);

    console.log(contentLines);
    this.detailEventYear.text(event.year);
    this.detailEventHeading.text(eventNameMap[event.event]);
    this.detailEventContent.html('');
    this.detailEventContent.selectAll('tspan')
        .data(contentLines)
        .enter()
        .append('tspan')
        .attr('text-anchor', 'end')
        .attr('x', 240)
        .attr('dy', fullContentLine.length > 100 ? '2em' : '2.4em')
        .attr('font-size', fullContentLine.length > 100 ? '13px' : '17px')
        .text((d, i) => d);
    this.detailUI.attr('opacity', 1);
  }

  private hideEventDetail() {
    this.eventDetailTimer = setTimeout(() => {
      this.detailUI.attr('opacity', 0);
    }, 1000);
  }

  public draw() {
    const data = this.data;
    const width = this.svg.clientWidth;
    const height = this.svg.clientHeight;

    if (!d3.select('#svg-detail').empty()) {
      d3.select('#svg-detail').remove();
    }
    const g = d3.select(this.svg)
        .append('g')
        .attr('id', 'svg-detail');

    // Add axis

    for (let i = 0; i < this.yearScaleConfigs.length; i++) {
      g.append('g')
          .attr('id', `year-scale-${i}`)
          .attr('class', 'year-scale')
          .attr('transform', `translate(${-25}, ${this.yearScaleConfigs[i].top[0] * height - 25})`)
          .call(d3.axisBottom(this.xs[i])
              .tickFormat((d) => d)
              .tickSize(50)
              .tickSizeOuter(0)
              .offset(25)
              .tickValues(this.yearScaleConfigs[i].values)
              .tickPadding(45),
          )
          .style('font-size', '14px')
          .style('font-family', 'New York, FZQKBYS, sans-serif, --apple-system, BlinkMacSystemFont');

      g.append('g')
          .attr('id', `year-scale-small-${i}`)
          .attr('class', 'year-scale')
          .attr('transform', `translate(${-5}, ${this.yearScaleConfigs[i].top[0] * height - 5})`)
          .call(d3.axisBottom(this.xs[i])
              .tickFormat((d) => '')
              .tickSize(10)
              .offset(5)
              .tickValues(this.yearScaleConfigs[i].secondaryValues),
          )
          .style('font-size', '14px')
          .style('font-family', 'New York, FZQKBYS, sans-serif, --apple-system, BlinkMacSystemFont');
    }

    // Add semi-circles
    const axisCircleRadius1 = (this.scaleY(1951) - this.scaleY(1950)) / 2;
    g.append('path')
        .attr('transform', `translate(${this.scaleX(1950)}, ${(this.scaleY(1950) + this.scaleY(1951)) / 2})`)
        .attr('d', d3.arc()
            .outerRadius(axisCircleRadius1)
            .innerRadius(axisCircleRadius1 - 1)
            .startAngle(0)
            .endAngle(Math.PI),
        )
        .attr('fill', config.colors.detailTickSecondary);

    const axisCircleRadius2 = (this.scaleY(2001) - this.scaleY(2000)) / 2;
    g.append('path')
        .attr('transform', `translate(${this.scaleX(2000)}, ${(this.scaleY(2000) + this.scaleY(2001)) / 2})`)
        .attr('d', d3.arc()
            .outerRadius(axisCircleRadius2)
            .innerRadius(axisCircleRadius2 - 1)
            .startAngle(Math.PI)
            .endAngle(2 * Math.PI),
        )
        .attr('fill', config.colors.detailTickSecondary);

    // Debug only
    g.append('g')
        .selectAll('dot')
        .data(arithmeticArray(1900, 2020, 1))
        .join('circle')
        .attr('r', 3)
        .attr('opacity', 0.5)
        .attr('fill', '#000')
        .attr('cx', (d) => this.scaleX(d))
        .attr('cy', (d) => this.scaleY(d) + 10)
        .attr('opacity', 0)
        .transition()
        .ease(d3.easeQuadOut)
        .delay((d, i) => i * 5)
        .duration(300)
        .attr('cy', (d) => this.scaleY(d))
        .attr('opacity', 0.5);


    // 建校事件
    g.append('g')
        .selectAll('image')
        .data(data?.events?.filter((d) => d.event == 'establish'))
        .enter()
        .append('svg:image')
        .attr('xlink:href', '/assets/markers/establish.svg')
        .attr('x', (d) => this.scaleX(d.year) - 30)
        .attr('y', (d) => this.scaleY(d.year) - 30)
        .attr('width', 60)
        .attr('height', 60)
        .on('mouseover', (event, d) => {
          this.showEventDetail(d);
        })
        .on('mouseout', () => {
          this.hideEventDetail();
        })
        .attr('opacity', 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .attr('opacity', 1);


    // 迁址事件
    const relocationMarkerSize = 25;
    const relocationMarkers = g.append('g')
        .selectAll('g')
        .data(data?.events?.filter((d) => d.event == 'relocation'))
        .enter()
        .append('g')
        .attr('id', (d) => `relocation-markers-${d.year}`)
        .attr('transform', (d) => `translate(${this.scaleX(d.year)}, ${this.scaleY(d.year)})`)
        .on('mouseover', (event, d) => {
          this.showEventDetail(d);
        })
        .on('mouseout', () => {
          this.hideEventDetail();
        });


    relocationMarkers.append('line')
        .attr('x1', (d) => 0)
        .attr('y1', (d) => 0)
        .attr('x2', (d) => 0)
        .attr('y2', (d) => -this.eventLineLength)
        .attr('stroke', '#769E74')
        .attr('stroke-width', 2)
        .attr('opacity', 0.6);
    relocationMarkers.append('svg:image')
        .attr('xlink:href', '/assets/markers/relocation.png')
        .attr('x', (d) => -(relocationMarkerSize / 2))
        .attr('y', (d) => -(relocationMarkerSize / 2) - this.eventLineLength)
        .attr('width', relocationMarkerSize)
        .attr('height', relocationMarkerSize);

    relocationMarkers.attr('opacity', 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .attr('opacity', 1);

    // 更名事件
    const renameMarkerSize = 25;
    const renameMarkers = g.append('g')
        .selectAll('g')
        .data(data?.events?.filter((d) => d.event == 'rename'))
        .enter()
        .append('g')
        .attr('id', (d) => `rename-markers-${d.year}`)
        .attr('transform', (d) => `translate(${this.scaleX(d.year)}, ${this.scaleY(d.year)})`)
        .on('mouseover', (event, d) => {
          this.showEventDetail(d);
        })
        .on('mouseout', () => {
          this.hideEventDetail();
        });

    renameMarkers.append('line')
        .attr('x1', (d) => 0)
        .attr('y1', (d) => 0)
        .attr('x2', (d) => 0)
        .attr('y2', (d) => this.eventLineLength)
        .attr('stroke', '#775C8E')
        .attr('stroke-width', 2)
        .attr('opacity', 0.6);
    renameMarkers.append('svg:image')
        .attr('xlink:href', '/assets/markers/rename.png')
        .attr('x', (d) => -(renameMarkerSize / 2))
        .attr('y', (d) => -(renameMarkerSize / 2) + this.eventLineLength)
        .attr('width', renameMarkerSize)
        .attr('height', renameMarkerSize);
    renameMarkers.attr('opacity', 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .attr('opacity', 1);

    // 渐变
    const detailThemeGradient = g.append('radialGradient')
        .attr('id', 'detail-theme-gradient');
    detailThemeGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', config.colors.detailTheme)
        .attr('stop-opacity', 0.45);
    detailThemeGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', config.colors.detailTheme)
        .attr('stop-opacity', 0.05);

    const detailEntityGradient = g.append('radialGradient')
        .attr('id', 'detail-entity-gradient');
    detailEntityGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', config.colors.detailTheme)
        .attr('stop-opacity', 0.9);
    detailEntityGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', config.colors.detailTheme)
        .attr('stop-opacity', 0.6);

    const detailHollowEntityGradient = g.append('radialGradient')
        .attr('id', 'detail-hollow-entity-gradient');
    detailHollowEntityGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', config.colors.detailTheme)
        .attr('stop-opacity', 0);
    detailHollowEntityGradient.append('stop')
        .attr('offset', '80%')
        .attr('stop-color', config.colors.detailTheme)
        .attr('stop-opacity', 0);
    detailHollowEntityGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', config.colors.detailTheme)
        .attr('stop-opacity', 0.6);

    // 院校重组 & 专业重组 school-restructure base circle
    const restructureMarkers = g.append('g')
        .selectAll('g')
        .data(data?.events?.filter((d) => ['school_restructure', 'major_restructure'].includes(d.event)))
        .enter()
        .append('g')
        .attr('id', (d) => `${d.event}-markers-${d.year}`)
        .attr('transform', (d) => `translate(${this.scaleX(d.year)}, ${this.scaleY(d.year)})`)
        .on('mouseover', (event, d) => {
          this.showEventDetail(d);
        })
        .on('mouseout', () => {
          this.hideEventDetail();
        });

    restructureMarkers.append('circle')
        .attr('r', (d) => this.innerCircleRadius(d.in_count || 0))
        .attr('fill', 'url(#detail-theme-gradient)');

    restructureMarkers.attr('opacity', 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .attr('opacity', 1);


    // Force simulations
    data?.events?.filter((d) => ['school_restructure', 'major_restructure'].includes(d.event)).forEach((d) => {
      const marker = d3.select(`#${d.event}-markers-${d.year}`);

      const inCount = d.in_count || 0;
      const outCount = d.out_count || 0;
      const innerCircleRadius = this.innerCircleRadius(inCount);
      const innerBoundRadius = innerCircleRadius - this.entityCircleRadius * 4;
      const outerBoundRadius = innerCircleRadius + this.entityCircleRadius * 4;

      const inNodes = Array.from({length: inCount}, (_, i) => ({}));
      const outNodes = Array.from({length: outCount + 10}, (_, i) => ({}));
      inCount > 0 && d3.forceSimulation(inNodes)
          .force('charge', d3.forceRadial(innerBoundRadius).strength(0.003))
          .force('collide', d3.forceCollide().radius(this.entityCircleRadius * 2).strength(0.1))
          .on('tick', () => {
            marker.selectAll('.in-entity-circle')
                .data(inNodes)
                .join('circle')
                .attr('class', 'in-entity-circle')
                .attr('r', this.entityCircleRadius)
                .attr('fill', `url(#${d.event == 'school_restructure' ? 'detail-entity-gradient' : 'detail-hollow-entity-gradient'})`)
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y);
          },
          );

      outCount > 0 && d3.forceSimulation(outNodes)
          .force('charge', d3.forceRadial(outerBoundRadius).strength(0.1))
          .force('collide', d3.forceCollide().radius(this.entityCircleRadius * 2).strength(0.1))
          .on('tick', () => {
            marker.selectAll('.out-entity-circle')
                .data(outNodes)
                .join('circle')
                .attr('class', 'out-entity-circle')
                .attr('r', this.entityCircleRadius)
                .attr('fill', `url(#${d.event == 'school_restructure' ? 'detail-entity-gradient' : 'detail-hollow-entity-gradient'})`)
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y)
                .on('mouseover', (event, d) => {
                  this.showEventDetail(d);
                })
                .on('mouseout', () => {
                  this.hideEventDetail();
                });
          },
          );
    });

    // Right bottom Detail UI
    const detailUI = g.append('g')
        .attr('id', 'detail-ui')
        .attr('transform', `translate(${width - 550}, ${height - 270})`);

    detailUI.append('rect')
        .attr('fill', config.colors.detailTheme)
        .attr('width', 95)
        .attr('height', 40)
        .attr('x', 290)
        .attr('y', 40);

    this.detailUI = detailUI;

    this.detailEventYear = detailUI.append('text')
        .attr('class', 'detail-ui-year')
        .attr('x', 300)
        .attr('y', 70)
        .attr('fill', '#ffffff');

    this.detailEventHeading = detailUI.append('text')
        .attr('class', 'detail-ui-event-heading')
        .attr('x', 300)
        .attr('y', 130)
        .attr('fill', config.colors.detailTheme);

    this.detailEventContent = detailUI.append('text')
        .attr('id', 'detail-ui-event-description')
        .attr('x', 240)
        .attr('y', 40)
        .attr('font-family', 'FZQKBYS, serif')
        .attr('font-size', '16px');

    detailUI.append('line')
        .attr('x1', 270)
        .attr('y1', 20)
        .attr('x2', 270)
        .attr('y2', 240)
        .attr('stroke', config.colors.detailTheme)
        .attr('stroke-width', 1.5);

    this.detailUI.attr('opacity', 0);

    g.attr('opacity', 0)
        .attr('transform-origin', '50% 50%')
        .transition()
        .ease(d3.easeQuadOut)
        .duration(800)
        .attr('opacity', 1)
        .attrTween('transform', () => {
          const scaleInterp = d3.interpolate(0.9, 1);
          return (t) => `scale(${scaleInterp(t)})`;
        });
  }
}
