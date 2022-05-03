<template>
    <div :class="isMobile?'mobile-layout':'normal-layout'">
        <v-card :class="isMobile?'mobile-card':'normal-card'">
            <v-card-title class="text-h5
            text-sm-h4
            text-xl-h4
            pl-3">Summary</v-card-title>

            <v-form>
                <v-container>
                    <v-row>
                        <v-col
                        cols="12"
                        md="5"
                        >
                            <v-select
                            outlined
                            dense
                            v-model="selectedNames"
                            :items="formattedNameOpt"
                            item-text="text"
                            item-value="value"
                            multiple
                            label="Please select names"
                            prepend-inner-icon="person"
                            >
                            <!-- <template v-slot:item="{ item, on, attrs }"> -->
                                <!-- <v-list-item v-on="on" v-bind="attrs">
                                <v-list-item-icon>
                                    <v-icon>
                                    {{ select.includes(item) ? 'checked' : 'uncheck' }}
                                    </v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title v-text="item" class="text-left"></v-list-item-title>
                                </v-list-item-content>
                                </v-list-item> -->
                            <!-- </template> -->
                            </v-select>
                        </v-col>

                        <v-col
                        cols="12"
                        md="7">
                            <v-autocomplete
                            outlined
                            dense
                            v-model="selectedProjects"
                            :items="projects"
                            multiple
                            label="Please select projects"
                            prepend-inner-icon="summarize"
                            ></v-autocomplete>
                        </v-col>
                    </v-row>

                    <v-row
                    class="mt-0">
                        <v-col
                        align-self="start"
                        cols="12"
                        md="12">
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
                    </v-row>

                    <v-row justify="end">
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
                            @click="validate">view</v-btn>
                        </v-col>
                    </v-row>
                </v-container>

            </v-form>

            <v-card v-if="series.length > 0">
                <v-card-title
                class="justify-center 
                text-h6
                text-sm-h4">{{formatDateShow()}}</v-card-title>
                <apexchart 
                type="bar" 
                :options="chartOptions" 
                :series="series">
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
        this.getProjects(),
        this.getName()
    },
    computed: {
        formattedNameOpt () {
            return this.nameList.map(item => ({
                text: `(${this.showDepartment(item)}) ${item}`,
                value: item
            }))
        },
        isMobile () {
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
        series: [],
        chartOptions: {
            chart: {
              type: 'bar',
              height: 430
            },
            plotOptions: {
              bar: {
                horizontal: true,
                columnWidth: '50%',
                dataLabels: {
                  position: 'center',
                },
              }
            },
            dataLabels: {
                enabled: true,
                offsetX: -6,
                style: {
                    fontSize: '12px',
                    colors: ['#fff']
                },
                formatter: function (val) {
                    return val + " ( " + val*8 +  " hrs )"
                },
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
              categories: ''

            },
            colors: []
        },
        result: [],
        showDates: []
        
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
                this.createResult()
                this.filterData()
                this.isLoading = false
            }else{
                if (this.firstMonth == this.lastMonth){
                    // get a month
                    res = await axios.get(sheetUrl + `/tabs/Per man/query?month=${this.firstMonth}&date=__gte(${this.firstDay})&date=__lte(${this.lastDay})`)
                    this.data = res.data
                    this.createResult()
                    this.filterData()
                    this.isLoading = false
                }else{
                    //get in range
                    res = await axios.get(sheetUrl + `/tabs/Per man/query?month=__gte(${this.firstMonth})&month=__lte(${this.lastMonth})`)
                    //filterdate 
                    this.data = res.data
                    this.createResult()
                    this.filterDate()
                    this.filterData()
                    this.isLoading = false
                }
            }
        },        
        validate () {
            this.showDates = this.dates
            this.data = []
            this.series = []
            this.result = []
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
            let index = 0
            let arr
            let sum = 0
            if (this.selectedNames.length > 0){
                if (this.selectedProjects.length > 0){
                    // select name and project
                    this.chartOptions.xaxis.categories = this.selectedNames
                    this.gbName = this.groupBy(this.data, "name")
                    for (const p of this.selectedProjects){
                        for (const n of this.selectedNames){
                            sum = 0
                            if (this.gbName[n]){
                                arr = this.groupBy(this.gbName[n], "project")
                                if (!arr[p]){
                                    sum = 0
                                }else{
                                    for (const num of arr[p]){
                                        sum = sum + parseFloat(num.work)
                                    }
                                }
                            }else{
                                sum = 0
                            }
                            this.result[index].push(sum)
                        }
                        index++
                    }
                    this.randomColors()
                    this.createSeries()
                }else{
                    //select name
                    let cateArr = []
                    this.chartOptions.xaxis.categories = this.selectedNames
                    this.gbName = this.groupBy(this.data, "name")
                    for (const n of this.selectedNames){
                        arr = this.groupBy(this.gbName[n], "project")
                        cateArr = cateArr.concat(Object.keys(arr))
                    }
                    this.selectedProjects = cateArr.filter(this.onlyUnique)
                    this.createResult()
                    for (const p of this.selectedProjects){
                        for (const n of this.selectedNames){
                            sum = 0
                            if (this.gbName[n]){
                                arr = this.groupBy(this.gbName[n], "project")
                                if (!arr[p]){
                                    sum = 0
                                }else{
                                    for (const num of arr[p]){
                                        sum = sum + parseFloat(num.work)
                                    }
                                }
                            }else{
                                sum = 0
                            }
                            this.result[index].push(sum)
                        }
                        index++
                    }
                    this.randomColors()
                    this.createSeries()
                    this.selectedProjects = []
                }
            }else{
                if (this.selectedProjects.length > 0){
                    //select project
                    this.chartOptions.xaxis.categories = ["projects"]
                    this.gbProject = this.groupBy(this.data, "project")
                    for (const n of this.selectedProjects){
                        sum = 0
                        if(this.gbProject[n]){
                            for (const m of this.gbProject[n]){
                                sum = sum + parseFloat(m.work)
                            }
                        }else{
                            sum = 0
                        }
                        this.result[index].push(sum)
                        index++
                    }
                    this.randomColors()
                    this.createSeries()
                }else{
                    //select date range
                    this.gbProject = this.groupBy(this.data, "project")
                    this.selectedProjects = Object.keys(this.gbProject)
                    console.log(this.selectedProjects);
                    this.createResult()
                    for (const n of this.selectedProjects){
                        for (const m of this.gbProject[n]){
                            sum = sum + parseFloat(m.work)
                        }

                        this.result[index].push(sum)
                        sum=0
                        index++
                    }
                    this.chartOptions.xaxis.categories = ["projects"]
                    this.randomColors()
                    this.createSeries()
                    this.selectedProjects = []
                }
            }
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
            let index = 0
            for (const p of this.selectedProjects){
                let obj = new Object()
                obj.name = p
                obj.data = this.result[index]
                this.series.push(obj)
                index++
            }
            this.isLoading = false
        },
        createResult () {
            for (const p of this.selectedProjects){
                this.result.push([])
            }
        },
        formatDateShow () {
            let datesArr = this.changeFormat(this.showDates)
            if (moment(`${datesArr[0]}`).isSame(`${datesArr[1]}`, 'day')){
                return moment(`${datesArr[0]}`).format('dddd D MMMM YYYY')
            }else{
                return `${moment(`${datesArr[0]}`).format('dddd D MMMM YYYY')} - ${moment(`${datesArr[1]}`).format('dddd D MMMM YYYY')}`
            }
        },
        onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        },
        randomColors () {
            let letters = '0123456789ABCDEF';
            let color = '#';
            for (const p of this.selectedProjects){
                color = '#'
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                this.chartOptions.colors.push(color)
            }
        }
    }

}

</script>

<style scoped>
.normal-layout {
    height: 100%;
    display: 80%;
    justify-content: center;
    align-content: center;
    background: radial-gradient(circle, rgba(249,254,255,0.14469537815126055) 0%, rgba(204,233,233,1) 100%);
}
.mobile-layout {
    height: 100%;
    margin: 0px;
    padding: 0px;
}
.normal-card {
    margin: 20px !important;
    padding: 20px !important;
    box-shadow: 0px 0px 30px 0px rgba(0,0,0,0.35) !important;
    border-radius: 12px !important;
}
.mobile-card {
    padding: 7px !important;
    box-shadow: 0px 0px 0px 0px rgba(0,0,0,0) !important;
}
.date-picker {
    width: 100%;
    align-self: center;
}

</style>