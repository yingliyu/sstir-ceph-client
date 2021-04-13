import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '@/store';
import { getToken, setToken as setTokenInCookie } from '@/utils/auth';
import { appApi } from '@/services';
import { IGetUserInfoResponse } from '@/services/app/types';
import { message } from 'antd';
interface AppState {
  token: string;
  errMsg: string;
  userInfo: IGetUserInfoResponse;
}

const initialState: AppState = {
  token: getToken(),
  errMsg: '',
  userInfo: {
    username: 'lz',
    age: 18,
    gender: 'M'
  }
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers.It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = '';
    },
    setErrMsg: (state, action: PayloadAction<string>) => {
      state.errMsg = action.payload;
    },
    clearErrMsg: (state) => {
      state.errMsg = '';
    },
    setUserInfo: (state, action: PayloadAction<IGetUserInfoResponse>) => {
      state.userInfo = action.payload;
    }
  }
});

export const { setToken, clearToken, setErrMsg, clearErrMsg, setUserInfo } = appSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const checkLogin = (data: any): AppThunk => async (dispatch) => {
  try {
    const token: any = await appApi.checkLogin(data);
    setTokenInCookie(token);
    dispatch(setToken(token));
    message.success('登录成功！3s后自动跳转');
    setTimeout(() => window.open('/admin/dashboard', '_self'), 3000);
  } catch (err) {
    message.error(err);
    console.log(initialState.errMsg, err);
    dispatch(setErrMsg(err || err.toString()));
  }
};

export const getUserInfo = (token: string): AppThunk => async (dispatch) => {
  try {
    const res = await appApi.getUserInfoByToken(token);
    dispatch(setUserInfo(res));
  } catch (err) {
    message.error(initialState.errMsg);
    dispatch(setErrMsg(err || err.toString()));
  }
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectToken = (state: RootState) => state.app.token;
export const selectErrMsg = (state: RootState) => state.app.errMsg;
export const selectUserInfo = (state: RootState) => state.app.userInfo;

export default appSlice.reducer;
