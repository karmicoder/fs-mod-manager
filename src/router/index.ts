import Setup from '../views/Setup.vue';
import Packages from '../views/Packages.vue';
import Import from '../views/Import.vue';
import VueRouter, { RouteConfig } from 'vue-router';

const routes: RouteConfig[] = [
  {
    path: '/setup',
    alias: '/',
    name: 'Setup',
    component: Setup
  },
  {
    path: '/packages/:tab?',
    name: 'Packages',
    component: Packages
  },
  {
    path: '/import/:step?',
    name: 'Import',
    component: Import
  }
];

const router = new VueRouter({
  mode: 'hash',
  routes
});

export default router;
