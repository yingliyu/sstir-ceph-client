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

// 抽离公共函数处理异步函数
export const promiseWrap = (promise:any) => {
  return promise
    .then((data:any) => [null, data])
    .catch((error:any) => [error, null])
}
// promise优雅的错误处理使用
// const [error3, data3] = await promiseWrap(fetchDataPromise('url3', true));
//   if (error3) {
//     console.log('error3：', error3);
//   }

// 文件大小自动赋予单位
export function formatByte(b:number) {
  var kb = b / 1024;
  if (kb >= 1024) {
    var m = kb / 1024;
    if (m >= 1024) {
      var g = m / 1024;
      return g.toFixed(2) + 'G';
    } else {
      return m.toFixed(2) + 'M';
    }
  } else {
    return kb.toFixed(2) + 'K';
  }
}