const state = {
    projectsName: []
}
const getters = {}
const actions = {}
const mutations = {
    setName(state, list) {
        state.projectsName = list
    },
    clearName(state, list) {
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