import Vue from 'vue'
import Icon from 'vue-awesome/components/Icon'
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import VModal from 'vue-js-modal'
import MultiSelect from 'vue-multiselect'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(VueToast, { position: 'top-right', duration: 5000 });
Vue.component('v-icon', Icon);
Vue.component('MultiSelect', MultiSelect)
Vue.use(VModal)

new Vue({
  render: h => h(App),
}).$mount('#app')
