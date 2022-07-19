import {
  IUniversityEventConfig, IUniversityManagerConfig,
  IUniversityTypeConfig,
  UniversityEventType,
  UniversityManagerType,
  UniversityType,
} from '../types';

const universityTypes: Record<UniversityType, IUniversityTypeConfig> = {
  composite: {
    color: '#8397b6', // '#4972B8',
    name: '综合类',
    priority: 1,
  },
  science: {
    color: '#d4c99a',
    name: '理工类',
    priority: 3,
  },
  normal: {
    color: '#cdb8b7', // '#EDA7A2',
    name: '师范 / 语言类',
    priority: 3.5,
  },
  agriculture: {
    color: '#85a686', // '#A6D271',
    name: '农林类',
    priority: 4,
  },
  finance: {
    color: '#a87fb1', // '#06318E',
    name: '财经 / 政法类',
    priority: 5,
  },
  military: {
    color: '#9f5e54', // '#C42A30',
    name: '军事类',
    priority: 6,
  },
  medicine: {
    color: '#b7c1ca', //'#B5B5B5',
    name: '医药类',
    priority: 7,
  },
  arts: {
    color: '#c4a282', // '#E69233',
    name: '民族 / 艺体类',
    priority: 8,
  },
};
const universityEvents: Record<UniversityEventType, IUniversityEventConfig> = {
  'rename': {
    color: '#ffffff',
    name: '更名',
    trendColor: '#87bb65',
  },
  'relocation': {
    color: '#ffffff',
    name: '迁址',
    trendColor: '#57A4B1',
  },
  'restructure': {
    color: '#ffffff',
    name: '院校 / 系所合并',
    trendColor: '#f66e70',
  },
};

const universityManagers: Record<UniversityManagerType, IUniversityManagerConfig> = {
  'central': {
    name: '中央部委直属',
    priority: 2,
  },
  'ministry_of_edu': {
    name: '教育部直属',
    priority: 1,
  },
  'local': {
    name: '地方直属',
    priority: 3,
  },
};

const config = {
  universityTypes,
  universityEvents,
  universityManagers,
  colors: {
    background: '#fcf7ed',
    universityHover: '#fc5908',
    primaryText: '#0F0A04',
    secondaryText: '#c9b707',
    primaryTint: '#66987f',
    importantText: '#ae2910',
    managerMarkers: '#888888',
    inactiveTrend: '#dcdcdc',
    detailTheme: '#0071BC',
    detailTickPrimary: '#555555',
    detailTickSecondary: '#aaaaaa',
  },
};

export default config;
