import {IUniversityEventConfig, IUniversityTypeConfig, UniversityEventType, UniversityType} from '../types';

const universityTypes: Record<UniversityType, IUniversityTypeConfig> = {
  composite: {
    color: '#4972B8',
    name: '综合类',
    priority: 1,
  },
  normal: {
    color: '#EDA7A2',
    name: '师范 / 语言类',
    priority: 3.5,
  },
  science: {
    color: '#E2CA66',
    name: '理工类',
    priority: 3,
  },
  agriculture: {
    color: '#A6D271',
    name: '农林类',
    priority: 4,
  },
  finance: {
    color: '#06318E',
    name: '财经 / 政法类',
    priority: 5,
  },
  military: {
    color: '#C42A30',
    name: '军事类',
    priority: 6,
  },
  medicine: {
    color: '#B5B5B5',
    name: '医药类',
    priority: 7,
  },
  arts: {
    color: '#E69233',
    name: '民族 / 艺体类',
    priority: 8,
  },
};

const universityEvents: Record<UniversityEventType, IUniversityEventConfig> = {
  'rename': {
    color: '#333333',
    name: '更名',
  },
  'relocation': {
    color: '#ffffff',
    name: '迁址',
  },
  'restructure': {
    color: '#ae2910',
    name: '院校合并',
  },
};


const config = {
  universityTypes,
  universityEvents,
  colors: {
    background: '#fcf7ed',
    universityHover: '#fc5908',
    primaryText: '#0F0A04',
    importantText: '#ae2910',
  },
};

export default config;
