import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueCompositionApi from '@vue/composition-api';

//import IconsPlugin  from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
//import VeeValidate from 'vee-validate';

import App from './App.vue'

// using Composition API to share axios access to stackoverflow
Vue.use(VueCompositionApi);
// Install BootstrapVue
Vue.use(BootstrapVue)

// Optionally install the BootstrapVue icon components plugin
//Vue.use(IconsPlugin)
//vee validator
//Vue.use(VeeValidate)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
