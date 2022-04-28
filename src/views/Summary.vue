<template>
    <div>
        <v-card class="pa-3">
            <v-card-title>Summary</v-card-title>

            <v-form>
                <v-row>
                    <v-col
                    align-self="center">
                    <date-picker 
                    class="date-picker"
                    v-model="dates" 
                    value-type="format" 
                    format="D MMM YYYY"
                    range
                    placeholder="Select date range"
                    :disabled-date="disabledDate"
                    ></date-picker>
                    </v-col>

                    <v-col>
                        <v-select
                        v-model="selectedNames"
                        :items="formattedNameOpt"
                        item-text="text"
                        item-value="value"
                        multiple
                        label="Please select names"
                        ></v-select>
                    </v-col>

                    <v-col>
                        <v-autocomplete
                        v-model="selectedProjects"
                        :items="projects"
                        multiple
                        label="Please select projects"
                        ></v-autocomplete>
                    </v-col>

                    <v-col
                    align-self="center">
                        <v-btn
                        :loading="isLoading"
                        outlined
                        rounded
                        block
                        color="primary"
                        class="view-btn"
                        @click="validate">view</v-btn>
                    </v-col>
                </v-row>

            </v-form>

            <v-card>
                    <apexchart 
                      type="bar" height="430" :options="chartOptions" :series="series">
                  </apexchart> 
            </v-card>
        </v-card>
    </div>
    
</template>

<script>
import moment from 'moment'
import axios from 'axios'
import { sheetUrl } from '../store/constants'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'

export default {
    components: {
        DatePicker 
    },
    beforeMount () {
        // this.getProjects(),
        // this.getName()
    },
    computed: {
        formattedNameOpt () {
            return this.nameList.map(item => ({
                text: `(${this.showDepartment(item)}) ${item}`,
                value: item
            }))
        },
        isMobile() {
            return this.$vuetify.breakpoint.mobile
        }
    },
    data: () => ({
        dates: [moment().subtract(30, 'days').format('D MMM YYYY'), moment().format('D MMM YYYY')],
        selectedNames: [],
        nameList: [],
        projects: [],
        selectedProjects: [],
        isLoading: false,
        data: [],
        firstDay: '',
        firstMonth: '',
        lastDay: '',
        lastMonth: '',
        gbName: '',
        gbProject: '',
        series: [{
            name: "1",
            data: [44, 55, 41, 64, 22, 43, 21]
          }, {
            name: "2",
            data: [53, 32, 33, 52, 13, 44, 32]
          }],
        chartOptions: {
            chart: {
              type: 'bar',
              height: 430
            },
            plotOptions: {
              bar: {
                horizontal: true,
                dataLabels: {
                  position: 'top',
                },
              }
            },
            dataLabels: {
              enabled: true,
              offsetX: -6,
              style: {
                fontSize: '12px',
                colors: ['#fff']
              }
            },
            stroke: {
              show: true,
              width: 1,
              colors: ['#fff']
            },
            tooltip: {
              shared: true,
              intersect: false
            },
            xaxis: {
              categories: [2001, 2002, 2003, 2004, 2005, 2006, 2007],
            }
        },
        result: []
        
    }),
    methods: {
        disabledDate(date) {
            const today = new Date();
            const firstDay = new Date(date.getFullYear(), 0, 1);
            today.setHours(0, 0, 0, 0);
            firstDay.setHours(0, 0, 0, 0);

            return date > today || new Date().getFullYear() > date.getFullYear() ;
        },
        changeFormat(dates) {
            let arr = [];
            for (const date of dates){
                arr.push(moment(`${date}`).format('YYYY-MM-DD'))
            }
            return arr
        },
        getName () {
            let dev = [], ba = [], graphic = [], qa = []
            // tabs/sheetName
            axios.get(sheetUrl + '/tabs/nameSheet')
                .then(res => {
                    this.nameData = res.data
                    for (const n of res.data){
                        switch (n.department) {
                            case "DEV":
                                dev.push(n.name)
                                break;
                            case "BA":
                                ba.push(n.name)
                                break;
                            case "GRAPHIC":
                                graphic.push(n.name)
                                break;
                            case "QA":
                                qa.push(n.name)
                                break;
                            default:
                                break;
                        }
                    }
                    dev.sort()
                    ba.sort()
                    graphic.sort()
                    qa.sort()
                    this.nameList = ba.concat(dev,graphic,qa)
                    if (this.employeeName){
                        this.name = this.employeeName
                        for (let i = 0;i < this.projectsName.length;i++){
                            this.selectedProjects[i] = this.projectsName[i]
                        }
                        this.findDepartment()
                        this.genDateOpt()
                        this.findProjectsOpt()
                    }
                })
        },
        showDepartment (val) {
            for (const n of this.nameData){
                if (val == n.name){
                    return n.department
                }
            }
        },
        async getProjects () {
            let res = await axios.get(sheetUrl + `/tabs/listProjects`)
            for (const data of res.data){
            this.projects.push(data.project)
            }
            this.projects.sort((a, b) => new Intl.Collator().compare(a, b))
        },
        groupBy (arr, key) {
            const val = {}
            return arr.reduce((acc, nval) => {
            const att = nval[key]
            acc[att] = [...(acc[att] || []), nval]
            return acc
            }, val)
        },
        async getData () {
            this.data = []
            this.isLoading = true
            let res
            if (this.firstDay == this.lastDay && this.firstMonth == this.lastMonth){
                // get a day
                res = await axios.get(sheetUrl + `/tabs/Per man/search?date=${this.firstDay}&month=${this.firstMonth}`)
                this.data = res.data
                this.filterData()
                this.isLoading = false
            }else{
                if (this.firstMonth == this.lastMonth){
                    // get a month
                    res = await axios.get(sheetUrl + `/tabs/Per man/query?month=${this.firstMonth}&date=__gte(${this.firstDay})&date=__lte(${this.lastDay})`)
                    this.data = res.data
                    this.filterData()
                    this.isLoading = false
                }else{
                    //get in range
                    res = await axios.get(sheetUrl + `/tabs/Per man/query?month=__gte(${this.firstMonth})&month=__lte(${this.lastMonth})`)
                    //filterdate 
                    this.filterDate()
                    this.filterData()
                    this.isLoading = false
                }
            }
        },        
        validate () {
            this.dataShow = []
            this.dateRange = []
            let datesArr = this.changeFormat(this.dates)
            let firstArr, secondArr
            firstArr = datesArr[0].split("-")
            if (this.dates.length > 1){
                secondArr = datesArr[1].split("-")
                if (moment(`${this.dates[0]}`).isBefore(`${this.dates[1]}`, 'day')){
                    this.firstDay = parseInt(firstArr[2])
                    this.firstMonth = parseInt(firstArr[1])
                    this.lastDay = parseInt(secondArr[2])
                    this.lastMonth = parseInt(secondArr[1])
                }else{
                    this.firstDay = parseInt(secondArr[2])
                    this.firstMonth = parseInt(secondArr[1])
                    this.lastDay = parseInt(firstArr[2])
                    this.lastMonth = parseInt(firstArr[1])
                }
            }else{
                this.firstDay = parseInt(firstArr[2])
                this.firstMonth = parseInt(firstArr[1])
                this.lastDay = parseInt(firstArr[2])
                this.lastMonth = parseInt(firstArr[1])
            }
            this.getData()
        },
        filterData () {
            this.gbName = this.groupBy(this.data, "name")
            for (const n of this.selectedNames){
                // this.gbName[n]
            }
            // this.gbProject = groupBy(this.)

        },
        filterDate () {
            let a = [];
            for (const item of this.data){
                if (item.month > this.firstMonth && item.month < this.lastMonth){
                    a.push(item)
                }else{
                    if (item.month == this.firstMonth){
                        if (item.date >= this.firstDay){
                            a.push(item)
                        }
                    }else{
                        if (item.month == this.lastMonth){
                            if (item.date <= this.lastDay){
                                a.push(item)
                            }
                        }
                    }
                }
            }
            this.data = a
        },
        createSeries () {
            let obj = {name: '',
            data: ''}
            let index = 0
            for (const p of this.selectedProjects){
                obj.name = p
                // obj.data = [index]
                this.series.push(obj)
            }
            this.chartOptions.xaxis.categories = this.selectedProjects
        }
    }

}

</script>

<style scoped>

</style>