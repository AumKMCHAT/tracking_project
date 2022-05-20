const state = {
    passwordKey: ""
}
const getters = {}
const actions = {}

const mutations = {
    setPassword(state, password) {
        state.passwordKey = password
    },
    clearPassword(state, name) {
        state.passwordKey = ""
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}