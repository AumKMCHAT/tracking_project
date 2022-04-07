import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from '../router'
import apexcharts from './plugins/apexcharts'
import './assets/css/styles.scss'
import moment from 'moment'
import store from './store/index'

Vue.use(require('vue-moment'))

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount('#app')
