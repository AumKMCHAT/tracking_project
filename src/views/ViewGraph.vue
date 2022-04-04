<template>
    <div>
        <v-card>
            <v-card-title>TO THE MOON</v-card-title>
               <apexchart 
                    height="150"
                    type="scatter" 
                    :options="options" 
                    :series="series">
                </apexchart>  
        </v-card>
    </div>
    
</template>

<script>
import axios from 'axios'
import { sheetUrl } from '../store/constants'

export default {
  name: 'ViewGraph',
  data: () => ({
    options: {
      chart: {
        id: 'vuechart-example'
      },
        xaxis: {
            tickAmount: 10,
            forceNiceScale: true,
            min: 0,
            max: 200,
            labels: {
            formatter: function(val) {
                return val;
            }
        }
    },
        yaxis: {
            tickAmount: 1,
            max: 1
        }
    },
    series: [
        { name: 'DEV', data: [[80,0]] },
        { name: 'QA', data: [[50,0]] },
        { name: 'GRAPHIC', data: [[30,0]] },
        { name: 'BA', data: [[10,0]] },
        { name: 'ALL', data: [[90,1]]}],
    Derpartments: ['DEV', 'QA', 'GRAPHIC', 'BA'],
    workSum: []

  }),
  methods:{
      summary () {

        },
  }
}
</script>

<style scoped>

</style>
