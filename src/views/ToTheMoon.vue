<template>
    <div class="main-layout">
       <v-card :class="isMobile?'mobile-form':'normal-form'">
            <v-card-title class="text-h5 text-sm-h4 pl-0">
                To The Moon
            </v-card-title>

        
            <v-form>        
                     <v-row 
                        class="pa-2">
                        <v-col
                        cols="12"
                        sm="2"
                        >
                        <v-text-field
                        v-model="allData"
                        color="blue darken-2"
                        label="All"
                        required
                        ></v-text-field>
                        </v-col>
                        <v-col
                        cols="12"
                        sm="2"
                        >
                        <v-text-field
                        v-model="baData"
                        color="blue darken-2"
                        label="BA"
                        required
                        ></v-text-field>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="2"
                        >
                            <v-text-field
                            v-model="graphicData"
                            color="blue darken-2"
                            label="Graphic"
                            required
                            ></v-text-field>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="2"
                        >
                            <v-text-field
                            v-model="seniorDevData"
                            color="blue darken-2"
                            label="Senior Dev"
                            required
                            ></v-text-field>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="2"
                        >
                            <v-text-field
                            v-model="juniorDevData"
                            color="blue darken-2"
                            label="Junior Dev"
                            required
                            ></v-text-field>
                        </v-col>
                        <v-col
                        cols="12"
                        md="2"
                        class="mt-3">
                            <v-btn
                            :loading="isLoading"
                            outlined
                            rounded
                            block
                            color="primary"
                            class="view-btn"
                            @click="setGraphData">Generate</v-btn>
                        </v-col>
                    </v-row>
            </v-form>
            <div
                :class="isMobile?'mobile-show d-flex flex-wrap':'normal-show d-flex flex-wrap justify-space-between'"
                v-if="series.length > 0"
                >
                <v-card
                v-for="(serie, index) in series" 
                v-bind:key="index"
                :class="isMobile?'mobile-card':'normal-card'">
                <!-- <h3>{{projectsData[index].Project}} {{serie[0].data[0][0]}}%</h3> -->
                        <apexchart 
                            height="180"
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
    export default {
        name: 'ToTheMoon',
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
            allData: '',
            baData: '',
            graphicData: '',
            seniorDevData: '',
            juniorDevData: '',
            series: []
        }),
        methods: {
            setGraphData() {
            this.series = []
            let arr = []
            arr = [
            { name: 'ALL', data: [[parseFloat(this.allData),1]]},
            { name: 'BA', data: [[parseFloat(this.baData),0.5]] },
            { name: 'Senior DEV', data: [[parseFloat(this.seniorDevData),0.5]] },
            { name: 'Junior DEV', data: [[parseFloat(this.juniorDevData),0.5]] },
            { name: 'GRAPHIC', data: [[parseFloat(this.graphicData),0.5]] }]
            this.series.push(arr)
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