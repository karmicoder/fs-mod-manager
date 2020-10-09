import Vue from 'vue';
import './ipc';
import App from './App.vue';
import router from './router';
import Router from 'vue-router';
import './styles/default.scss';
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';
import { ipcRenderer } from 'electron';

console.log('NODE_ENV', process.env.NODE_ENV);
Vue.use(Router);
// import material from 'vue-material/dist/components';
// import 'vue-material/dist/vue-material.min.css';
// console.log('vue-material', material);
const app = new Vue({
  router,
  vuetify,
  components: { App }
}).$mount('#app');
// createApp(App)
//   .use(router)
//   // .use(material.MdButton)
//   .mount('#app');

document.addEventListener('keyup', (ev) => {
  console.log('keyup', ev.key);
  if (ev.key === 'F12') {
    ipcRenderer.emit('devtools');
  }
});
