<template>
    <div class="main-layout">
      <v-card class="form-card">
        <h2>TO THE MOON</h2>
        <v-row 
        class="pa-2">
          <v-col
          cols="12"
          sm="11">
            <v-select
              v-model="selectedProjects"
              :items="projects"
              multiple
              persistent-hint
              label="Please select projects"
            ></v-select>
          </v-col>

          <v-col
          cols="12"
          sm="1"
          align-self="center"
          align="right">
            <v-btn
              :loading="isLoading"
              outlined
              rounded
              color="primary"
              @click="show">Show</v-btn>
          </v-col>
        </v-row>
        
      </v-card>

      <div
      v-for="n in parseInt(row)" 
      :key="n">{{n}}</div>

      <div
      v-for="(serie, index) in series" 
      v-bind:key="index">
        <v-col
        cols="6"
        sm="6">
          <v-card
          class="graph-card">
          <h3>{{projectsData[index].Project}} {{serie[4].data[0][0]}}%</h3>
                <apexchart 
                      height="150"
                      type="scatter" 
                      :options="options" 
                      :series="serie">
                  </apexchart>  
          </v-card>
        </v-col>
      </div>

    </div>
    
</template>

<script>
import axios from 'axios'
import { sheetUrl } from '../store/constants'

export default {
  name: 'ViewGraph',
  beforeMount() {
    this.getProjects()
    this.getData()
  },
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
            show: false,
            tickAmount: 1,
            max: 1
        }
    },
    isLoading: false,
    Derpartments: ['DEV', 'QA', 'GRAPHIC', 'BA'],
    selectedProjects: [],
    projects: [],
    allData: [],
    projectsData: [],
    series: [],
    row: 0
  }),
  methods:{
      async getProjects () {
        let res = await axios.get(sheetUrl + `/tabs/listProjects`)
        for (const data of res.data){
          this.projects.push(data.project)
        }
      },
      show () {
        this.series = []
        this.projectsData = []
        this.isLoading = true
        this.filterData()
      },
      async getData () {
        let res = await axios.get(sheetUrl + `/tabs/graphData`)
        this.allData = res.data
      },
      filterData () {
        for (const n of this.selectedProjects){
          for (const m of this.allData){
            if (n == m.Project){
              this.projectsData.push(m)
              break;
            }
          }
        }
        this.setGraphData()
      },
      setGraphData () {
        let arr = []
        let sumDev = 0
        for (const n of this.projectsData){
          sumDev = parseFloat(n.SeniorDEV) + parseFloat(n.JuniorDEV)
          arr = [
        { name: 'DEV', data: [[sumDev,0]] },
        { name: 'QA', data: [[parseFloat(n.QA),0]] },
        { name: 'GRAPHIC', data: [[parseFloat(n.GRAPHIC),0]] },
        { name: 'BA', data: [[parseFloat(n.BA),0]] },
        { name: 'ALL', data: [[parseFloat(n.All),1]]}]
          this.series.push(arr)
        }
        this.row = Math.ceil(this.series.length/2)
        this.isLoading = false
      }
  }
}
</script>

<style scoped>
.main-layout {
    height: 100%;
    display: 80%;
    justify-content: center;
    align-content: center;
    background: radial-gradient(circle, rgba(249,254,255,0.14469537815126055) 0%, rgba(204,233,233,1) 100%);
}
.form-card {
    margin: 20px !important;
    padding: 7px !important;
    box-shadow: 0px 0px 30px 0px rgba(0,0,0,0.35) !important;
    border-radius: 12px !important;
}
.graph-card{
  margin: 15px;
  border-radius: 20px !important;
  padding: 10px;
  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.25) !important;
}

</style>
