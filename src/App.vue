<template>
  <div id="app">
   <v-app>
     <router-view></router-view>
   </v-app>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {

  },
  data: () => ({
    text: 'Hello world'
  }),
  created () {
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
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
