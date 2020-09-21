import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
// import material from 'vue-material/dist/components';
import 'vue-material/dist/vue-material.min.css';
// console.log('vue-material', material);
createApp(App)
  .use(router)
  // .use(material.MdButton)
  .mount('#app');
