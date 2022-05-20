<template>
    <div class="pa-3 main-layout fill-height">
        <v-card :class="isMobile?'mobileCustom-card':'custom-card'" width="800">
            <v-alert class="col-12"
                dense dismissible
                close-icon="close"
                border="left"
                :icon="alertIcon"
                :value="submitted"
                :type="alertType"
                @input="submitted=false">{{alertMsg}}</v-alert>

            <v-card-title class="text-h5 text-sm-h4 pl-3"
            >Leave Form</v-card-title>
            <v-container>
            <v-form 
            ref="form"
            v-model="form"
            lazy-validation
            >
                <v-row>
                    <v-col cols="6" sm="6">
                        <v-select
                        v-model="name"
                        :items="formattedNameOpt"
                        item-text="text"
                        item-value="value"
                        rule="Name is required"
                        label="Name"
                        @change="findDepartment"
                        required
                        hide-details>
                        ></v-select>
                    </v-col>

                    <v-col cols="6" sm="6"
                    align-self="end"
                    >
                        Department: {{department}}
                    </v-col>
                </v-row>

                <v-row class="">
                    <v-col cols="12" sm="6">
                        <v-select
                        v-model="leaveType"
                        :items="types"
                        label="Leave type"
                        required
                        hide-details></v-select>
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-select
                        v-model="numDays"
                        :items="days"
                        label="The number of days"
                        required
                        hide-details>></v-select>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col
                    cols="12"
                    class="mt-4">
                    <date-picker
                    class="date-picker"
                    value-type="format" 
                    format="D MMM YYYY"
                    v-model="dates"
                    range
                    placeholder="Please select date"
                    :disabled-date="disabledDate"
                    ></date-picker>
                    </v-col>
                </v-row>

                <v-row
                v-if="leaveType=='Personal Leave' || leaveType=='Sick Leave (Have a Medical Certificate)' || this.leaveType == 'Sick Leave (Not have a Medical Certificate)' || numDays == 0.5">
                    <v-col
                    class="pa-2">
                        <v-text-field
                        label="Note"
                        v-model="msg"
                        placeholder="หากลาครึ่งวันโปรดระบุช่วงเช้าหรือบ่าย"
                        filled></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col align="right">
                        <v-btn 
                        color="error"
                        class="mr-2 mb-2 mt-1"
                        rounded
                        @click="clear">Clear</v-btn>

                        <v-btn
                        color="success" 
                        :loading="isSubmitting"
                        :disabled="validate"
                        class="mb-2 mt-1"
                        rounded
                        @click="confirm">Submit</v-btn>
                    </v-col>
                </v-row>
            </v-form>

            </v-container>
        </v-card>
    </div>
</template>

<script>
import moment from 'moment'
import axios from 'axios'
import { sheetUrl, leaveSheetUrl } from '../store/constants'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import {mapState} from 'vuex'
import Swal from 'sweetalert2'

    export default {
        name: 'LeaveForm',
        components: {
            DatePicker 
        },
        beforeMount() {
            this.getName()
        },
        computed: {
            isMobile() {
                return this.$vuetify.breakpoint.mobile
            },  
            formattedNameOpt () {
                return this.nameList.map(item => ({
                    text: `(${this.showDepartment(item)}) ${item}`,
                    value: item
                }))
            },
            validate () {
                let nDays = 0
                if (this.dates.length > 0){
                    nDays = this.findNumDay()
                    if (this.name != '' && this.leaveType != '' && this.numDays != 0 && (this.numDays == nDays || this.numDays == 0.5)){
                        if (this.leaveType == "Personal Leave" || this.leaveType == "Sick Leave (Have a Medical Certificate)" || this.leaveType == "Sick Leave (Not have a Medical Certificate)" || this.numDays == 0.5){
                            if (this.msg != ""){
                                return false
                            }else{
                                return true
                            }
                        }else{
                            return false
                        }
                    }else{
                        return true
                    }                    
                }else{
                    return true
                }
            },
            ...mapState({
                employeeName: state => state.employee.employeeName
            }),
        },
        data: () => ({
            form: true,
            dates: [],
            formattedDates: [],
            nameData: [],
            nameList: [],
            name: '',
            department: '',
            timeStamp: '',
            numDays: 0,
            days: [0.5, 1, 2, 3, 4, 5],
            alertType: "success",
            alertMsg: "Submitted",
            alertIcon: "check",
            isSubmitting: false,
            submitted: false,
            leaveType: '',
            types: ["Personal Leave", "Vacation Leave", "Maternity Leave", "Sick Leave (Have a Medical Certificate)", "Sick Leave (Not have a Medical Certificate)", "Ordination Leave"],
            msg: "",
            disBtn: false,
            data: {}
        }),
        methods: {
            getName () {
                let dev = [], ba = [], graphic = [], qa = []
                // tabs/sheetName
                axios.get(leaveSheetUrl + '/tabs/nameSheet')
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
                            this.findDepartment()
                        }
                    })
            },
            findDepartment () {
                for (const n of this.nameData){
                    if (this.name == n.name){
                        this.department = n.department
                    }
                }
            },
            showDepartment (val) {
                for (const n of this.nameData){
                    if (val == n.name){
                        return n.department
                    }
                }
            },
            async submit () {
                this.data = {}
                this.timeStamp = moment().format("M/D/YYYY HH:mm:ss")
                this.formattedDates = this.formatDate(this.dates)
                this.data = {
                    timestamp: this.timeStamp,
                    name: this.name,
                    department: this.department,
                    type: this.leaveType,
                    "number of days": `${this.numDays}`, // store as string cause sheet bug
                    "date(from)": this.formattedDates[0],
                    "date(to)": this.formattedDates[1],
                    remark: this.msg,
                    status: "pending"
                }

                let res = await axios.post(leaveSheetUrl + '/tabs/leaveFormResponses', this.data )
                if (res.status == 200){
                    this.isSubmitting = false
                    this.alertType = "success"
                    this.alertMsg = "Submitted!"
                    this.alertIcon = "check"
                    this.submitted = true
                    this.leaveType = ''
                    this.numDays = 0
                    this.dates = []
                    this.msg = ''
                }else{
                    this.alertType = "error"
                    this.alertMsg = "Fail to submit!"
                    this.alertIcon = "highlight_off"
                    this.submitted = true
                }
                this.$store.commit("employee/setName", this.name)
            },
            formatDate (dates) {
                let arr =[]
                for (const date of dates){
                    arr.push(moment(`${date}`, "D MMM YYYY").format("D/M/YYYY"))
                }
                return arr
            },
            confirm () {
                this.submitted = false
                let msg = `<h4>${this.leaveType} for ${this.numDays} ${this.numDays>1?'days':'day'}</h4> <br/>from ${this.dates[0]} to ${this.dates[1]}`
                Swal.fire({
                    title: 'Do you want to submit this form?',
                    html: msg,
                    showDenyButton: true,
                    showCancelButton: false,
                    reverseButtons: true,
                    confirmButtonText: 'Submit',
                    denyButtonText: `Cancel`,
                    confirmButtonColor: '#4caf50',
                    }).then(async (result) => {
                    if (result.isConfirmed) {
                        this.$store.commit('general/setLoading', true)
                        await this.submit()
                        this.$store.commit('general/setLoading', false)
                    }else{
                        this.isSubmitting = false
                    }
                })
            },
            clear () {
                Swal.fire({
                    title: 'Do you want to clear this form?',
                    showDenyButton: true,
                    showCancelButton: false,
                    reverseButtons: true,
                    confirmButtonText: 'Clear',
                    denyButtonText: 'Cancel',
                    }).then((result) => {
                    if (result.isConfirmed) {
                        this.name = ''
                        this.department = ''
                        this.leaveType = ''
                        this.numDays = 0
                        this.dates = []
                        this.msg = ''
                    }
                })
            },
            disabledDate(date) {
                const day = new Date(date).getDay()

                return day === 0 || day === 6
            },
            findNumDay() {
                var start
                var end
                let arr
                let nDays
                if (this.dates.length > 0){
                    arr = this.formatDate(this.dates)
                    start = arr[0]
                    end = arr[1]                    
                }
                start = start.split("/")
                end = end.split("/")
                nDays = moment([end[2], end[1], end[0]]).diff(moment([start[2], start[1], start[0]]), 'days') +1
                return nDays
            }
        }
             
    }

</script>

<style>
.date-picker {
    width: 100%;
    align-self: center;
}
.main-layout {
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(circle, rgba(249,254,255,0.14469537815126055) 0%, rgba(204,233,233,1) 100%);
}
.custom-card {
    box-shadow: 3px 16px 43px rgba(0, 0, 0, 0.35) !important;
    border-radius: 12px !important;
    padding: 20px;
}
.mobileCustom-card {
    box-shadow: 3px 16px 43px rgba(0, 0, 0, 0.35) !important;
    border-radius: 12px !important;
    padding: 5px;
}
.mx-input {
    padding-left: 0px;
    font: 1em kanit ,sans-serif;
    border-radius: 0px !important;
    border: 0px solid #fff !important ;
    border-bottom: 1px solid #999 !important;
    -webkit-box-shadow: 0px 0px 0px ;
}
</style>