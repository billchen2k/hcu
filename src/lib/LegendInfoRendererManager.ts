// @ts-nocheck

import * as d3 from 'd3';
import {IUniversityInfo} from '../types';
import config from '../config';
const UniInfo: IUniversityInfo[] = require('../data/uni_info.json');

export default class LegendInfoRendererManager {
  private svg: SVGSVGElement;

  constructor(svg: SVGSVGElement) {
    this.svg = svg;
  }

  drawInfo(university: string) {
    const data = UniInfo.filter((uni) => uni.englishName.toLowerCase() === university);
    if (data.length === 0) {
      return;
    }
    const d = data[0];

    const width = this.svg.clientWidth;
    const height = this.svg.clientHeight;
    const logoRadius = height * 0.6 * 0.5;
    const margin = {
      left: 10,
      top: 40,
      center: 30,
    };
    const fontSizeLarge = 16;
    const fontSizeSmall = 14;

    if (!d3.select('#legend-side-info').empty()) {
      d3.select('#legend-side-info').remove();
    }
    const g = d3.select(this.svg)
        .append('g')
        .attr('id', 'legend-side-info');


    const logo = g.append('svg:image')
        .attr('id', 'center-detail-logo')
        .attr('x', margin.left)
        .attr('y', height / 2 - logoRadius)
        .attr('width', logoRadius * 2)
        .attr('height', logoRadius * 2)
        .attr('href', `/assets/logo/${d.logo!}`)
        .style('opacity', 1);

    const universityName = g.append('text')
        .attr('x', margin.left + logoRadius * 2 + margin.center * 2)
        .attr('y', margin.top)
        .style('font-size', `${fontSizeLarge}px`)
        .style('font-family', 'FZCS, FZQKBYS, sans-serif')
        .attr('fill', config.colors.primaryText)
        .attr('alignment-baseline', 'top')
        .attr('text-anchor', 'left')
        .text(d.name);


    // Split line

    g.append('svg:image')
        .attr('id', 'center-detail-logo')
        .attr('x', margin.left + logoRadius * 2 + margin.center - 8)
        .attr('y', 10)
        .attr('width', 16)
        .attr('height', height - 20)
        .attr('href', `/assets/split-line-vertical.png`)
        .style('opacity', 1);

    const lines = [`${config.universityTypes[d.type].name} · 建校于 ${d.establishYear} 年`];
    const line = [];
    d.c9 && line.push('C9');
    d[985] && line.push('985');
    d[211] && line.push('211');
    line.push(`${d.manager}主管`);
    lines.push(line.join(' · '));
    lines.push(`${d.location}`);


    const universityDetails = g.append('g')
        .selectAll('g')
        .data(lines)
        .enter()
        .append('text')
        .attr('x', margin.left + logoRadius * 2 + margin.center * 2)
        .attr('y', (d, i) => margin.top + fontSizeLarge * 2.5 + i * fontSizeSmall * 1.8)
        .style('font-size', `${fontSizeSmall}px`)
        .style('font-family', 'FZQKBYS, sans-serif, --apple-system, BlinkMacSystemFont')
        .attr('fill', config.colors.primaryText)
        .attr('alignment-baseline', 'top')
        .attr('text-anchor', 'left')
        .text((d) => d);
  }
}

