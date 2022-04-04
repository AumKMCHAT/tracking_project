import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from '../router'
import apexcharts from './plugins/apexcharts'
import './assets/css/styles.scss'
import moment from 'moment'

Vue.use(require('vue-moment'))

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')
