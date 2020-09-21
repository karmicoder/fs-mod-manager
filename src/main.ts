import Vue from 'vue';
import App from './App.vue';
import router from './router';
import Router from 'vue-router';

Vue.use(Router);

// import material from 'vue-material/dist/components';
// import 'vue-material/dist/vue-material.min.css';
// console.log('vue-material', material);
const app = new Vue({ router, components: { App } }).$mount('#app');
// createApp(App)
//   .use(router)
//   // .use(material.MdButton)
//   .mount('#app');
