export default {
  async awaitAll(...fnArr) {
    if ({}.toString.call(fnArr[0]) === '[object Array]') {
      // eslint-disable-next-line no-param-reassign
      fnArr = fnArr[0];
    }
    const fnNum = fnArr.length;
    const promiseArr = [];
    const resultArr = [];
    for (let i = 0; i < fnNum; i++) {
      promiseArr.push(fnArr[i]());
    }
    for (let i = 0; i < fnNum; i++) {
      // eslint-disable-next-line no-await-in-loop
      resultArr.push(await promiseArr[i]);
    }
    return resultArr;
  },
  /**
   * @name: 千分符
   * @param {type}
   * @return:
   * @msg:
   * @Author: zhangxin
   */
  addThousandthSign(numStr) {
    const regForm = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g;
    return numStr.toString().replace(regForm, '$1,');
  },
  // 计算颜色步长
  gradient(startColor, endColor, step) {
    // 将rgb颜色转成hex  输入(24,12,255)
    function rgbToHex(r, g, b) {
      // eslint-disable-next-line no-bitwise
      const hex = ((r << 16) | (g << 8) | b).toString(16);
      return `#${new Array(Math.abs(hex.length - 7)).join('0')}${hex}`;
    }
    // 将hex颜色转成rgb
    function hexToRgb(hex) {
      const rgb = [];
      for (let i = 1; i < 7; i += 2) {
        // eslint-disable-next-line radix
        rgb.push(parseInt(`0x${hex.slice(i, i + 2)}`));
      }
      return rgb;
    }
    // 将hex转换为rgb
    const sColor = hexToRgb(startColor);
    const eColor = hexToRgb(endColor);

    // 计算R\G\B每一步的差值
    const rStep = (eColor[0] - sColor[0]) / step;
    const gStep = (eColor[1] - sColor[1]) / step;
    const bStep = (eColor[2] - sColor[2]) / step;

    const gradientColorArr = [];
    for (let i = 0; i < step; i++) {
      // 计算每一步的hex值
      // eslint-disable-next-line radix
      gradientColorArr.push(rgbToHex(parseInt(rStep * i + sColor[0]), parseInt(gStep * i + sColor[1]), parseInt(bStep * i + sColor[2])));
    }
    return gradientColorArr;
  },
  /* 设置 cookie */
  setCookie(name, value, params = {}) {
    let stringifiedAttributes = '';

    // 过期时间
    if (typeof params.expires === 'number') {
      const date = new Date();
      date.setDate(date.getDate() + params.expires);
      stringifiedAttributes += `;expires=${date}`;
    }

    // path
    const path = params.path ? params.path : '/';
    stringifiedAttributes += `;path=${path}`;

    // domain
    if (params.domain) {
      stringifiedAttributes += `;domain=${params.domain}`;
    }

    document.cookie = `${name}=${value}${stringifiedAttributes}`;
  },
  /* 获取 cookie */
  getCookie(name) {
    const arr = document.cookie.replace(/\s/g, '').split(';');
    for (let i = 0; i < arr.length; i++) {
      const tempArr = arr[i].split('=');
      if (tempArr[0] === name) {
        return decodeURIComponent(tempArr[1]);
      }
    }
    return '';
  },
  /* 删除 cookie */
  removeCookie(name, params = {}) {
    // 设置已过期，系统会立刻删除cookie
    params.expires = -1;
    this.setCookie(name, '', params);
  },
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        resolve(e.target.result);
      };
      // readAsDataURL
      fileReader.readAsDataURL(blob);
      fileReader.onerror = () => {
        reject(new Error('blobToBase64 error'));
      };
    });
  },
  getUrlParams(name) { // 不传name返回所有值，否则返回对应值
    var url = window.location.search;
    if (url.indexOf('?') == 1) { return false; }
    url = url.substr(1);
    url = url.split('&');
    name = name || '';
    var nameres;
    // 获取全部参数及其值
    for(let i=0;i<url.length;i++) {
        var info = url[i].split('=');
        var obj = {};
        obj[info[0]] = decodeURI(info[1]);
        url[i] = obj;
    }
    // 如果传入一个参数名称，就匹配其值
    if (name) {
        for(let i=0;i<url.length;i++) {
            for (const key in url[i]) {
                if (key == name) {
                    nameres = url[i][key];
                }
            }
        }
    } else {
        nameres = url;
    }
    // 返回结果
    return nameres;
  },
    /**
   * 强制保留2位小数，不足补 0
   */
  toDecimal(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
      return false;
    }
    var f = Math.round(x * 100) / 100;
    let s = f.toString();
    let rs = s.indexOf('.');
    if (rs < 0) {
      rs = s.length;
      s += '.';
    }
    while (s.length <= rs + 2) {
      s += '0';
    }
    return s;
  },
  // 保留一位小数
  toOneDecimal(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
      return false;
    }
    var f = Math.round(x * 10) / 10;
    let s = f.toString();
    let rs = s.indexOf('.');
    if (rs < 0) {
      rs = s.length;
      s += '.';
    }
    while (s.length <= rs + 1) {
      s += '0';
    }
    return s;
  },
  formatFileSize(fileSize) {
    const KB_SIZE = 1024;
    const MB_SIZE = KB_SIZE * 1024;

    if (fileSize >= MB_SIZE) {
      return `${(fileSize / MB_SIZE).toFixed(2)} MB`;
    } else if (fileSize >= KB_SIZE) {
      return `${(fileSize / KB_SIZE).toFixed(2)} KB`;
    } else {
      return `${fileSize} bytes`;
    }
  }
};
