<template>
    <div class="pa-3 main-layout fill-height">
        <div
        v-if="secretPass != passwordC && secretPass != passwordKey"
        align="center">
        <v-card
        class="password-card pa-4"
        :width="isMobile?'300px':'500px'"
        >
            <v-row
            class="pa-3">
                <v-alert class="col-12"
                    dense dismissible
                    close-icon="close"
                    border="left"
                    icon="error_outline"
                    :value="confirmClick"
                    type="warning"
                    @input="confirmClick=false"
                    >incorrect password</v-alert>
                <v-card-text
                class="pa-0"><h2>Please input password to access this page</h2></v-card-text>                
            </v-row>

            <v-row
            class="pa-3">
                <v-col 
                sm="9"
                cols="12"
                class="pr-0">
                    <v-text-field
                    hide-details
                    class="password-box pa-2"
                    :append-icon="show ? 'visibility' : 'visibility_off'"
                    v-model="inputPass"
                    label="Password"
                    :type="show ? 'text' : 'password'"
                    @click:append="show = !show"
                    v-on:keyup.enter="confirm"
                    placeholder="Please input the password to access this page">
                    </v-text-field>                       
                </v-col>

                <v-col
                align-self="center"
                sm="3"
                cols="12">
                    <v-btn
                    class="confirm-btn"
                    rounded
                    @click="confirm">confirm</v-btn>                         
                </v-col>

            </v-row>    
        </v-card>
        </div>

        <div
        v-if="secretPass == passwordC || secretPass == passwordKey"
        :class="isMobile?'mobile-div':''">
            <v-card class="waiting-card">
                <v-row
                class="pb-3 pt-3">
                    <v-col
                    class="text-left pl-7">
                      <h2>Pending Approval</h2>  
                    </v-col>
                    
                    <v-col
                    cols="4"
                    class="pr-5">
                        <v-text-field
                        v-model="search"
                        append-icon="search"
                        label="Search"
                        single-line
                        hide-details
                        class="pt-0 mt-0"
                        ></v-text-field>                        
                    </v-col>

                </v-row>
                <v-data-table
                v-model="selected"
                :headers="waitingHeader"
                :items="waitingData"    
                :items-per-page="-1"
                show-select
                item-key="index"
                class="elevation-1 data-table">
                <!-- eslint-disable -->
                    <template v-slot:item.status="{ item }">
                        <span class="blue--text">{{ item.status }}</span>
                    </template>
                </v-data-table>

                <v-layout justify-end>
                    <v-flex shrink>
                        <v-btn
                        color="error"
                        class="mr-2 mb-2 mt-3"
                        rounded
                        :disabled="selected.length == 0"
                        @click="deny">Deny</v-btn>
                        <v-btn
                        color="success" 
                        class="mb-2 mt-3"
                        rounded
                        :disabled="selected.length == 0"
                        @click="approve">Approve</v-btn>
                    </v-flex>
                </v-layout>
            </v-card>

            <v-card class="approved-card">
                <v-row
                class="pb-3 pt-3">
                    <v-col
                    class="text-left pl-7">
                      <h2>History</h2>  
                    </v-col>
                    
                    <v-col
                    cols="4"
                    class="pr-5">
                        <v-text-field
                        v-model="historySearch"
                        append-icon="search"
                        label="Search"
                        single-line
                        hide-details
                        class="pt-0 mt-0"
                        ></v-text-field>                        
                    </v-col>

                </v-row>
                <v-data-table
                :search="historySearch"
                :headers="historyHeader"
                :items="historyData"
                :items-per-page="isMobile?2:5"
                mobile-breakpoint="0"
                class="elevation-1 data-table">
                    <template v-slot:item.status="{ item }">
                        <span :class="item.status=='approved'?'green--text':'red--text'">{{ item.status }}</span>
                    </template>
                </v-data-table>
            </v-card>
        </div>
    </div>
</template>

<script>
import moment from 'moment'
import axios from 'axios'
import Swal from 'sweetalert2'
import { sheetUrl, leaveSheetUrl , secretPass} from '../store/constants'
import {mapState} from 'vuex'

export default {
    name: 'ViewLeave',
    beforeMount() {
        if (secretPass == this.passwordC || secretPass == this.passwordKey) {
            this.getData()
        }
    },
    computed: {
        isMobile() {
            return this.$vuetify.breakpoint.mobile
        },  
        ...mapState({
            passwordKey: state => state.password.passwordKey
        }),
    },
    data: () => ({
        data: [],
        dataStatus: '',
        historyData: [],
        waitingData: [],
        waitingHeader: [
            {text: 'Order', value: 'index', align: 'center'},
            {text: 'TimeStamp', value: 'timestamp', sortable: false, align: 'center'}, 
            {text: 'Name', value: 'name', align: 'center'},
            {text: 'Department', value: 'department', align: 'center'},
            {text: 'Type', value: 'type', align: 'center'},
            {text: 'Number of days', value: 'number of days', align: 'center'},
            {text: 'Date (from)', value: 'date(from)', align: 'center'},
            {text: 'Date (to)', value: 'date(to)', align: 'center'},
            {text: 'Remark', value: 'remark', align: 'center'},
            {text: 'Status', value: 'status', align: 'center'},
            {text: '', value: 'data-table-select' } ],
        historyHeader: [
            {text: 'TimeStamp', value: 'timestamp', sortable: false, align: 'center'}, 
            {text: 'Name', value: 'name', align: 'center'},
            {text: 'Department', value: 'department', align: 'center'},
            {text: 'Type', value: 'type', align: 'center'},
            {text: 'Number of days', value: 'number of days', align: 'center'},
            {text: 'Date (from)', value: 'date(from)', align: 'center'},
            {text: 'Date (to)', value: 'date(to)', align: 'center'},
            {text: 'Remark', value: 'remark', align: 'center'},
            {text: 'Status', value: 'status', align: 'center'},],
        selected: [],
        inputPass: '',
        secretPass: secretPass,
        passwordC: '',
        confirmClick: false,
        show: false,
        search: '',
        historySearch: ''
    }),
    methods: {
        async getData () {
            let res = await axios.get(leaveSheetUrl + '/tabs/leaveFormResponses')
            this.data = res.data
            let arr = this.partition(this.data)
            let pendingData = arr[0]
            this.historyData = arr[1].reverse()
            let i = 1
            if (pendingData.length > 0){
                for (const row of pendingData){
                    row['index'] = i
                    this.waitingData.push(row)
                    i++
                }    
            }else{
                this.waitingData = []
            }
        },
        approve () {
            let msg = ''
            for (const row of this.selected){
                msg = msg + row.name + " " + row.type + " for " + row["number of days"] +" day "+ row['date(from)'] + " to " + row['date(to)'] + '<br>'
            }
            Swal.fire({
                title: 'Do you want to approve all of this?',
                html: msg,
                showDenyButton: true,
                showCancelButton: false,
                reverseButtons: true,
                confirmButtonText: 'Approve',
                denyButtonText: `Cancel`,
                confirmButtonColor: '#4caf50',
                }).then(async (result) => {
                if (result.isConfirmed) {
                    this.$store.commit('general/setLoading', true)
                    this.dataStatus = 'approved'
                    await this.submit()
                    this.$store.commit('general/setLoading', false)
                }
            })
        },
        deny () {
            let msg = ''
            for (const row of this.selected){
                msg = msg + row.name + " " + row.type + " for " + row['number of days'] +" day "+ row['date(from)'] + " to " + row['date(to)'] + '<br>'
            }
            Swal.fire({
                title: 'Do you want to deny all of this?',
                html: msg,
                showDenyButton: true,
                showCancelButton: false,
                reverseButtons: true,
                confirmButtonText: 'Deny',
                denyButtonText: `Cancel`,
                confirmButtonColor: '#E74C3C',
                denyButtonColor: '#BDC3C7',
                }).then(async (result) => {
                if (result.isConfirmed) {
                    this.$store.commit('general/setLoading', true)
                    this.dataStatus = 'denied'
                    await this.submit()
                    this.$store.commit('general/setLoading', false)
                }
            })
        },
        async submit () {
            let res,trackingRes, newDate, newMonth
            let trackingData = []
            let newVal , dateArr, newWeek
            let newStatus = {status: this.dataStatus}
            for (const row of this.selected){
                res = await axios.patch(leaveSheetUrl + `/tabs/leaveFormResponses/search?timestamp=${row.timestamp}&name=${row.name}&date(from)=${row['date(from)']}&date(to)=${row['date(to)']}`, newStatus)
                if (res.status == 200){
                    row.status = this.dataStatus
                    this.historyData.unshift(row)
                    this.waitingData.splice(row['index']-1,1)                    
                }
            }
            if (this.dataStatus == "approved"){
                for (const row of this.selected){
                    if (row.department != "ADMIN"){
                        if (row['number of days']>= 1){
                            if (row['number of days']== 1){
                                dateArr = row['date(from)'].split('/')
                                newMonth = moment(`${dateArr[1]}`, 'M').format("MM MMM").toUpperCase()
                                newWeek = this.calWeek(row['date(to)'])
                                newVal = {
                                    Date: dateArr[0],
                                    Week: newWeek,
                                    Month: `'${newMonth}`,
                                    Project: 'KS-TakeLeave',
                                    Work: '1',
                                    NAME: row.name,
                                    Department: row.department,
                                    Remark: '',
                                }
                                trackingData.push(newVal)
                            }else{
                                for (let i = 0; i < row['number of days']; i++ ){
                                    newDate = moment(`${row['date(from)']}`, 'D/M/YYYY').add(i, 'days').format('D/M/YYYY')
                                    dateArr = newDate.split('/')
                                    newMonth = moment(`${dateArr[1]}`, 'M').format("MM MMM").toUpperCase()
                                    newWeek = this.calWeek(newDate)
                                    newVal = {
                                        Date: dateArr[0],
                                        Week: newWeek,
                                        Month: `'${newMonth}`,
                                        Project: 'KS-TakeLeave',
                                        Work: '1',
                                        NAME: row.name,
                                        Department: row.department,
                                        Remark: '',
                                    }
                                    trackingData.push(newVal)
                                }
                            }
                        }                        
                    }
                }
                trackingRes = await axios.post(sheetUrl + '/tabs/Per man', trackingData)
            }
            this.selected = []  
        },
        calWeek (val) {
            let week
            let arr = val.split("/")
            let m
            let date = parseInt(arr[0])
            let month = parseInt(arr[1])
            let year = parseInt(arr[2])
            let dateFormat = `${month}/${date}/${year}`
            let firstOfMonth = moment(`${month}/1/${year}`).format('dddd')
            let day = moment(dateFormat).format('dddd')
            switch (day) {
                case "Wednesday":
                    week = moment(dateFormat).week() - moment(dateFormat).startOf('month').weeks()+1;
                    m = moment(dateFormat).format('M')
                    break;
                case "Thursday":
                    week = moment(dateFormat).subtract(1, 'days').week() - moment(dateFormat).startOf('month').weeks()+1;
                    m = moment(dateFormat).subtract(1, 'days').format('M')
                    break;
                case "Friday":
                    week = moment(dateFormat).subtract(2, 'days').week() - moment(dateFormat).startOf('month').weeks()+1;
                    m = moment(dateFormat).subtract(2, 'days').format('M')
                    break;
                case "Monday":
                    week = moment(dateFormat).add(2, 'days').week() - moment(dateFormat).startOf('month').weeks()+1;
                    m = moment(dateFormat).add(2, 'days').format('M')
                    break;
                case "Tuesday":
                    week = moment(dateFormat).add(1, 'days').week() - moment(dateFormat).startOf('month').weeks()+1;
                    m = moment(dateFormat).add(1, 'days').format('M')
                    break;
            
                default:
                    week = 0
                    break;
            }
            firstOfMonth = moment(`${m}/1/${year}`).format('dddd')
            if ((firstOfMonth == "Thursday" || firstOfMonth == "Friday")&& week != 1){
                week = week - 1
            }
            return week
        },
        confirm () {
            this.confirmClick = true
            this.passwordC = this.inputPass
            if (this.passwordC == secretPass){
                this.$store.commit('password/setPassword', this.passwordC)
                this.getData()
            }
        },
        partition (arr) {
            return arr.reduce((result, element) => {
                result[element.status == 'pending' ? 0 : 1].push(element); // Determine and push to small/large arr
                return result;
                },
            [[], []]); 
        }
    }
}
</script>

<style>
.main-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: radial-gradient(circle, rgba(249,254,255,0.14469537815126055) 0%, rgba(204,233,233,1) 100%);
}
.waiting-card {
    margin: 15px;
    padding: 10px;
    border-radius: 12px !important;
}
.approved-card {
    margin: 15px;
    padding: 10px;
    border-radius: 12px !important;
}
.password-card {
    box-shadow: 3px 3px 15px 15px rgba(0, 0, 0, 0.15) !important;
    border-radius: 12px !important;
}
.confirm-btn {
    align-self: flex-end;
}
.confirm-btn {
    background: #11b8b8 !important;
    color: #ffff !important;
    align-items: center;
    display: flex;
}
.confirm-btn:hover {
    color: #ffff !important;
    box-shadow: 0px 0px 0px 5px rgba(0, 0, 0, 0.1);
}
.mobile-div {
    overflow-x: scroll;
}
.data-table {
    width: 100%;
}

</style>
