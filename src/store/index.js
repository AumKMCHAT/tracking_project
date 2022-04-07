import Vue from 'vue'
import Vuex from 'vuex'
import persistedstate from 'vuex-persistedstate'
import employee from './modules/employee'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        employee
    },
    plugins: [
        persistedstate()
    ]
})