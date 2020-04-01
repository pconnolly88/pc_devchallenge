import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
//import IconsPlugin  from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
//import VeeValidate from 'vee-validate';

import App from './App.vue'

Vue.config.productionTip = false
// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
//Vue.use(IconsPlugin)
//vee validator
//Vue.use(VeeValidate)

new Vue({
  render: h => h(App),
}).$mount('#app')
