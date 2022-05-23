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
                    <v-col
                    cols="12" md="11">
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

                    <v-col
                    cols="12"
                    md="1"
                    align-self="center"
                    align="right"
                    class="mb-3">
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
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import { sheetUrl } from '../store/constants'

export default {
    components: {
        DatePicker 
    },
    beforeMount () {
        this.getName()
    },
    mounted () {
        this.validate()
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
        dates: [moment().subtract(30, 'days').format('D MMM YYYY'), moment().format('D MMM YYYY')],
        menu: false,
        today: moment().format('YYYY-MM-DD'),
        minDay: moment().startOf('year').format('YYYY-MM-DD')
    }),
    computed: {
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
                this.findRange()
                this.checkData()
                this.isLoading = false
            }else{
                if (this.firstMonth == this.lastMonth){
                    // get a month
                    res = await axios.get(sheetUrl + `/tabs/Per man/search?Month=${first}`)
                    this.data = res.data
                    this.filterData()
                    this.findRange()
                    this.checkData()
                    this.isLoading = false
                }else{
                    for (let i = this.firstMonth; i<= this.lastMonth; i++){
                        first = moment(`${i}`, 'M').format('MM MMM').toUpperCase().toString()
                        res = await axios.get(sheetUrl + `/tabs/Per man/search?Month=${first}`)
                        dataArr = dataArr.concat(res.data)
                    }
                    //get in range
                    this.data = dataArr
                    this.filterData()
                    this.findRange()
                    this.checkData()
                    this.isLoading = false
                }
            }
        },
        findRange () {
            let firstFormat = `${this.firstMonth}/${this.firstDay}/${this.year}`
            let lastFormat = `${this.lastMonth}/${this.firstDay}/${this.year}`
            if (this.firstDay == this.lastDay && this.firstMonth == this.lastMonth){
                this.dateRange.push({
                    date: this.firstDay,
                    month: this.firstMonth,
                    monthShow: moment(firstFormat).format('MMM')
                    });
            }else{
                if (this.firstMonth == this.lastMonth){
                    for (let i = this.firstDay; i <= this.lastDay; i++){
                        if (moment(`${this.firstMonth}/${i}/${this.year}`).format("dddd") != "Saturday"  && moment(`${this.firstMonth}/${i}/${this.year}`).format("dddd") != "Sunday"){
                            this.dateRange.push({
                            date: i,
                            month: this.firstMonth,
                            monthShow: moment(firstFormat).format('MMM')})
                        }
                    }
                }else{
                    if (this.lastMonth-this.firstMonth == 1){
                        for (let i = this.firstDay; i <= parseInt(moment(`${this.year}-${this.firstMonth}`, "YYYY-M").daysInMonth()); i++){
                            if (moment(`${this.firstMonth}/${i}/${this.year}`).format("dddd") != "Saturday"  && moment(`${this.firstMonth}/${i}/${this.year}`).format("dddd") != "Sunday"){
                                this.dateRange.push({
                                date: i,
                                month: this.firstMonth,
                                monthShow: moment(firstFormat).format('MMM')})
                            }
                        }
                        for (let i = 1; i <= this.lastDay; i++){
                            if (moment(`${this.lastMonth}/${i}/${this.year}`).format("dddd") != "Saturday"  && moment(`${this.lastMonth}/${i}/${this.year}`).format("dddd") != "Sunday"){
                                this.dateRange.push({
                                date: i,
                                month: this.lastMonth,
                                monthShow: moment(lastFormat).format('MMM')})
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
                            d = parseInt(moment(firstFormat).add(i, 'days').format("D"))
                            m = parseInt(moment(firstFormat).add(i, 'days').format("M"))
                            dow = moment(firstFormat).add(i, 'days').format("dddd")
                            if (!(dow == "Saturday" || dow == "Sunday")){
                                this.dateRange.push({
                                    date: d,
                                    month: m,
                                    monthShow: moment(`${m}/${d}/${this.year}`).format('MMM')})
                            }
                        }
                    }
                }
            }
        },
        filterData () {
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
        checkData () {
            this.dataShow = []
            let n,m, mm, month
            for (const name of this.nameList){
                this.dataShow.push(Array.from({length: this.dateRange.length}, (_, i) => 0))
            }
            for (const data of this.data){
                mm = data.Month.split(' ')
                month = parseInt(mm[0])
                n = false
                m = false
                for (let i = 0; i < this.nameList.length; i++){
                    if (data.NAME == this.nameList[i]){
                        n = i
                        break;
                    }
                }
                for (let i = 0; i < this.dateRange.length; i++){
                    if (data.Date == this.dateRange[i].date && month == this.dateRange[i].month){
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
        },
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
    margin: 20px !important;
    padding: 20px !important;
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
.date-picker {
    width: 100%;
    align-self: center;
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