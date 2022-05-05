<template>
  <div id="app">
   <v-app>
     <Manu></Manu>
     <Loading></Loading>
     <router-view></router-view>
   </v-app>
  </div>
</template>

<script>
import Loading from './components/Loading.vue'
import Manu from './components/Manu.vue'

export default {
  name: 'App',
  components: {
    Loading,
    Manu
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
