export function formatByte(b) {
  let kb = b / 1024;
  if (kb >= 1024) {
    let m = kb / 1024;
    if (m >= 1024) {
      let g = m / 1024;
      return g.toFixed(2) + 'G';
    } else {
      return m.toFixed(2) + 'M';
    }
  } else {
    return kb.toFixed(2) + 'K';
  }
}
export const stringToJson = (key: string) => {
  if (localStorage.getItem(key)) {
    return JSON.parse(localStorage.getItem(key));
  }
  return {};
};
// 抽离公共函数处理异步函数
export const promiseWrap = (promise: any) => {
  return promise.then((data: any) => [null, data]).catch((error: any) => [error, null]);
};
// promise优雅的错误处理使用
// const [error3, data3] = await promiseWrap(fetchDataPromise('url3', true));
//   if (error3) {
//     console.log('error3：', error3);
//   }
