import Vue from 'vue'
import Vuex from 'vuex'
import persistedstate from 'vuex-persistedstate'
import employee from './modules/employee'
import projects from './modules/projects'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        employee,
        projects
    },
    plugins: [
        persistedstate()
    ]
})