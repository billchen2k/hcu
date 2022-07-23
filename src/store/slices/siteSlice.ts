import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SortingCriteria, UniversityEventType} from '../../types';

export interface ISiteState {
    sortingCriteria: SortingCriteria;
    firstLoaded: boolean;
    highlightingEvent: UniversityEventType;
    language: 'en' | 'zh';
}

const initState: ISiteState = {
  sortingCriteria: 'default',
  firstLoaded: false,
  highlightingEvent: 'rename',
  language: 'zh',
};

export const siteSlice = createSlice({
  name: 'site',
  initialState: initState,
  reducers: {
    setSortingCriteria: (state, action: PayloadAction<SortingCriteria>) => {
      state.sortingCriteria = action.payload;
    },
    setFirstLoaded: (state, action: PayloadAction<boolean>) => {
      state.firstLoaded = action.payload;
    },
    setHighlightingEvent: (state, action: PayloadAction<UniversityEventType>) => {
      state.highlightingEvent = action.payload;
    },
    setLanguage(state, action: PayloadAction<'en' | 'zh'>) {
      state.language = action.payload;
    },
  },
});

export default siteSlice;
