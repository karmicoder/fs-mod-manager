import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'vue-material/dist/vue-material.min.css';
createApp(App)
  .use(router)
  // .use(VueMaterial.MdButton)
  .mount('#app');
