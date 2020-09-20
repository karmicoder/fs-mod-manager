import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
  RouteRecordRaw
} from 'vue-router';
import Setup from '../views/Setup.vue';
import Packages from '../views/Packages.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/setup',
    alias: '/',
    name: 'Setup',
    component: Setup
  },
  {
    path: '/packages',
    name: 'Packages',
    component: Packages
  }
];

const router = createRouter({
  history: process.env.IS_ELECTRON
    ? createWebHashHistory(process.env.BASE_URL)
    : createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
