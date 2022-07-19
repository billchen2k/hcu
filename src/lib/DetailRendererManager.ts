// @ts-nocheck

import {IUniversityDetail, IUniversityDetailFile} from '../types';
import * as d3 from 'd3';
import {arithmeticArray} from '../utils/utils';
import app from '../App';
import config from '../config';

export class DetailRendererManager {
  private svg: SVGSVGElement;
  private data?: IUniversityDetail;
  private yearScaleConfigs: any;
  private xs?: ReturnType<typeof d3.ScaleLinear>[];

  constructor(svg: SVGSVGElement) {
    this.svg = svg;
    this.initConfig();
  }

  public setData(data: IUniversityDetail) {
    this.data = data;
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
              .tickPadding(50),
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
        .attr('cy', (d) => this.scaleY(d))
        .append('text')
        .text((d) => d)
        .attr('font-size', '7px');


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
        .attr('height', 60);

    // 迁址事件
    const relocationMarkerSize = 25;
    const relocationMarkers = g.append('g')
        .selectAll('g')
        .data(data?.events?.filter((d) => d.event == 'relocation'))
        .enter()
        .append('g')
        .attr('id', (d) => `relocation-markers-${d.year}`)
        .attr('transform', (d) => `translate(${this.scaleX(d.year)}, ${this.scaleY(d.year)})`);

    relocationMarkers.append('line')
        .attr('x1', (d) => 0)
        .attr('y1', (d) => 0)
        .attr('x2', (d) => 0)
        .attr('y2', (d) => -50)
        .attr('stroke', config.colors.detailTheme)
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.5);
    relocationMarkers.append('svg:image')
        .attr('xlink:href', '/assets/markers/relocation.svg')
        .attr('x', (d) => -(relocationMarkerSize / 2))
        .attr('y', (d) => -(relocationMarkerSize / 2) - 50)
        .attr('width', relocationMarkerSize)
        .attr('height', relocationMarkerSize);

    // 更名事件
    const renameMarkerSize = 35;
    const renameMarkers = g.append('g')
        .selectAll('g')
        .data(data?.events?.filter((d) => d.event == 'rename'))
        .enter()
        .append('g')
        .attr('id', (d) => `rename-markers-${d.year}`)
        .attr('transform', (d) => `translate(${this.scaleX(d.year)}, ${this.scaleY(d.year)})`);
    renameMarkers.append('line')
        .attr('x1', (d) => 0)
        .attr('y1', (d) => 0)
        .attr('x2', (d) => 0)
        .attr('y2', (d) => 50)
        .attr('stroke', config.colors.detailTheme)
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.5);
    renameMarkers.append('svg:image')
        .attr('xlink:href', '/assets/markers/rename.svg')
        .attr('x', (d) => -(renameMarkerSize / 2))
        .attr('y', (d) => -(renameMarkerSize / 2) + 50)
        .attr('width', renameMarkerSize)
        .attr('height', renameMarkerSize);

    // 渐变
    const detailThemeGradient = g.append('radialGradient')
        .attr('id', 'detail-theme-gradient');
    detailThemeGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', config.colors.detailTheme)
        .attr('stop-opacity', 0.5);
    detailThemeGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', config.colors.detailTheme)
        .attr('stop-opacity', 0.1);

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

    // 院校重组 school-restructure
    const innerCircleBaseRadius = 30;
    const innerCircleStepRadius = 20;
    const entityCircleRadius = 5;
    const schoolRestructureMarkers = g.append('g')
        .selectAll('g')
        .data(data?.events?.filter((d) => d.event == 'school_restructure'))
        .enter()
        .append('g')
        .attr('id', (d) => `school-restructure-markers-${d.year}`)
        .attr('transform', (d) => `translate(${this.scaleX(d.year)}, ${this.scaleY(d.year)})`);

    schoolRestructureMarkers.append('circle')
        .attr('r', (d) => innerCircleBaseRadius + Math.sqrt((d.in_count || 0) * innerCircleStepRadius))
        .attr('fill', 'url(#detail-theme-gradient)');

    // 院系 in
    data?.events?.filter((d) => d.event == 'school_restructure').forEach((d) => {
      const marker = d3.select(`#school-restructure-markers-${d.year}`);
      const inCount = d.in_count || 0;
      if (inCount == 0) {
        return;
      }
      console.log(d);
      const nodes = Array.from({length: inCount + 10}, (_, i) => ({}));
      const simulation = d3.forceSimulation(nodes)
          .force('charge', d3.forceManyBody().strength(-10))
          .force('center', d3.forceCenter(0, 0))
          .force('collide', d3.forceCollide().radius(entityCircleRadius))
          .on('tick', () => {
            marker.selectAll('.in-entity-circle')
                .data(nodes)
                .join('circle')
                .attr('class', 'in-entity-circle')
                .attr('r', entityCircleRadius)
                .attr('fill', 'url(#detail-entity-gradient)')
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y);
          },
          );
    });

    // schoolRestructureMarkers.append('g')
    //     .selectAll('g')
    //     .data((d) => Array.from({length: d.in_count || 0}))
    //     .enter()
    //     .append('circle')
    //     .attr('r', entityCircleRadius)
    //     .attr('fill', 'url(#detail-entity-gradient)');

    // .attr('cx', (d, i) => Math.cos(i / (d.in_count || 0) * 2 * Math.PI) * (innerCircleBaseRadius + Math.sqrt((d.in_count || 0) * innerCircleStepRadius)))
    //   .each((d) => {
    //     const in_count = d.in_count || 0;
    //     const inEntity = schoolRestructureMarkers.append('g')
    //         .selectAll('circle')
    //         .data(Array.from({length: in_count}, (_, i) => i))
    //         .enter()
    //         .append('circle')
    //         .attr('r', entityCircleRadius)
    //         .attr('fill', 'url(#detail-entity-gradient)');
    //
    //     // .call(simulation().force('collide', d3.forceCollide().radius(entityCircleRadius)));
    //     // in_entity_circles.transition()
    //     //     .duration(1000)
    //     //     .attr('cx', (d) => innerCircleBaseRadius + Math.sqrt(in_count * innerCircleStepRadius))
    //     //     .attr('cy', (d) => 0);
    //   },
    //   );

    // 院系 out
  }
}
