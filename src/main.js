import Vue from "vue";
import App from "./App.vue";

import vueDebounce from "vue-debounce";
Vue.config.productionTip = false;
Vue.use(vueDebounce);
new Vue({
  render: h => h(App)
}).$mount("#app");
