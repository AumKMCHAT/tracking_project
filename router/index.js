import Vue from 'vue'
import VueRouter from 'vue-router'

// silence the rejection and make the promise resolve with the error instead
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
    return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Homepage',
        component: () => import('../src/views/Homepage')
    },
    {
        path: '/trackingform',
        name: 'TrackingForm',
        component: () => import('../src/views/TrackingForm')
    },
    {
        path: '/graph',
        name: 'ViewGraph',
        component: () => import('../src/views/ViewGraph')
    },
    {
        path: '/submission',
        name: 'ViewSubmission',
        component: () => import('../src/views/ViewSubmission')
    },

]

const router = new VueRouter({
    scrollBehavior (to, from, savedPosition) {
        return { x: 0, y: 0 }
    },
    mode: 'history',
    // base: process.env.BASE_URL,
    routes
})

// router.beforeEach((to, from, next) => {
//     if (to.matched.some(record => record.meta.requiresAuth)) {
//         if (!Store.state.Auth.user.token) {
//             if (from.name !== 'Home') {
//                 next({
//                     name: 'Home'
//                 })
//             }
//             // login first before visit route
//             Store.commit('General/setLoginDialog', true)
//         } else {
//             next()
//         }
//     } else {
//         next()
//     }
// })

export default router