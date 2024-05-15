import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  //base: '/assistant/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [react()],
  build: {
    minify: false,
  },
  //设置代理
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://10.168.81.203:8000',
        changeOrigin: true,
      },
    },
  },
  //配置less-loader
  css: {
    //配置postcss-pxtorem
    postcss: {},
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
