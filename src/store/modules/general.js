const state = {
    isLoading: false
}
const getters = {}
const actions = {}
const mutations = {
    setLoading(state, val) {
        state.isLoading = val
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}