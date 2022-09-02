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
        gbNameP: '',
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
            legend: {
                labelFormatter: function() {
                    if(this.userOptions.stack){
                        return this.name + ' (' + this.userOptions.stack + ')'
                    }else{
                        return this.name
                    }  
                }
            },
            tooltip: {
                formatter: function () {
                    if(this.series.userOptions.stack){
                        return '<b>' + this.x + '</b><br/>' +
                        'Name:' + this.series.name + ': ' + this.y + '<br/>' +
                        'Project: ' + this.series.userOptions.stack + '<br/>' +
                        'Total: ' + this.point.stackTotal ;
                    }else{
                        return '<b>' + this.x + '</b><br/>' +
                        'Project: ' + this.series.name + '<br/>' +
                        'Total: ' + this.point.stackTotal ;
                    }
                    
                        
                }
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
        dataProject: [],
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
            // axios.get(sheetUrl + '/tabs/nameSheet')
            var res = {"data": [
        {
            "name": "Earl",
            "department": "DEV"
        },
        {
            "name": "Namo",
            "department": "DEV"
        },
        {
            "name": "Men",
            "department": "DEV"
        },
        {
            "name": "Champ",
            "department": "DEV"
        },
        {
            "name": "Ton",
            "department": "DEV"
        },
        {
            "name": "Guitar",
            "department": "DEV"
        },
        {
            "name": "Pakad",
            "department": "GRAPHIC"
        },
        {
            "name": "Mew",
            "department": "BA"
        },
        {
            "name": "Ball",
            "department": "BA"
        },
        {
            "name": "Book",
            "department": "BA"
        },
        {
            "name": "Ice",
            "department": "BA"
        },
        {
            "name": "Nont",
            "department": "BA"
        }
    ],
    "status": 200,
    "statusText": "",
    "headers": {
        "content-length": "420",
        "content-type": "application/json",
        "x-connection-columns": "2",
        "x-connection-rows": "12",
        "x-ratelimit-limit": "50000",
        "x-ratelimit-plan": "PERSONAL",
        "x-ratelimit-remaining": "47512",
        "x-sheet-columns": "2",
        "x-sheet-rows": "12"
    },
    "config": {
        "transitional": {
            "silentJSONParsing": true,
            "forcedJSONParsing": true,
            "clarifyTimeoutError": false
        },
        "transformRequest": [
            null
        ],
        "transformResponse": [
            null
        ],
        "timeout": 0,
        "xsrfCookieName": "XSRF-TOKEN",
        "xsrfHeaderName": "X-XSRF-TOKEN",
        "maxContentLength": -1,
        "maxBodyLength": -1,
        "headers": {
            "Accept": "application/json, text/plain, */*"
        },
        "method": "get",
        "url": "https://sheet.best/api/sheets/b8d15c7d-2bb8-4d5e-8e08-8c8cf0004f6d/tabs/nameSheet"
    },
    "request": {}
    }
                
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
                
        },
        showDepartment (val) {
            for (const n of this.nameData){
                if (val == n.name){
                    return n.department
                }
            }
        },
        async getProjects () {
            // let res = await axios.get(sheetUrl + `/tabs/listProjects`)
            var res = {
    "data": [
        {
            "code": "000",
            "project": "Somboon"
        },
        {
            "code": "001",
            "project": "LabVet"
        },
        {
            "code": "003",
            "project": "MediFund"
        },
        {
            "code": "004",
            "project": "MedEC"
        },
        {
            "code": "005",
            "project": "OSCC"
        },
        {
            "code": "006",
            "project": "ASB-Accouting"
        },
        {
            "code": "007",
            "project": "BEDO-Data-MU"
        },
        {
            "code": "008",
            "project": "Elearning-MED"
        },
        {
            "code": "009",
            "project": "BEDO-AI-MU"
        },
        {
            "code": "010",
            "project": "DL-DASH-MU"
        },
        {
            "code": "011",
            "project": "LocKsi"
        },
        {
            "code": "012",
            "project": "RealEstate"
        },
        {
            "code": "013",
            "project": "AVEX"
        },
        {
            "code": "014",
            "project": "ASB-Market"
        },
        {
            "code": "015",
            "project": "Forrensic-MOPH"
        },
        {
            "code": "016",
            "project": "KCG"
        },
        {
            "code": "017",
            "project": "CCB"
        },
        {
            "code": "018",
            "project": "อะไหล่รถยนต์2022"
        },
        {
            "code": "019",
            "project": "Sony"
        },
        {
            "code": "020",
            "project": "Pmuc"
        },
        {
            "code": "022",
            "project": "MFEC"
        },
        {
            "code": "024",
            "project": "MVTV"
        },
        {
            "code": "025",
            "project": "NRIIS"
        },
        {
            "code": "026",
            "project": "LINE TV"
        },
        {
            "code": "027",
            "project": "PRH"
        },
        {
            "code": "028",
            "project": "ASB-Online"
        },
        {
            "code": "029",
            "project": "CTMS"
        },
        {
            "code": "031",
            "project": "Mideo-pod"
        },
        {
            "code": "032",
            "project": "NIA"
        },
        {
            "code": "033",
            "project": "TEDFUND"
        },
        {
            "code": "035",
            "project": "DITP"
        },
        {
            "code": "037",
            "project": "DOPA"
        },
        {
            "code": "039",
            "project": "ASB-Pool"
        },
        {
            "code": "040",
            "project": "Cleverse"
        },
        {
            "code": "041",
            "project": "E-learning pcm"
        },
        {
            "code": "042",
            "project": "KS-Holiday"
        },
        {
            "code": "043",
            "project": "KS-TakeLeave"
        },
        {
            "code": "044",
            "project": "Spy App"
        },
        {
            "code": "046",
            "project": "BCI"
        },
        {
            "code": "047",
            "project": "IS Checking"
        },
        {
            "code": "048",
            "project": "PMUC Robot KU"
        },
        {
            "code": "049",
            "project": "CEA-2022"
        },
        {
            "code": "050",
            "project": "ord-pmk"
        },
        {
            "code": "052",
            "project": "TAT Wallet"
        },
        {
            "code": "054",
            "project": "Best Buddy"
        },
        {
            "code": "057",
            "project": "Tracking Application"
        },
        {
            "code": "059",
            "project": "NA ROBOT"
        },
        {
            "code": "060",
            "project": "Automation platform"
        },
        {
            "code": "061",
            "project": "E-learning Caribar"
        },
        {
            "code": "062",
            "project": "Drowning2022"
        },
        {
            "code": "063",
            "project": "KISRA ขอทุนกสทช"
        },
        {
            "code": "064",
            "project": "KISRA Guard tour"
        },
        {
            "code": "065",
            "project": "คลีนิคผู้สูงอายุ"
        },
        {
            "code": "066",
            "project": "rti sat"
        },
        {
            "code": "067",
            "project": "SAT Dashboard"
        },
        {
            "code": "068",
            "project": "NTS.click"
        },
        {
            "code": "071",
            "project": "Application Sleep"
        },
        {
            "code": "072",
            "project": "KU Forest"
        },
        {
            "code": "074",
            "project": "KISRAขอทุนม.เกษตร"
        },
        {
            "code": "075",
            "project": "Dtac webinar"
        },
        {
            "code": "076",
            "project": "TNL-PH2"
        },
        {
            "code": "077",
            "project": "CEA-Web"
        },
        {
            "code": "078",
            "project": "dlbaseline"
        },
        {
            "code": "079",
            "project": "Farmik Presentation"
        },
        {
            "code": "080",
            "project": "Connect-X"
        },
        {
            "code": "081",
            "project": "Elearning-กยศ"
        },
        {
            "code": "083",
            "project": "Telemed"
        },
        {
            "code": "084",
            "project": "Thonburi hospital"
        },
        {
            "code": "086",
            "project": "PMUC farmbot"
        },
        {
            "code": "087",
            "project": "KISRA ประชุมประจำเดือน"
        },
        {
            "code": "088",
            "project": "helmet"
        },
        {
            "code": "089",
            "project": "drone"
        },
        {
            "code": "090",
            "project": "OSCC Chatinbox"
        },
        {
            "code": "091",
            "project": "AIS virtual"
        },
        {
            "code": "092",
            "project": "RoomQuest-Sales"
        },
        {
            "code": "093",
            "project": "Gym(JP)"
        },
        {
            "code": "094",
            "project": "ทรัพย์สถาพร"
        },
        {
            "code": "095",
            "project": "Insomnia"
        },
        {
            "code": "096",
            "project": "Jitta"
        },
        {
            "code": "097",
            "project": "dtac"
        }
    ],
    "status": 200,
    "statusText": "",
    "headers": {
        "content-length": "1006",
        "content-type": "application/json",
        "x-connection-columns": "2",
        "x-connection-rows": "80",
        "x-ratelimit-limit": "50000",
        "x-ratelimit-plan": "PERSONAL",
        "x-ratelimit-remaining": "47512",
        "x-sheet-columns": "2",
        "x-sheet-rows": "80"
    },
    "config": {
        "transitional": {
            "silentJSONParsing": true,
            "forcedJSONParsing": true,
            "clarifyTimeoutError": false
        },
        "transformRequest": [
            null
        ],
        "transformResponse": [
            null
        ],
        "timeout": 0,
        "xsrfCookieName": "XSRF-TOKEN",
        "xsrfHeaderName": "X-XSRF-TOKEN",
        "maxContentLength": -1,
        "maxBodyLength": -1,
        "headers": {
            "Accept": "application/json, text/plain, */*"
        },
        "method": "get",
        "url": "https://sheet.best/api/sheets/b8d15c7d-2bb8-4d5e-8e08-8c8cf0004f6d/tabs/listProjects"
    },
    "request": {}
    }
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
            let res, first;
            let dataArr = []
            first = moment(`${this.firstMonth}`, 'M').format('MM MMM').toUpperCase().toString()
            if (this.firstDay == this.lastDay && this.firstMonth == this.lastMonth){
                // get a day
                res = await axios.get(sheetUrl + `/tabs/Per man/search?Date=${this.firstDay}&Month=${first}`)
                this.data = res.data
                this.createResult()
                this.filterData()
                this.isLoading = false
            }else{
                if (this.firstMonth == this.lastMonth){
                    // get a month
                    // res = await axios.get(sheetUrl + `/tabs/Per man/query?Month=${first}&Date=__gte(${this.firstDay})&Date=__lte(${this.lastDay})`)
                    res = {
    "data": [
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KS-TakeLeave",
            "Work": "1",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KS-TakeLeave",
            "Work": "1",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Jitta-DipChip",
            "Work": "0.625",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "LabVet",
            "Work": "0.25",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "F-card",
            "Work": "0.125",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "1",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "DITP",
            "Work": "0.1875",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.125",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "ktc cookie consent",
            "Work": "0.6875",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "1",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Drone",
            "Work": "1",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Mideo-pod",
            "Work": "1",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Mideo-pod",
            "Work": "1",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "0.1875",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.8125",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.25",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "0.75",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "1",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "1",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "dtac",
            "Work": "1",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "dtac",
            "Work": "1",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Jitta-DipChip",
            "Work": "1",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.5",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.5",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.3125",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.375",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.3125",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "HelloCst",
            "Work": "0.25",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.75",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.625",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.25",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.125",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.375",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.625",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.375",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Drone",
            "Work": "0.625",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "DITP",
            "Work": "0.125",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.625",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "TNL-PH2",
            "Work": "0.25",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.25",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "TNL-PH2",
            "Work": "0.75",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "TNL-PH2",
            "Work": "1",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "0.875",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.125",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "E-learning pcm",
            "Work": "1",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Mideo-pod",
            "Work": "1",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.75",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.125",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "ktc cookie consent",
            "Work": "0.0625",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "DITP",
            "Work": "0.0625",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.75",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "labvet",
            "Work": "0.125",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "BEDO-BANK-65",
            "Work": "0.125",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "1",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.625",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.375",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "HelloCst",
            "Work": "0.0625",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.4375",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "irpc",
            "Work": "0.5",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.375",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.625",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "dtac",
            "Work": "0.8125",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "ord-pmk",
            "Work": "0.125",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "HelloCst",
            "Work": "0.0625",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "dtac",
            "Work": "1",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "0.3125",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "2",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.6875",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "0.75",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "3",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.25",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KISRA ประชุมประจำเดือน",
            "Work": "1",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "0.75",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.1875",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.0625",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "irpc",
            "Work": "0.375",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.625",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Mideo-pod",
            "Work": "0.5",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.5",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "1",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "1",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.875",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KISRA ประชุมประจำเดือน",
            "Work": "0.125",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "irpc",
            "Work": "0.5",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.5",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "0.25",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CKAN",
            "Work": "0.75",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "E-learning pcm",
            "Work": "0.5",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.25",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.25",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "dtac",
            "Work": "1",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "F-card",
            "Work": "0.3125",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "E-learning pcm",
            "Work": "0.1875",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.25",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Jitta-DipChip",
            "Work": "0.25",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "TNL V2",
            "Work": "0.625",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.375",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "TNL V2",
            "Work": "0.375",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.5",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.125",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.375",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.625",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "1",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "1",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.625",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.25",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.125",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.875",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "labvet",
            "Work": "0.0625",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "BEDO-BANK-65",
            "Work": "0.0625",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "1",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "1",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "4",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "TNL-PH2",
            "Work": "1",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "5",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "F-card",
            "Work": "1",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "1",
            "Week": "1",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "1",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "1",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "0.5",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.5",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.5",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.375",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "BEDO-BANK-65",
            "Work": "0.125",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "1",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "1",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "irpc",
            "Work": "0.5",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.375",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "ASB-Accouting",
            "Work": "0.125",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Jitta-DipChip",
            "Work": "1",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "dtac",
            "Work": "1",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.125",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.875",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.125",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "0.625",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KISRA ประชุมประจำเดือน",
            "Work": "0.25",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "1",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.9375",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "0.0625",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "1",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "dtac",
            "Work": "1",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "1",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "somboon",
            "Work": "0.125",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.0625",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Jitta-DipChip",
            "Work": "0.8125",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.75",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.25",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.5",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.125",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.375",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "1",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.25",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KISRA ประชุมประจำเดือน",
            "Work": "0.3125",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.4375",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "8",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "TNL-PH2",
            "Work": "1",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "TNL-PH2",
            "Work": "1",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "TNL V2",
            "Work": "1",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.9375",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Mideo-pod",
            "Work": "0.0625",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "0.5",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Pmuc",
            "Work": "0.5",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "irpc",
            "Work": "0.125",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.625",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "ord-pmk",
            "Work": "0.25",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "1",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "dtac",
            "Work": "0.625",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "MedEC",
            "Work": "0.125",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KISRA ประชุมประจำเดือน",
            "Work": "0.0625",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Pmuc",
            "Work": "0.1875",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.5",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.4375",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "labvet",
            "Work": "0.0625",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.75",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.125",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.125",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "0.9375",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.0625",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KS-TakeLeave",
            "Work": "1",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.125",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "F-card",
            "Work": "0.1875",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Jitta-DipChip",
            "Work": "0.5",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "10",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "NSTCustomer",
            "Work": "0.1875",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.125",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.75",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.125",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.5",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "F-Card",
            "Work": "0.5",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Sleep App",
            "Work": "1",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "TNL-PH2",
            "Work": "0.125",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "F-card",
            "Work": "0.25",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.625",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "dtac",
            "Work": "1",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.75",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.25",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KS-Holiday",
            "Work": "1",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "1",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "1",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "1",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KS-Holiday",
            "Work": "1",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KS-Holiday",
            "Work": "1",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KS-Holiday",
            "Work": "1",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KS-Holiday",
            "Work": "1",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "1",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "NSTCustomer",
            "Work": "0.75",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Jitta-DipChip",
            "Work": "0.25",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KS-Holiday",
            "Work": "1",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "11",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "TNL V2",
            "Work": "1",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "TNL V2",
            "Work": "1",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.875",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "labvet",
            "Work": "0.0625",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.0625",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "dtac",
            "Work": "1",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.5",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "0.125",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.25",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "KISRA ประชุมประจำเดือน",
            "Work": "0.125",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KS-Holiday",
            "Work": "1",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "TNL-PH2",
            "Work": "0.625",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "F-card",
            "Work": "0.375",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.75",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "irpc",
            "Work": "0.125",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "HelloCst",
            "Work": "0.125",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.625",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.1875",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "ktc cookie consent",
            "Work": "0.125",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "RealEstate",
            "Work": "0.0625",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "1",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Jitta-DipChip",
            "Work": "0.75",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "LabVet",
            "Work": "0.25",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "1",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KS-Holiday",
            "Work": "1",
            "NAME": "Pakad",
            "Department": "GRAPHIC",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.75",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "F-Card",
            "Work": "0.25",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "1",
            "NAME": "Nont",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "0.125",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.875",
            "NAME": "Namo",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "12",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "KS-Holiday",
            "Work": "1",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "0.1875",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.8125",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "IRPC",
            "Work": "0.1875",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Farmbot-sweet potato",
            "Work": "0.8125",
            "NAME": "Book",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "1",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "KU forest",
            "Work": "0.9375",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Pmuc",
            "Work": "0.0625",
            "NAME": "Guitar",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.375",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "irpc",
            "Work": "0.5",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "HelloCst",
            "Work": "0.125",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "dtac",
            "Work": "0.625",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "HelloCst",
            "Work": "0.375",
            "NAME": "Mew",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.375",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "labvet",
            "Work": "0.125",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "KU Forest",
            "Work": "0.5",
            "NAME": "Ice",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "TNL V2",
            "Work": "1",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "TNL V2",
            "Work": "0.75",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.25",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.375",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.125",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "15",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "OSCC Chatinbox",
            "Work": "0.5",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": "",
            "Remark": "Late"
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.625",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.375",
            "NAME": "Ball",
            "Department": "BA",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "Jitta-DipChip",
            "Work": "0.25",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "LabVet",
            "Work": "0.0625",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "NSTCustomer",
            "Work": "0.375",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "FCard",
            "Work": "0.1875",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.0625",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "somboon",
            "Work": "0.0625",
            "NAME": "Earl",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "TNL-PH2",
            "Work": "0.75",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "16",
            "Week": "3",
            "Month": "08 AUG",
            "Project": "F-card",
            "Work": "0.25",
            "NAME": "Men",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "OSCC",
            "Work": "0.25",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "Somboon",
            "Work": "0.75",
            "NAME": "Ton",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "irpc",
            "Work": "0.125",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "CEA-2022",
            "Work": "0.75",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        },
        {
            "Timestamp": "",
            "Date": "9",
            "Week": "2",
            "Month": "08 AUG",
            "Project": "ord-pmk",
            "Work": "0.125",
            "NAME": "Champ",
            "Department": "DEV",
            "แจ้งโปรเจ็คใหม่": null,
            "Remark": null
        }
    ],
    "status": 200,
    "statusText": "",
    "headers": {
        "content-length": "2629",
        "content-type": "application/json",
        "x-connection-columns": "10",
        "x-connection-rows": "268",
        "x-ratelimit-limit": "50000",
        "x-ratelimit-plan": "PERSONAL",
        "x-ratelimit-remaining": "47782",
        "x-sheet-columns": "10",
        "x-sheet-rows": "268"
    },
    "config": {
        "transitional": {
            "silentJSONParsing": true,
            "forcedJSONParsing": true,
            "clarifyTimeoutError": false
        },
        "transformRequest": [
            null
        ],
        "transformResponse": [
            null
        ],
        "timeout": 0,
        "xsrfCookieName": "XSRF-TOKEN",
        "xsrfHeaderName": "X-XSRF-TOKEN",
        "maxContentLength": -1,
        "maxBodyLength": -1,
        "headers": {
            "Accept": "application/json, text/plain, */*"
        },
        "method": "get",
        "url": "https://sheet.best/api/sheets/b8d15c7d-2bb8-4d5e-8e08-8c8cf0004f6d/tabs/Per man/search?Month=08 AUG"
    },
    "request": {}
}
                    this.data = res.data
                    this.createResult()
                    this.filterData()
                    this.isLoading = false
                }else{
                    //get in range
                    for (let i = this.firstMonth; i<= this.lastMonth; i++){
                        first = moment(`${i}`, 'M').format('MM MMM').toUpperCase().toString()
                        res = await axios.get(sheetUrl + `/tabs/Per man/search?Month=${first}`)
                        dataArr = dataArr.concat(res.data)
                    }
                    //filterdate 
                    this.data = dataArr
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
            this.dataProject = []
            this.chartOptions.xAxis.categories = []
            let datesArr = this.changeFormat(this.dates)
            let firstArr, secondArr
            firstArr = datesArr[0].split("-")
            secondArr = datesArr[1].split("-")
            this.firstDay = parseInt(firstArr[2])
            this.firstMonth = parseInt(firstArr[1])
            this.lastDay = parseInt(secondArr[2])
            this.lastMonth = parseInt(secondArr[1])
            this.getData()
        },
        filterData () {
            if (this.selectedNames.length > 0){
                if (this.selectedProjects.length > 0){
                    // select name and project
                    this.createDataNP()
                    this.createSeries()
                    this.createSortMsgAll()
                }else{
                    //select name
                    this.createDataN()
                    this.createSeries()
                    this.selectedProjects = []
                    this.createSortMsgAll()
                }
            }else{
                if (this.selectedProjects.length > 0){
                    //select project
                    this.createDataP()
                    if (!this.pieChart){
                        this.createSeriesP()  
                    }
                    this.createSortMsgP ()
                }else{
                    //select date range
                    this.createData()
                    this.createSeries()
                    this.selectedProjects = []
                    this.createSortMsgAll()
                }
            }
            
            // if (!this.pieChart){
            //     for (const p of this.chartOptions.series){
            //         sum = p.data.reduce((a, b) => a + b, 0)
            //         msg = `${p.name}: <span class="blue--text">${sum}</span> ${sum>1? "days ":"day "}(<span class="green--text">${sum*8}</span> ${sum*8>1?"hrs":"hr"})`
            //         this.projectsSum.push(msg)
            //     }  
            // }
            
    
        },
        createSortMsgAll () {
            let msg = ''
            let sum = 0
            if (!this.pieChart){
                // sort by this.chartOptions.series.data.reduce((a, b) => a + b, 0)
                let chartSeriesCopy = this.chartOptions.series
                let total_hr = 0
                chartSeriesCopy.sort( function(a,b) { return b.data.reduce((a,b) => a+b,0) - a.data.reduce((a,b) => a+b,0) } )
                for (const p of chartSeriesCopy) {
                    sum = (p.data.reduce((a, b) => a + b, 0))*8
                    if (!isNaN(sum)) {
                       total_hr += sum 
                    }
                }
                for (const p of chartSeriesCopy){
                    sum = parseFloat(p.data.reduce((a, b) => a + b, 0).toFixed(2))
                    let percent = (sum*8)/total_hr * 100
                    msg = `${p.name}: <span class="blue--text">${sum}</span> ${sum>1? "days ":"day "}(<span class="green--text">${sum*8}</span> ${sum*8>1?"hrs":"hr"}) (<span class="purple--text">${percent.toFixed(2)}%</span>)`
                    this.projectsSum.push(msg)
                }
               
            }

        },


        createSortMsgP (){
            let msg = ''
            let sum = 0
            let sortSum = []
            if (!this.pieChart){
                for (const d of this.selectedProjects){
                    sortSum.push ([d , 0])
                }
                for (const p of this.chartOptions.series){
                    for (const dataP of sortSum){
                        if (p.stack == dataP[0]){
                            dataP[1] = parseFloat(dataP[1]) + parseFloat(p.data)
                        }
                    }
                    sum = parseFloat(sum) + parseFloat(p.data)
                    sortSum.sort((a, b) => b[1]-a[1] )
                }
                for (const p of sortSum){
                    let percentP = 0
                    percentP = (p[1]*100) / sum
                     msg = `${p[0]}: <span class="blue--text">${p[1].toFixed(2)}</span> ${p[1]>1? "days ":"day "}(<span class="green--text">${(p[1]*8).toFixed(2)}</span>) ${p[1]*8>1?"hrs":"hr"}  (<span class="red--text">${percentP.toFixed(2)} %</span>)`
                    this.projectsSum.push(msg)
                }
                 
            }
        },

        filterDate () {
            let a = [];
            let m, month
            for (const item of this.data){
                m = item.Month.split(' ')
                month = parseInt(m[0])
                if (month > this.firstMonth && month < this.lastMonth){
                    a.push(item)
                }else{
                    if (month == this.firstMonth){
                        if (item.Date >= this.firstDay){
                            a.push(item)
                        }
                    }else{
                        if (month == this.lastMonth){
                            if (item.Date <= this.lastDay){
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
                obj.stack = ""
                this.chartOptions.series.push(obj)
                index++
            }
            this.chartOptions.title.text = this.formatDateShow()
            this.isLoading = false
        },

        createSeriesP () {
            let index = 0
            let rawData = []
            
            for (const p of this.dataProject){
                let arrayProject = []
                let obj = new Object()
                obj.name = p.NAME
                arrayProject.push(parseFloat(p.Work))
                obj.data = arrayProject
                obj.stack = p.Project
                rawData.push(obj)
            }

            rawData.forEach(x => {               
                const obj =  this.chartOptions.series.find(dataP => dataP.name === x.name && dataP.stack === x.stack);
                if (obj) {
                    obj.data.push(x.data[0])
                } else {
                    this.chartOptions.series.push(x)
                }
            });
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
                    gbMonth = this.groupBy(this.data, "Month")
                    for (const m in gbMonth){
                        gbDate = this.groupBy(gbMonth[m], "Date")
                        for (const d in gbDate){
                            this.gbName= this.groupBy(gbDate[d], "NAME")
                            this.sumNP()

                            this.chartOptions.xAxis.categories.push(`${parseInt(d)}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Weekly':
                    //sum of work in each week
                    gbMonth = this.groupBy(this.data, "Month")
                    for (const m in gbMonth){
                        gbWeek = this.groupBy(gbMonth[m], "Week")
                        for (const w in gbWeek){
                            this.gbName= this.groupBy(gbWeek[w], "NAME")
                            this.sumNP()

                            this.chartOptions.xAxis.categories.push(`week:${parseInt(w)}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Monthly':
                    //sum of work in each month
                    gbMonth = this.groupBy(this.data, "Month")
                    for (const m in gbMonth){
                            this.gbName= this.groupBy(gbMonth[m], "NAME")
                            this.sumNP()

                            this.chartOptions.xAxis.categories.push(`month:${parseInt(m)}`)
                    }
                    break;

                default:
                    this.chartOptions.xAxis.categories = this.selectedNames
                    this.gbName = this.groupBy(this.data, "NAME")
                    for (const p of this.selectedProjects){
                        for (const n of this.selectedNames){
                            sum = 0
                            if (this.gbName[n]){
                                arr = this.groupBy(this.gbName[n], "Project")
                                if (!arr[p]){
                                    sum = 0
                                }else{
                                    for (const num of arr[p]){
                                        sum = sum + parseFloat(num.Work)
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
                    gbMonth = this.groupBy(this.data, "Month")
                    for (const m in gbMonth){
                        gbDate = this.groupBy(gbMonth[m], "Date")
                        for (const d in gbDate){
                            this.gbName= this.groupBy(gbDate[d], "NAME")
                            this.sumNP()

                            this.chartOptions.xAxis.categories.push(`${parseInt(d)}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Weekly':
                    this.findProjects()
                    this.createResult()
                    //sum of work in each week
                    gbMonth = this.groupBy(this.data, "Month")
                    for (const m in gbMonth){
                        gbWeek = this.groupBy(gbMonth[m], "Week")
                        for (const w in gbWeek){
                            this.gbName= this.groupBy(gbWeek[w], "NAME")
                            this.sumNP()

                            this.chartOptions.xAxis.categories.push(`week:${parseInt(w)}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Monthly':
                    this.findProjects()
                    this.createResult()
                    //sum of work in each month
                    gbMonth = this.groupBy(this.data, "Month")
                    for (const m in gbMonth){
                        this.gbName= this.groupBy(gbMonth[m], "NAME")
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
                                arr = this.groupBy(this.gbName[n], "Project")
                                if (!arr[p]){
                                    sum = 0
                                }else{
                                    for (const num of arr[p]){
                                        sum = sum + parseFloat(num.Work)
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
                    gbMonth = this.groupBy(this.data, "Month")
                    for (const m in gbMonth){
                        gbDate = this.groupBy(gbMonth[m], "Date")
                        for (const d in gbDate){
                            this.gbProject = this.groupBy(gbDate[d], "Project")
                            this.sumP()

                            this.chartOptions.xAxis.categories.push(`${d}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Weekly':
                    gbMonth = this.groupBy(this.data, "Month")
                    for (const m in gbMonth){
                        gbWeek = this.groupBy(gbMonth[m], "Week")
                        for (const w in gbWeek){
                            this.gbProject = this.groupBy(gbWeek[w], "Project")
                            this.sumP()

                            this.chartOptions.xAxis.categories.push(`week:${w}/${parseInt(m)}`)
                        }
                    }
                    break;

                case 'Monthly':
                    gbMonth = this.groupBy(this.data, "Month")
                    for (const m in gbMonth){
                        this.gbProject = this.groupBy(gbMonth[m], "Project")
                        this.sumP()

                        this.chartOptions.xAxis.categories.push(`month:${parseInt(m)}`) 
                    }
                    break;

                default:
                    // pie chart
                    this.pieChart = true
                    this.gbProject = this.groupBy(this.data, "Project")
                    for (const p of this.selectedProjects){
                        if (this.gbProject[p]){
                            gbDepartment = this.groupBy(this.gbProject[p], "Department")
                            allSum = 0
                            for (const dp in gbDepartment){
                                sum = 0 
                                for (const d of gbDepartment[dp]){
                                    sum = sum + parseFloat(d.Work)
                                    allSum = allSum + parseFloat(d.Work)
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
            this.gbProject = this.groupBy(this.data, "Project")
            this.selectedProjects = Object.keys(this.gbProject)
            this.createResult()
            for (const n of this.selectedProjects){
                for (const m of this.gbProject[n]){
                    sum = sum + parseFloat(m.Work)
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
            //check available graph types by number of days 
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

        calDataP (obj , gbProjectData) {
            // sum work form empolyess name
            if (obj) {
                obj.Work = parseFloat(obj.Work) + parseFloat(gbProjectData.Work)
                obj.Work = obj.Work.toFixed(2)
            } else {
                this.dataProject.push(gbProjectData);
            }
        },

        sumP () {
            //sum works from project
            let sum = 0
            let index = 0
            
            // for (const p of this.selectedProjects){
            //     if (this.gbProject[p]){
            //         sum = 0
            //         // this.gbNameP = this.groupBy(this.gbProject[p] , "NAME")
            //         for (const n of this.gbProject[p] ){
            //             sum = sum + parseFloat(n.Work)
            //         }
            //         this.result[index].push(sum)
            //     }else{
            //         this.result[index].push(0)
            //     }
            //     index++
            // }

            for (const p1 of this.selectedProjects){
                if (this.gbProject[p1]){
                    
                    switch (this.graphType){
                        case 'Daily' :
                            this.gbProject[p1].forEach(gbProjectData => {               
                                const obj =  this.dataProject.find(dataP => dataP.NAME === gbProjectData.NAME && dataP.Project === gbProjectData.Project && dataP.Date === gbProjectData.Date);
                                this.calDataP(obj , gbProjectData)
                            });
                            break;
                        case 'Weekly' :
                            this.gbProject[p1].forEach(gbProjectData => {               
                                const obj =  this.dataProject.find(dataP => dataP.NAME === gbProjectData.NAME && dataP.Project === gbProjectData.Project && dataP.Week === gbProjectData.Week);
                                this.calDataP(obj , gbProjectData)
                            });
                            break;
                        case 'Monthly' :
                            this.gbProject[p1].forEach(gbProjectData => {               
                                const obj =  this.dataProject.find(dataP => dataP.NAME === gbProjectData.NAME && dataP.Project === gbProjectData.Project);
                                this.calDataP(obj , gbProjectData)
                            });
                            break;
                   }
                }
            }
        },
        sumNP () {
            //sum works from name and project
            let sum
            let index = 0
            for (const n of this.selectedNames){
                if (this.gbName[n]){
                    index=0
                    this.gbProject = this.groupBy(this.gbName[n], "Project")
                    for (const s of this.selectedProjects ){
                        if (this.gbProject[s]){
                            sum = 0
                            for (const p of this.gbProject[s]){
                                sum = sum + parseFloat(p.Work)
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
            this.gbName = this.groupBy(this.data, "NAME")
            for (const n of this.selectedNames){
                arr = this.groupBy(this.gbName[n], "Project")
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