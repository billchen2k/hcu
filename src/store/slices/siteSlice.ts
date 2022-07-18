import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SortingCriteria, UniversityEventType} from '../../types';

export interface ISiteState {
    sortingCriteria: SortingCriteria;
    firstLoaded: boolean;
    highlightingEvent: UniversityEventType;
}

const initState: ISiteState = {
  sortingCriteria: 'default',
  firstLoaded: false,
  highlightingEvent: 'rename',
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
  },
});

export default siteSlice;
