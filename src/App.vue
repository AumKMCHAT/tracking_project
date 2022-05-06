<template>
  <div id="app">
    <div class="minWidth">
 <v-app>
     <Manu></Manu>
     <Loading></Loading>
     <router-view></router-view>
     <Version></Version>
   </v-app>
    </div>
  </div>
</template>

<script>
import Loading from './components/Loading.vue'
import Manu from './components/Manu.vue'
import Version from './components/Version.vue'

export default {
  name: 'App',
  components: {
    Loading,
    Manu,
    Version
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
  overflow: auto;
}
.minWidth {
  min-width: 340px;
}
</style>
