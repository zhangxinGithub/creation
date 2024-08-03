import { lazy } from 'react';

const router = [
  {
    name: '文本编辑',
    path: '/',
    component: lazy(() => import('@/pages/writing/writing')),
  },
  {
    name: 'AI校对',
    path: '/check',
    component: lazy(() => import('@/pages/check/check')),
  },
  {
    name: 'demo',
    path: '/demo',
    component: lazy(() => import('@/pages/demo/demo')),
  },
];

export default router;
