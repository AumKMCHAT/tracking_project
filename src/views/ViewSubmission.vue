<template>
    <div>
        <v-card>
            <v-card-title class="text-h4 pl-3">Submission</v-card-title>
            <v-form>
                <v-row class="ma-2">
                    <v-col>
                        <Select
                        :value="firstMonth"
                        :items="monthOpt"
                        rule="Month is required"
                        label="Month"
                        @onChange="genFirstDateOpt"
                        ></Select>
                    </v-col>

                    <v-col>
                        <Select
                        :value="firstDay"
                        :items="firstDateOpt"
                        rule="Date is required"
                        label="Date"
                        @onChange="firstDay=$event"
                        ></Select> 
                    </v-col>

                    <v-col
                    cols="auto"
                    align-self="center">
                        TO
                    </v-col>

                    <v-col>
                        <Select
                        :value="lastMonth"
                        :items="monthOpt"
                        rule="Month is required"
                        label="Month"
                        @onChange="genLastDateOpt"
                        ></Select>
                    </v-col>

                    <v-col>
                        <Select
                        :value="lastDay"
                        :items="lastDateOpt"
                        rule="Date is required"
                        label="Date"
                        @onChange="lastDay=$event"
                        ></Select>
                    </v-col>

                    <v-col
                    cols="auto"
                    align-self="center">
                        <v-btn
                        outlined
                        color="#5DADE2"
                        class="view-btn"
                        @click="validate">view</v-btn>
                    </v-col>
                    
                </v-row>
            </v-form>

            <v-card v-if="dataShow.length > 0" 
                class="ma-4">
                <v-row>
                    <v-col>Name</v-col>
                    <v-col
                    v-for="(column, index) in dateRange"
                    v-bind:key="index">{{column.date}}/{{column.month}}/{{year}}</v-col>
                </v-row>
                <div v-for="(name, n) in nameList"
                v-bind:key="n">
                <v-row>
                    <v-col>{{name}}</v-col>
                    <v-col
                    v-for="(check, m) in dateRange"
                    v-bind:key="m"
                    ><v-icon
                    >{{dataShow[n][m]==0?"close":(dataShow[n][m]==1?"done":"timelapse")}}</v-icon></v-col>
                </v-row></div>
            </v-card>
        </v-card>
    </div>
    
</template>

<script>
import moment from 'moment'
import axios from 'axios'
import { sheetUrl } from '../store/constants'
import Select from '../components/Select.vue'

export default {
    components: {
        Select
    },
    beforeMount() {
        this.genMonthOpt()
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
        year: moment().format("YYYY")
    }),
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
            this.getName()
            this.dataShow = []
            this.dateRange = []
            if (this.lastMonth < this.firstMonth){
                alert("incorrect range")
            }else{
                if (this.firstMonth == this.lastMonth){
                    if (this.lastDay < this.firstDay){
                        alert("incorrect range")
                    }else{
                        this.getData()
                    }
                }else{
                    this.getData()
                }
            }
        },
        async getData () {
            this.data = []
            let res;
            if (this.firstDay == this.lastDay && this.firstMonth == this.lastMonth){
                // get a day
                res = await axios.get(sheetUrl + `/tabs/data_${this.year}/search?date=${this.firstDay}&month=${this.firstMonth}`)
                this.data = res.data
                this.findRange()
                this.checkData()
            }else{
                if (this.firstMonth == this.lastMonth){
                    // get a month
                    res = await axios.get(sheetUrl + `/tabs/data_${this.year}/search?month=${this.firstMonth}`)
                    this.data = res.data
                    this.filterData()
                    this.findRange()
                    this.checkData()
                }else{
                    //get in range
                    res = await axios.get(sheetUrl + `/tabs/data_${this.year}/query?month=__gte(${this.firstMonth})&month=__lte(${this.lastMonth})`)
                    this.data = res.data
                    // console.log(this.data);
                    this.filterData()
                    this.findRange()
                    this.checkData()
                }
            }
        },
        findRange () {
            if (this.firstDay == this.lastDay && this.firstMonth == this.lastMonth){
                this.dateRange.push({
                    date: this.firstDay,
                    month: this.firstMonth})
            }else{
                if (this.firstMonth == this.lastMonth){
                    for (let i = this.firstDay; i <= this.lastDay; i++){
                        if (moment(`${this.year}-${this.firstMonth}-${i}`).isoWeekday() != 6 && moment(`${this.year}-${this.firstMonth}-${i}`).isoWeekday() != 7){
                            this.dateRange.push({
                            date: i,
                            month: this.firstMonth})
                        }
                    }
                }else{
                    if (this.lastMonth-this.firstMonth == 1){
                        for (let i = this.firstDay; i <= parseInt(moment(`${this.year}-${this.firstMonth}`, "YYYY-M").daysInMonth()); i++){
                            if (moment(`${this.year}-${this.firstMonth}-${i}`).isoWeekday() != 6 && moment(`${this.year}-${this.firstMonth}-${i}`).isoWeekday() != 7){
                                this.dateRange.push({
                                date: i,
                                month: this.firstMonth})
                            }
                        }
                        for (let i = 1; i <= this.lastDay; i++){
                            if (moment(`${this.year}-${this.lastMonth}-${i}`).isoWeekday() != 6 && moment(`${this.year}-${this.lastMonth}-${i}`).isoWeekday() != 7){
                                this.dateRange.push({
                                date: i,
                                month: this.lastMonth})
                            }
                        }
                        // console.log(this.dateRange);
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
                                    month: m})
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
            // console.log(a);
        },
        checkData () {
            this.dataShow = []
            let n,m;
            for (const name of this.nameList){
                this.dataShow.push(Array.from({length: this.dateRange.length}, (_, i) => 0))
            }
            console.log(this.dataShow[1]);
            for (const data of this.data){
                n = false
                m = false
                for (let i = 0; i < this.nameList.length; i++){
                    if (data.name == this.nameList[i]){
                        n = i
                        break;
                    }
                }
                console.log(this.dateRange.length);
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
            console.log(this.dataShow);
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

</style>