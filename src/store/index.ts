import {configureStore} from '@reduxjs/toolkit';
import siteSlice from './slices/siteSlice';

export const store = configureStore({
  reducer: {
    site: siteSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
