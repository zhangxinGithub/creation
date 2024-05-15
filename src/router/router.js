import { lazy } from 'react';

const router = [
  {
    name: '文本编辑',
    path: '/',
    component: lazy(() => import('@/pages/writing/writing')),
  },
];

export default router;
