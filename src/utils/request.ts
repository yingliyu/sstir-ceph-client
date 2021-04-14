import instance from './axios';
import qs from 'qs';
import { message } from 'antd';

// GET请求
export function AppGet<T>(url: string, data?: any) {
  return new Promise<T>((resolve, reject) => {
    instance
      .get(url, {
        params: {
          ...data
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { indices: false });
        }
      })
      .then((res) => {
        const {code,data,msg} = res.data
        if (code === 200) {
          resolve(data as T);
        }else if(code===401){
          message.warning('您还没有登录，请登陆后重试！')
        }  else {
          reject(msg);
        }
      })
      .catch((err) => {
        // if (err.toString() === 'Error: Request failed with status code 400') {
        //   window.location.href = '/pub/403';
        // }
        reject(err.toString());
      });
  });
}
// DELETE
export function AppDelete<T>(url: string, data?: any) {
  return new Promise<T>((resolve, reject) => {
    instance
      .delete(url, {
        data: {
          ...data
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { indices: false });
        }
      })
      .then((res) => {
        const {code,data,msg} = res.data
        if (code === 200) {
          resolve(data as T);
        }else if(code===401){
          message.warning('您还没有登录，请登陆后重试！')
        }  else {
          reject(msg);
        }
      })
      .catch((err) => {
        // if (err.toString() === 'Error: Request failed with status code 400') {
        //   window.location.href = '/pub/403';
        // }
        reject(err.toString());
      });
  });
}
// POST请求
export function AppPost<T>(url: string, data?: any) {
  return new Promise<T>((resolve, reject) => {
    instance
      .post(url, data)
      .then((res) => {
        const {code,data,msg} = res.data
        if (code === 200) {
          resolve(data as T);
        }else if(code===401){
          message.warning('您还没有登录，请登陆后重试！')
        }  else {
          reject(msg);
        }
      })
      .catch((err) => {
        reject(err.toString());
      });
  });
}

export function AppPut<T>(url: string, data?: any) {
  return new Promise<T>((resolve, reject) => {
    instance
      .put(url, data)
      .then((res) => {
        const {code,data,msg} = res.data
        if (code === 200) {
          resolve(data as T);
        }else if(code===401){
          message.warning('您还没有登录，请登陆后重试！')
        } else {
          reject(msg);
        }
      })
      .catch((err) => {
        reject(err.toString());
      });
  });
}

export function AppUpload(url: string, data: any) {
  return new Promise((resolve, reject) => {
    instance
      .post(url, data, {
        headers: 'multipart/form-data'
      })
      .then((res) => {
        if (res.data.code === 200) {
          resolve('success');
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function AppDownload(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    instance
      .get(url, {
        responseType: 'blob'
      })
      .then((res) => {
        if (res && res.status !== 200) {
          reject(new Error(`下载失败`));
        } else {
          let dataUrl = window.URL.createObjectURL(new Blob([res.data]));
          let link = document.createElement('a');
          link.style.display = 'none';
          link.href = dataUrl;

          let filename = '';
          try {
            filename = res.headers['content-disposition'].split(';')[1].split('filename="')[1];

            if (filename.endsWith('"')) {
              filename = filename.substring(0, filename.length - 1);
            }

            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(dataUrl);
            document.body.removeChild(link);
            resolve();
          } catch (err) {
            reject(new Error(`下载失败`));
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}
