<template>
    <div :class="isMobile?'mobile-layout':'normal-layout'">
        <v-card :class="isMobile?'mobile-card':'normal-card'">
            <v-card-title class="text-h5
            text-sm-h4
            text-xl-h4
            pl-3">
            Submission</v-card-title>
            <v-form>
                <v-row class="ma-2">
                    <v-col cols="12" md="11">
                        <v-menu
                            v-model="menu"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    dense
                                    v-model="dateRangeText"
                                    label="Please select dates"
                                    prepend-icon="edit_calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                v-model="dates"
                                year-icon="mdi-calendar-blank"
                                prev-icon="arrow_back_ios"
                                next-icon="arrow_forward_ios"
                                full-width
                                range
                                :min="minDay"
                                :max="today"
                                @input="menu = false"
                            ></v-date-picker>
                        </v-menu>
                    </v-col>

                    <v-col
                    cols="12"
                    md="1"
                    align-self="center"
                    align="right"
                    class="pt-0 pb-5">
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

            <v-card v-if="dataShow.length > 0"
                class="table-card">
                <div style="overflow-x:auto;">
                    <table>
                        <tr>
                            <th class="pin-col">Name</th>
                            <th
                            v-for="(column, index) in dateRange"
                            v-bind:key="index">{{column.date}} {{column.monthShow}}</th>
                        </tr>
                        <tr
                        v-for="(name, n) in nameList"
                        v-bind:key="n">
                            <td class="name pin-col">{{name}}</td>
                            <td
                            v-for="(check, m) in dateRange"
                            v-bind:key="m"><v-icon
                            :color="dataShow[n][m]==0?'error':(dataShow[n][m]==1?'green':'orange')">{{dataShow[n][m]==0?"close":(dataShow[n][m]==1?"done":"access_alarm")}}</v-icon></td>
                        </tr>
                    </table>
                </div> 
            </v-card>
        </v-card>
    </div>
    
</template>

<script>
import moment from 'moment'
import axios from 'axios'
import { sheetUrl } from '../store/constants'

export default {
    components: {

    },
    beforeMount() {
        this.genMonthOpt()
        this.getName()
    },
    data: () => ({
        nameList: [],
        firstDay: '',
        firstMonth: '',
        lastDay: '',
        lastMonth: '',
        firstDateOpt: [],
        lastDateOpt: [],
        monthOpt: [],
        data: [],
        dateRange: [],
        dataShow: [],
        year: moment().format("YYYY"),
        isLoading: false,
        dates: [moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
        menu: false,
        today: moment().format('YYYY-MM-DD'),
        minDay: moment().startOf('year').format('YYYY-MM-DD')
    }),
    computed: {
        dateRangeText () {
            let formatted = [];
            for (const date of this.dates){
                formatted.push(moment(`${date}`).format('D MMMM YYYY'))
            }
            return formatted.join(' - ')
        },
        isMobile() {
            return this.$vuetify.breakpoint.mobile
        }
    },
    methods: {
        getName () {
            // tabs/sheetName
            axios.get(sheetUrl + '/tabs/nameSheet')
                .then(res => {
                    for (const n of res.data){
                        this.nameList.push(n.name)
                    }
                })
        },
        genFirstDateOpt (val) {
            this.firstMonth = val
            this.firstDay = ' '
            this.firstDateOpt = []
            let month = moment().format("M")
            parseInt(month)
            if (this.firstMonth != month){
                for (let i = 1; i <= parseInt(moment(`${this.year}-${this.firstMonth}`, "YYYY-M").daysInMonth()); i++){
                    this.firstDateOpt.push(i)
                }
            }else{
                for (let i = 1; i <= parseInt(moment().format('DD')); i++){
                    this.firstDateOpt.push(i)
                }
            }
        },
        genLastDateOpt (val) {
            this.lastMonth = val
            this.lastDay = ' '
            this.lastDateOpt = []
            let month = moment().format("MM")
            if (this.lastMonth != month){
                for (let i = 1; i <= parseInt(moment(`${this.year}-${this.lastMonth}`, "YYYY-M").daysInMonth()); i++){
                    this.lastDateOpt.push(i)
                }
            }else{
                for (let i = 1; i <= parseInt(moment().format('DD')); i++){
                    this.lastDateOpt.push(i)
                }
            }
        },
        genMonthOpt () {
            let month = moment().format("MM")
            parseInt(month)
            for (let i = 1;i <= month;i++){
                this.monthOpt.push(i)
            }
        },
        validate () {
            this.dataShow = []
            this.dateRange = []
            let firstArr, secondArr
            firstArr = this.dates[0].split("-")
            if (this.dates.length > 1){
                secondArr = this.dates[1].split("-")
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
        async getData () {
            this.data = []
            this.isLoading = true
            let res;
            if (this.firstDay == this.lastDay && this.firstMonth == this.lastMonth){
                // get a day
                res = await axios.get(sheetUrl + `/tabs/data_${this.year}/search?date=${this.firstDay}&month=${this.firstMonth}`)
                this.data = res.data
                this.findRange()
                this.checkData()
                this.isLoading = false
            }else{
                if (this.firstMonth == this.lastMonth){
                    // get a month
                    res = await axios.get(sheetUrl + `/tabs/data_${this.year}/search?month=${this.firstMonth}`)
                    this.data = res.data
                    this.filterData()
                    this.findRange()
                    this.checkData()
                    this.isLoading = false
                }else{
                    //get in range
                    res = await axios.get(sheetUrl + `/tabs/data_${this.year}/query?month=__gte(${this.firstMonth})&month=__lte(${this.lastMonth})`)
                    this.data = res.data
                    this.filterData()
                    this.findRange()
                    this.checkData()
                    this.isLoading = false
                }
            }
        },
        findRange () {
            if (this.firstDay == this.lastDay && this.firstMonth == this.lastMonth){
                this.dateRange.push({
                    date: this.firstDay,
                    month: this.firstMonth,
                    monthShow: moment(`${this.firstMonth}`).format('MMM')});
            }else{
                if (this.firstMonth == this.lastMonth){
                    for (let i = this.firstDay; i <= this.lastDay; i++){
                        if (moment(`${this.year}-${this.firstMonth}-${i}`).isoWeekday() != 6 && moment(`${this.year}-${this.firstMonth}-${i}`).isoWeekday() != 7){
                            this.dateRange.push({
                            date: i,
                            month: this.firstMonth,
                            monthShow: moment(`${this.firstMonth}`).format('MMM')})
                        }
                    }
                }else{
                    if (this.lastMonth-this.firstMonth == 1){
                        for (let i = this.firstDay; i <= parseInt(moment(`${this.year}-${this.firstMonth}`, "YYYY-M").daysInMonth()); i++){
                            if (moment(`${this.year}-${this.firstMonth}-${i}`).isoWeekday() != 6 && moment(`${this.year}-${this.firstMonth}-${i}`).isoWeekday() != 7){
                                this.dateRange.push({
                                date: i,
                                month: this.firstMonth,
                                monthShow: moment(`${this.firstMonth}`).format('MMM')})
                            }
                        }
                        for (let i = 1; i <= this.lastDay; i++){
                            if (moment(`${this.year}-${this.lastMonth}-${i}`).isoWeekday() != 6 && moment(`${this.year}-${this.lastMonth}-${i}`).isoWeekday() != 7){
                                this.dateRange.push({
                                date: i,
                                month: this.lastMonth,
                                monthShow: moment(`${this.lastMonth}`).format('MMM')})
                            }
                        }
                    }else{
                        //find the number of days
                        let monthDiff,d,m,dow;
                        let daySum = 0;
                        monthDiff = this.lastMonth - this.firstMonth
                        //the number of days in first month
                        daySum = parseInt(moment(`${this.year}-${this.firstMonth}`, "YYYY-M").daysInMonth()) - this.firstDay
                        //the number of days between first and last month
                        for (let i = 1; i < monthDiff; i++){
                            daySum = daySum + parseInt(moment(`${this.year}-${this.firstMonth+i}`, "YYYY-M").daysInMonth())
                        }
                        //the number of days in last month
                        daySum = daySum + this.lastDay
                        for (let i = 0; i <= daySum; i++){
                            d = moment(`${this.year}-${this.firstMonth}-${this.firstDay}`).add(i, 'days').format("D")
                            m = moment(`${this.year}-${this.firstMonth}-${this.firstDay}`).add(i, 'days').format("M")
                            dow = moment(`${this.year}-${this.firstMonth}-${this.firstDay}`).add(i, 'days').format("dddd")
                            if (!(dow == "Saturday" || dow == "Sunday")){
                                this.dateRange.push({
                                    date: d,
                                    month: m,
                                    monthShow: moment(`${m}`).format('MMM')})
                            }
                        }
                    }
                }
            }
        },
        filterData () {
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
        checkData () {
            this.dataShow = []
            let n,m;
            for (const name of this.nameList){
                this.dataShow.push(Array.from({length: this.dateRange.length}, (_, i) => 0))
            }
            for (const data of this.data){
                n = false
                m = false
                for (let i = 0; i < this.nameList.length; i++){
                    if (data.name == this.nameList[i]){
                        n = i
                        break;
                    }
                }
                for (let i = 0; i < this.dateRange.length; i++){
                    if (data.date == this.dateRange[i].date && data.month == this.dateRange[i].month){
                        m = i
                        break;
                    }
                }
                if (Number.isInteger(n) && Number.isInteger(m)){
                    if(data.remark == "Late"){
                        this.dataShow[n][m] = 2
                    }else{
                        this.dataShow[n][m] = 1
                    }
                }
            }
        }
    }
}
</script>

<style scoped>
.view-btn {
    align-items: center;
    display: flex;
}
.view-btn:hover {
    background: #5DADE2;
    color: #ffff !important;
}
.icon {
    justify-items: center;
}
.normal-card {
    margin: 10px !important;
    padding: 7px !important;
    box-shadow: 0px 0px 30px 0px rgba(0,0,0,0.35) !important;
    border-radius: 12px !important;
}
.mobile-card {
    padding: 7px !important;
    box-shadow: 0px 0px 0px 0px rgba(0,0,0,0) !important;
}
.table-card {
    text-align: center;
    justify-content: center;
    box-shadow: 0px 0px 20px 0px rgba(0,0,0,0.25) !important;
    margin: 10px !important;
    padding-left: 70px !important;
    border-radius: 20px !important;
}
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
.name {
    text-align: left;
}
.pin-col {
    width: auto; 
    position: absolute;
    margin-left: -70px;
}
table {
    width: auto;
    margin: 10px;
    margin-left: 3px;
    padding: 5px;
}
th {
    width: 30px;
    height: 48px;
    padding: 0 2px;
}
td {
    width: 30px;
    padding: 0 2px;
    text-align: center;
}

</style>