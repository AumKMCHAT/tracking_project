<template>
  <div id="app">
   <v-app>
     <Loading></Loading>
     <router-view></router-view>
   </v-app>
  </div>
</template>

<script>
import Loading from './components/Loading.vue'

export default {
  name: 'App',
  components: {
    Loading
  },
  data: () => ({
    text: 'Hello world'
  }),
  created () {
    this.$store.commit('general/setLoading', false)
    this.testApp()
  },
  methods: {
    testApp () {
      console.log('test')
    }
  }
}
</script>

<style>
#app {
  font-family: "Kanit", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
