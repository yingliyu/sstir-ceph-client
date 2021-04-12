import { AppPost, AppGet } from '@/utils/request';

import { ICheckLoginRequest, ICheckLoginResponse, IGetUserInfoResponse } from './types';

// 登陆
export function checkLogin(data: ICheckLoginRequest) {
  return AppPost<ICheckLoginResponse>('/client/login', data);
}

// 根据token获取用户信息
export function getUserInfoByToken(token: string) {
  return AppGet<IGetUserInfoResponse>('/getUserByToken', { token });
}
