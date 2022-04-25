import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from '../router'
import apexcharts from './plugins/apexcharts'
import './assets/css/styles.scss'
import moment from 'moment'
import store from './store/index'
import VueSweetalert2 from 'vue-sweetalert2'
import DatePicker from 'vue2-datepicker';

Vue.use(require('vue-moment'))
Vue.use(VueSweetalert2)

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount('#app')
