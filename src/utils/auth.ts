import Cookies from 'js-cookie';

import appConfig from '@/config';

const { token } = appConfig;

const TOKEN_KEY = token || '_token_key_';

/**
 * 设置token
 * @param token的值
 */
export function setToken(val: string): void {
  Cookies.set(TOKEN_KEY, val);
}

/**
 * 获取token
 */
export function getToken() {
  return Cookies.get(TOKEN_KEY) || '';
}

/**
 * 移除token
 */
export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}



