import Vue from 'vue'
import Vuex from 'vuex'
import persistedstate from 'vuex-persistedstate'
import employee from './modules/employee'
import projects from './modules/projects'
import general from './modules/general'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        employee,
        projects,
        general
    },
    plugins: [
        persistedstate()
    ]
})