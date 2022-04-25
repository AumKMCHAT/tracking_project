<template>
<v-dialog persistent 
width="300"
align="center"
:value="isLoading">
    <v-sheet
    class="pa-5"
    width="max"
    align="center"
    rounded>
        <div class="loader"
        align="center"></div>
        <div class="mt-7">Submitting</div>
        </v-sheet>
</v-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: {
        ...mapState({
            isLoading: state => state.general.isLoading
        })
    }
}
</script>

<style>
.loader {
  border: 10px solid #f3f3f3; /* Light grey */
  border-top: 10px solid #4caf50; /* Blue */
  border-radius: 50%;
  margin: 5px;
  width: 100px;
  height: 100px;
  animation: spin 2s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
