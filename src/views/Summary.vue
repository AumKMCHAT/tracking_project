<template>
    <div :class="isMobile?'mobile-layout':'normal-layout'">
        <v-card :class="isMobile?'mobile-card':'normal-card'">
            <v-card-title class="text-h5
            text-sm-h4
            text-xl-h4
            pl-3">Summary</v-card-title>

            <v-form>
                <v-container>
                    <v-row
                    class="mb-0">
                        <v-col
                        cols="12"
                        md="5"
                        align-self="center"
                        class="pb-1"
                        >
                            <v-autocomplete
                            outlined
                            dense
                            chips
                            deletable-chips
                            v-model="selectedNames"
                            :items="formattedNameOpt"
                            item-text="text"
                            item-value="value"
                            multiple
                            label="Employees"
                            prepend-inner-icon="person"
                            @change="genProjectOpt"
                            hide-details
                            >
                            </v-autocomplete>
                        </v-col>

                        <v-col
                        cols="12"
                        md="7"
                        class="pb-0">
                            <v-autocomplete
                            outlined
                            dense
                            chips
                            deletable-chips
                            v-model="selectedProjects"
                            :items="projects"
                            multiple
                            label="Projects"
                            prepend-inner-icon="summarize"
                            hide-details
                            >
                            </v-autocomplete>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col
                        align-self="start"
                        cols="12"
                        md="12"
                        class="pt-1">
                        <date-picker 
                        class="date-picker"
                        v-model="dates" 
                        value-type="format" 
                        format="D MMM YYYY"
                        range
                        placeholder="Select date range"
                        :disabled-date="disabledDate"
                        @change="checkGraphTypeOpt"
                        ></date-picker>
                        </v-col>
                    </v-row>

                    <v-row
                    class="">
                        <v-col
                        align-self="start"
                        cols="12"
                        md="12"
                        class="pt-1">
                        <v-select
                        outlined
                        menu-props="offsetY"
                        clearable
                        dense
                        v-model="graphType"
                        :items="graphTypes"
                        label="Type"
                        prepend-inner-icon="bar_chart"
                        :disabled="selectedNames.length > 1"
                        @click.clear="graphType = ''"
                        ></v-select></v-col>
                    </v-row>

                    <v-row justify="end"
                    class="mt-0">
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

            <v-card v-if="chartOptions.series.length > 0"
                class="pa-2">
                <div class="project-list d-flex flex-wrap flex-column">
                    <ul v-for="(project, index) in projectsSum"
                    v-bind:key="index"
                    class="list">
                    <li 
                    v-html="project"></li>
                    </ul>
                </div>
                <div class="chart-div">
                    <highcharts 
                    :class="chartOptions.series[0].data.length > 30?'overflow-chart':'normal-chart'"
                    :options="chartOptions" 
                    >
                    </highcharts> 
                </div>

            </v-card>

            <div
            :class="isMobile?'':'d-flex flex-wrap justify-space-between'">

            <v-card
            v-for="(chart, index) in pieCharts" 
            v-bind:key="index"
            :class="isMobile?'pieChart-card-mobile':'pieChart-card'">
                <ul
                v-for="(department, i) in pieProjectSum[index]"
                v-bind:key="i">
                <li v-html="department"></li>
                </ul>
                    <highcharts
                    :options="chart.chartOptions"></highcharts>
            </v-card>
            </div>
        </v-card>
    </div>
    
</template>

<script>
import moment from 'moment'
import axios from 'axios'
import { sheetUrl } from '../store/constants'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import {Chart} from 'highcharts-vue'

export default {
    components: {
        DatePicker,
        highcharts: Chart 
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
        allProjects: [],
        selectedProjects: [],
        isLoading: false,
        data: [],
        firstDay: '',
        firstMonth: '',
        lastDay: '',
        lastMonth: '',
        gbName: '',
        gbProject: '',
        chartOptions: {
            series: [],
            chart: {
              type: 'column'
            },
            title: {
                text: ''
            },
            plotOptions: {
              column: {
                stacking: 'normal',
                pointPadding: 0,
                groupPadding: 0.2, 
                pointWidth: 25,
                dataLabels: {
                    enabled: true,
                    position: 'ceter',
                    pointPadding: 0.2,
                    borderWidth: 0.1,
                    pointWidth: 20,
                    formatter: function () {
                        return (this.y!=0)?`${this.y} ( ${this.y*8} ${this.y*8>1?" hrs )":" hr )"}`:""
                    },
                },
                series : {
                    
                }
              }
            },
            xAxis: {
                categories: [],
                scrollbar: {
                    enabled: true //enables scrolling 
                },
            },
            yAxis: {
                title: {
                    text: 'Unit'
                },
            },
            responsive: {  
                rules: [{  
                    condition: {  
                        minWidth: 1200  
                    },  
                }]  
            }
        },
        pieCharts: [],
        result: [],
        showDates: [],
        graphType: '',
        graphTypes: ["Daily", "Weekly", "Monthly"],
        pieChart: false,
        projectsSum: [],
        pieProjectSum: []
        
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
            this.allProjects = this.projects
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
            this.pieProjectSum = []
            this.pieChart = false
            this.pieCharts = []
            this.projectsSum = []
            this.showDates = this.dates
            this.data = []
            this.chartOptions.series = []
            this.result = []
            this.chartOptions.xAxis.categories = []
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
            if (this.selectedNames.length > 0){
                if (this.selectedProjects.length > 0){
                    // select name and project
                    this.createDataNP()
                    this.createSeries()
                }else{
                    //select name
                    this.createDataN()
                    this.createSeries()
                    this.selectedProjects = []
                }
            }else{
                if (this.selectedProjects.length > 0){
                    //select project
                    this.createDataP()
                    if (!this.pieChart){
                        this.createSeries()  
                    }
                }else{
                    //select date range
                    this.createData()
                    this.createSeries()
                    this.selectedProjects = []
                }
            }
            let msg = ''
            let sum
            if (!this.pieChart){
                for (const p of this.chartOptions.series){
                    sum = p.data.reduce((a, b) => a + b, 0)
                    msg = `${p.name}: <span class="blue--text">${sum}</span> ${sum>1? "days ":"day "}(<span class="green--text">${sum*8}</span> ${sum*8>1?"hrs":"hr"})`
                    this.projectsSum.push(msg)
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
                this.chartOptions.series.push(obj)
                index++
            }
            this.chartOptions.title.text = this.formatDateShow()
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
            let color
            for (const p of this.selectedProjects){
                color = '#'
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                this.chartOptions.colors.push(color)
            }
        },
        createDataNP () {
            let sum 
            let index = 0
            let arr = []
            let gbMonth,gbDate,gbWeek
            switch (this.graphType) {
                case 'Daily':
                    gbMonth = this.groupBy(this.data, "month")
                    for (const m in gbMonth){
                        gbDate = this.groupBy(gbMonth[m], "date")
                        for (const d in gbDate){
                            this.gbName= this.groupBy(gbDate[d], "name")
                            this.sumNP()

                            this.chartOptions.xAxis.categories.push(`${parseInt(d)}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Weekly':
                    //sum of work in each week
                    gbMonth = this.groupBy(this.data, "month")
                    for (const m in gbMonth){
                        gbWeek = this.groupBy(gbMonth[m], "week")
                        for (const w in gbWeek){
                            this.gbName= this.groupBy(gbWeek[w], "name")
                            this.sumNP()

                            this.chartOptions.xAxis.categories.push(`week:${parseInt(w)}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Monthly':
                    //sum of work in each month
                    gbMonth = this.groupBy(this.data, "month")
                    for (const m in gbMonth){
                            this.gbName= this.groupBy(gbMonth[m], "name")
                            this.sumNP()

                            this.chartOptions.xAxis.categories.push(`month:${parseInt(m)}`)
                    }
                    break;

                default:
                    this.chartOptions.xAxis.categories = this.selectedNames
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
                    break;
            }
        },
        createDataN () {
            let sum 
            let index = 0
            let arr = []
            let cateArr = []
            let gbMonth,gbDate,gbWeek

            switch (this.graphType) {
                case 'Daily':
                    this.findProjects()
                    this.createResult()
                    //sum of work in each day
                    gbMonth = this.groupBy(this.data, "month")
                    for (const m in gbMonth){
                        gbDate = this.groupBy(gbMonth[m], "date")
                        for (const d in gbDate){
                            this.gbName= this.groupBy(gbDate[d], "name")
                            this.sumNP()

                            this.chartOptions.xAxis.categories.push(`${parseInt(d)}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Weekly':
                    this.findProjects()
                    this.createResult()
                    //sum of work in each week
                    gbMonth = this.groupBy(this.data, "month")
                    for (const m in gbMonth){
                        gbWeek = this.groupBy(gbMonth[m], "week")
                        for (const w in gbWeek){
                            this.gbName= this.groupBy(gbWeek[w], "name")
                            this.sumNP()

                            this.chartOptions.xAxis.categories.push(`week:${parseInt(w)}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Monthly':
                    this.findProjects()
                    this.createResult()
                    //sum of work in each month
                    gbMonth = this.groupBy(this.data, "month")
                    for (const m in gbMonth){
                        this.gbName= this.groupBy(gbMonth[m], "name")
                        this.sumNP()
                    
                        this.chartOptions.xAxis.categories.push(`month:${parseInt(m)}`)
                    }
                    break;

                default:
                    this.chartOptions.xAxis.categories = this.selectedNames
                    this.findProjects()
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
                    break;
            }

        },
        createDataP () {
            let sum
            let gbMonth,gbDate,gbWeek,gbDepartment
            let allSum = 0
            let i = 0
            let dpSum = []
            let dataArr = []
            let msg
            let msgArr = []
            switch (this.graphType) {
                case 'Daily':
                    gbMonth = this.groupBy(this.data, "month")
                    for (const m in gbMonth){
                        gbDate = this.groupBy(gbMonth[m], "date")
                        for (const d in gbDate){
                            this.gbProject = this.groupBy(gbDate[d], "project")
                            this.sumP()

                            this.chartOptions.xAxis.categories.push(`${d}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Weekly':
                    gbMonth = this.groupBy(this.data, "month")
                    for (const m in gbMonth){
                        gbWeek = this.groupBy(gbMonth[m], "week")
                        for (const w in gbWeek){
                            this.gbProject = this.groupBy(gbWeek[w], "project")
                            this.sumP()

                            this.chartOptions.xAxis.categories.push(`week:${w}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Monthly':
                    gbMonth = this.groupBy(this.data, "month")
                    for (const m in gbMonth){
                        this.gbProject = this.groupBy(gbMonth[m], "project")
                        this.sumP()

                        this.chartOptions.xAxis.categories.push(`month:${parseInt(m)}`) 
                    }
                    break;

                default:
                    // pie chart
                    this.pieChart = true
                    this.gbProject = this.groupBy(this.data, "project")
                    for (const p of this.selectedProjects){
                        if (this.gbProject[p]){
                            gbDepartment = this.groupBy(this.gbProject[p], "department")
                            allSum = 0
                            for (const dp in gbDepartment){
                                sum = 0 
                                for (const d of gbDepartment[dp]){
                                    sum = sum + parseFloat(d.work)
                                    allSum = allSum + parseFloat(d.work)
                                }
                                dpSum.push(sum)
                            }
                            dataArr =[]
                            msgArr = []
                            for (const dp in gbDepartment){
                                let percent
                                let obj = new Object()
                                obj.name = dp
                                percent = ((dpSum[i]/allSum) * 100).toFixed(2)
                                obj.y = parseFloat(percent)
                                dataArr.push(obj)
                                msg = `${dp}: <span class="blue--text">${dpSum[i]}</span> ${dpSum[i]>1? "days":"day"} (<span class="green--text">${dpSum[i]*8}</span> ${dpSum[i]*8>1? "hrs":"hr"})`
                                msgArr.push(msg)
                                i++
                            }
                            this.pieCharts.push({
                                chartOptions: {
                                    series: [{data: dataArr}],
                                    chart: {
                                        type: 'pie'
                                    },
                                    title: {
                                        text: p
                                    },
                                    plotOptions: {
                                        pie: {
                                            dataLabels: {
                                                formatter: function () {
                                                    return `${this.point.name} ( ${this.percentage.toFixed(2)} % )`
                                                },
                                            }
                                        }
                                    },
                                }}
                            )
                            this.pieProjectSum.push(msgArr)
                        }
                    }
                    break;
            }
        },
        createData () {
            let sum 
            let index = 0
            this.gbProject = this.groupBy(this.data, "project")
            this.selectedProjects = Object.keys(this.gbProject)
            this.createResult()
            for (const n of this.selectedProjects){
                for (const m of this.gbProject[n]){
                    sum = sum + parseFloat(m.work)
                }

                this.result[index].push(sum)
                sum=0
                index++
            }
            this.chartOptions.xAxis.categories = ["projects"]
        },
        async genProjectOpt () {
            this.selectedProjects = ''
            let res = await axios.get(sheetUrl + '/tabs/projectsSheet')  
            if (this.selectedNames.length > 0){
                this.projects = []
                for (const n of this.selectedNames){
                    for ( const p of res.data){
                        if (p[n] != ''){
                            this.projects.push(p[n])
                        }
                    }
                }
                this.projects.sort((a, b) => new Intl.Collator().compare(a, b))
            }else{
                this.projects = this.allProjects
            }
            this.checkGraphType()
        },
        checkGraphType () {
            if (this.selectedNames.length > 1){
                this.graphType = ''
            }
        },
        checkGraphTypeOpt () {
            let arr = this.changeFormat(this.dates)
            let firstArr = arr[0].split("-")
            let secondArr = arr[1].split("-")
            let days = moment([secondArr[0], secondArr[1], secondArr[2]]).diff(moment([firstArr[0], firstArr[1], firstArr[2]]), 'days')+1
            if (days > 150){
                this.graphTypes = ["Weekly", "Monthly"]
                if (this.graphType == "Daily"){
                    this.graphType = ''
                }
            }else{
                this.graphTypes = ["Daily", "Weekly", "Monthly"]
            }
        },
        sumP () {
            let sum = 0
            let index = 0
            for (const p of this.selectedProjects){
                if (this.gbProject[p]){
                    sum = 0
                    for (const n of this.gbProject[p] ){
                        sum = sum + parseFloat(n.work)
                    }
                    this.result[index].push(sum)
                }else{
                    this.result[index].push(0)
                }
                index++
            }
        },
        sumNP () {
            let sum
            let index = 0
            for (const n of this.selectedNames){
                if (this.gbName[n]){
                    index=0
                    this.gbProject = this.groupBy(this.gbName[n], "project")
                    for (const s of this.selectedProjects ){
                        if (this.gbProject[s]){
                            sum = 0
                            for (const p of this.gbProject[s]){
                                sum = sum + parseFloat(p.work)
                            }
                            this.result[index].push(sum)
                        }else{
                            this.result[index].push(0)
                        }
                        index++
                    }
                }
            }
        },
        findProjects () {
            //find the number of projects
            let arr = []
            let cateArr = []
            this.gbName = this.groupBy(this.data, "name")
            for (const n of this.selectedNames){
                arr = this.groupBy(this.gbName[n], "project")
                cateArr = cateArr.concat(Object.keys(arr))
            }
            this.selectedProjects = cateArr.filter(this.onlyUnique)
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
.pieChart-card {
    width: 50%;
    box-shadow: 0px 0px 0px 0px rgba(0,0,0,0) !important;
}
.pieChart-card-mobile {
    width: 100%;
    box-shadow: 0px 0px 0px 0px rgba(0,0,0,0) !important;
}
.project-list {
    max-height: 250px;
    overflow-x: auto;
    margin-bottom: 10px;
}
.list {
    min-width: 265px;
}
.overflow-chart {
    height: 600px;
    width: 180%;
}
.normal-chart {
    height: 600px;
    width: 100%;
}
.chart-div {
    height: 600px;
    overflow-x: scroll;
}
.view-btn:hover {
    background: #5DADE2;
    color: #ffff !important;
}

</style>