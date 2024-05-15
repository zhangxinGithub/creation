import axios from 'axios';
import Utils from '@/common/utils';
import { message } from 'antd';

const instance = axios.create({
  timeout: 100000,
  //允许携带cookie
  withCredentials: true,
});
// request拦截器
instance.interceptors.request.use(async (config) => {
  config.headers['access-token'] = Utils.getCookie('passport-token');
  return config;
});
// 异步处理response请求
async function responseData(response = {}) {
  const res = response.data;
  let code = res.Status !== undefined ? res.Status : res.code;
  if (res === 'SUCCESS') {
    code = 0;
  }

  if (+code === 40101 || +code === 401) {
    // 40101: token过期
    Utils.removeCookie('passport-token');
    return;
  }
  if (+code === 500) {
    console.log('服务器响应错误', response);
    message.error('服务器响应错误');
  }
  return { ...response, code };
}
instance.interceptors.response.use(responseData, (error) => {
  if (error?.response?.status === 500 || error?.response?.status === 503) {
    message.error(`请求失败 接口名称${error.response.config.url}`);
  }
  return '';
});

export const ajax = (opts = {}) =>
  new Promise((resolve, reject) => {
    const { url } = opts;
    const { callback } = opts;
    instance({
      url,
      method: opts.method || 'GET',
      headers: {
        'content-type': 'application/json',
        'Cache-Control': 'no-transform',
        ...opts.headers,
      },
      data: opts.data || {},
      params: opts.params,
      cancelToken: opts.cancelToken, //取消请求
    })
      .then((res) => {
        // 异常状态处理
        if (!res) {
          //message.error('网路异常');
          return;
        }
        callback && callback(res);
        let data = null;
        if (res.status !== 200) {
          resolve(res);
          return;
        }
        data = res.data;
        if (res.data.code === 0) {
          resolve(data);
        } else {
          resolve({ ...data, msg: res.data.msg, code: res.data.code });
        }
      })
      .catch((e) => {
        // console.log(e)
        reject(e);
      });
  });
