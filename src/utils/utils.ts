import * as d3 from 'd3';
import {UniversityManagerType} from '../types';

export const getUniversityManageSymbol = (manager: UniversityManagerType) => {
  switch (manager) {
    case 'central':
      return d3.symbol().type(d3.symbolCross).size(10);
    case 'ministry_of_edu':
      return d3.symbol().type(d3.symbolCircle).size(10);
    case 'local':
      return d3.symbol().type(d3.symbolX).size(10);
  }
};
