<template>
    <div class="main-layout">
      <v-card :class="isMobile?'mobile-form':'normal-form'">
        <v-card-title class="text-h5 text-sm-h4 pl-0"
            >TO THE MOON</v-card-title>
        <v-row 
        class="pa-2">
          <v-col
          cols="12"
          md="11">
            <v-select
              v-model="selectedProjects"
              :items="projects"
              multiple
              label="Please select projects"
            ></v-select>
          </v-col>

          <v-col
          cols="12"
          md="1"
          align-self="center"
          align="right"
          class="pa-0 pb-6">
            <v-btn
              :loading="isLoading"
              outlined
              rounded
              block
              color="primary"
              @click="show">Show</v-btn>
          </v-col>
        </v-row> 

        <div
        :class="isMobile?'mobile-show d-flex flex-wrap':'normal-show d-flex flex-wrap justify-space-between'"
        v-if="series.length > 0"
        >
          <v-card
          v-for="(serie, index) in series" 
          v-bind:key="index"
          :class="isMobile?'mobile-card':'normal-card'">
          <h3>{{projectsData[index].Project}} {{serie[0].data[0][0]}}%</h3>
                <apexchart 
                      height="150"
                      type="scatter" 
                      :options="options" 
                      :series="serie">
                  </apexchart>  
          </v-card>
        </div>
      </v-card>
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
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    }
  },
  data: () => ({
    options: {
      chart: {
        id: 'vuechart-example',
        toolbar: {
          show: false
        }
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
      },
      legend: {
        show: true
      }
      
    },
    isLoading: false,
    Departments: ['DEV', 'QA', 'GRAPHIC', 'BA'],
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
        console.log("getProjects",res.status);
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
        console.log("getData",res.status);
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
        { name: 'ALL', data: [[parseFloat(n.All),1]]},
        { name: 'BA', data: [[parseFloat(n.BA),0.5]] },
        { name: 'DEV', data: [[sumDev,0.5]] },
        { name: 'GRAPHIC', data: [[parseFloat(n.GRAPHIC),0.5]] },
        { name: 'QA', data: [[parseFloat(n.QA),0.5]] }]
          this.series.push(arr)
        }
        // this.row = Math.ceil(this.series.length/2)
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
.normal-form {
  margin: 20px !important;
  padding: 20px !important;
  box-shadow: 0px 0px 30px 0px rgba(0,0,0,0.35) !important;
  border-radius: 12px !important;
}
.mobile-form {
  margin: 10px !important;
  padding: 15px !important;
  box-shadow: 0px 0px 30px 0px rgba(0,0,0,0.35) !important;
  border-radius: 12px !important;
}
.normal-show {
  margin: 0px;
}
.mobile-show {
  margin: 5px;
}
.normal-card{
  margin: 15px;
  margin-left: 0px;
  margin-right: 0px;
  border-radius: 20px !important;
  padding: 15px;
  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.3) !important;
  width: 49%;
}
.mobile-card{
  margin-bottom: 20px;
  border-radius: 20px !important;
  padding: 15px;
  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.35) !important;
  width: 100%;
}

</style>
