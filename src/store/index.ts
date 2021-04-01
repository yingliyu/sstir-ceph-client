import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import reducer from './modules';

export const store = configureStore({
  reducer: {
    ...reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
