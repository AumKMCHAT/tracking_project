const state = {
    projectsName: []
}
const getters = {}
const actions = {}
const mutations = {
    setProjects(state, list) {
        state.projectsName = list
    },
    clearProjects(state, list) {
        state.projectsName = []
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}