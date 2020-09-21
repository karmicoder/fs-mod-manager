import Setup from '../views/Setup.vue';
import Packages from '../views/Packages.vue';
import VueRouter, { RouteConfig } from 'vue-router';

const routes: RouteConfig[] = [
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

const router = new VueRouter({
  mode: 'hash',
  routes
});

export default router;
