import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.less';
import locale from 'antd/locale/zh_CN';
import { ConfigProvider } from 'antd';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider
    locale={locale}
    theme={{
      token: {
        colorPrimary: '#4c4bdc',
        //colorError:'res',
        borderRadius: 4,
        colorTextBase: '#333',
      },
    }}
    getPopupContainer={
      (trigger) => trigger?.parentNode
      // document.getElementById('root') as HTMLElement
    }
  >
    <div>
      <App />
    </div>
  </ConfigProvider>
);
