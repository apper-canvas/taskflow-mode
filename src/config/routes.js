import Home from '@/components/pages/Home';
import Archive from '@/components/pages/Archive';

export const routes = [
  {
    id: 'home',
    label: 'Tasks',
    path: '/',
    icon: 'CheckSquare',
    component: Home
},
  {
    id: 'archive',
    label: 'Archive',
    path: '/archive',
    icon: 'Archive',
    component: Archive
  }
];