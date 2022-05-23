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
            >Tracking Project</v-card-title>
            <v-container>
            <v-form 
            ref="form"
            v-model="form"
            lazy-validation
            >
                <v-row>
                    <v-col cols="12" sm="6">
                        <Select
                        :value="name"
                        :items="formattedNameOpt"
                        item-text="text"
                        item-value="value"
                        rule="Name is required"
                        label="Name"
                        @onChange="genOpt"
                        ></Select>
                    </v-col>

                    <v-col cols="12" sm="6"
                    align-self="center"
                    >
                        Department: {{department}}
                    </v-col>
                </v-row>

                <v-row class="pl-4">
                    <v-col class="pl-0">
                        <Select
                        :value="selectedDate"
                        :items="formattedDateOpt"
                        item-text="text"
                        item-value="value"
                        rule="Date is required!"
                        label="Date"
                        @onChange="checkLate"></Select>
                    </v-col>
                </v-row>

                <v-card
                :class="isMobile?'project-card mt-3 mb-2':'normal-card'">
                <div v-for="(selectedProject, index) in selectedProjects" 
                v-bind:key="index">
                     <v-row class="pa-1 ma-0"> 
                        <v-col 
                        cols="1"
                        sm="1"
                        align-self="center"
                        align="center"
                        class="pa-0"
                        >{{index+1}}.</v-col>
                        <v-col
                        cols="9"
                        sm="5"
                        align="right">
                            <AutoComplete
                            :value="selectedProject.project"
                            :items="allProjects"
                            rules="Project is required!"
                            label="Project"
                            @onChange="selectedProject.project=$event"></AutoComplete>
                        </v-col>

                        <v-layout align-center
                        class="work-opt"
                        >
                            <v-flex xs9 md10 pa-3
                            >
                                <AutoComplete
                                :value="selectedProject.work"
                                :items="formattedWorkOpt"
                                item-text="text"
                                item-value="value"
                                rules="Work is required!"
                                label="Work"
                                @onChange="selectedProject.work=$event"></AutoComplete>
                            </v-flex>

                            <v-flex xs2
                            >
                                <v-btn
                                :disabled="selectedProjects.length <= 1"
                                outlined
                                color="error"
                                x-small 
                                class="del-btn ml-4"
                                fab
                                @click="removeField(index)">
                                <v-icon >remove</v-icon></v-btn>
                            </v-flex>
                        </v-layout>
                    </v-row>
                </div>
                </v-card>
                <v-row>
                    <v-col
                    align-self="center">
                        <v-btn
                        :disabled="checkWorks()"
                        outlined
                        color="primary"
                        class="mb-2 mt-4 mr-3 add-btn"
                        small
                        @click="addField">Add more work</v-btn>
                    </v-col>

                    <v-col
                    align-self="center"
                    align="right"
                    :class="workSum>0?'warning--text mt-3':(workSum==0?'success--text mt-3':'error--text mt-3') ">
                        <i>Remaining unit: {{ remainingMsg}}</i>
                    </v-col>
                </v-row>

                <v-row> 
                    <v-col
                    cols="auto"
                    align-self="center"
                    >
                        <v-btn
                        text
                        color="error"
                        class="mb-2 mt-3 clearC-btn"
                        x-small
                        @click="clearCache"
                        ><u>Clear cache</u></v-btn>
                    </v-col>
                    <v-col>
                        <v-layout justify-end>
                            <v-flex shrink>
                                <v-btn color="error"
                                class="mr-2 mb-2 mt-1"
                                rounded
                                @click="clear">Clear</v-btn>

                                <v-btn color="success" 
                                :loading="isSubmitting"
                                :disabled="workSum != 0"
                                class="mb-2 mt-1"
                                rounded
                                @click="validate">Submit</v-btn> 
                            </v-flex>
                        </v-layout> 
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
import { sheetUrl, } from '../store/constants'
import Select from '../components/Select.vue'
import AutoComplete from '../components/AutoComplete.vue'
import {mapState} from 'vuex'
import Swal from 'sweetalert2'

export default {
    name: 'TrackingForm',
    components: {
        Select,
        AutoComplete
    },
    beforeMount() {
        this.getName()
    },
    data: () => ({
        nameList: [],
        nameData: [],
        allDepartments:[ "DEV", "BA", "QA", "GRAPHIC"],
        allProjects: [],
        works: [0.0625, 0.125, 0.1875, 0.25, 0.3125, 0.3750, 0.4375, 0.5, 0.5625, 0.625, 0.6875, 0.75, 0.8125, 0.8750, 0.9375, 1],
        name: '',
        department: '',
        selectedProjects: [{project: '',work: ''},{project: '',work: ''},{project: '',work: ''}],
        today: moment().format('YYYY-MM-DD'),
        date: '',
        week: '',
        month: '',
        year: moment().format("YYYY"),
        form: true,
        late: false,
        data: [],
        isSubmitting: false,
        submitted: false,
        dateOpt: [],
        selectedDate: '',
        alertType: "success",
        alertMsg: "Submitted",
        alertIcon: "check",
        day: '',
        workSum: '',
        remainingMsg: ''
    }),
    computed: {
        formattedDateOpt () {
            let day, format, date, dateArr = [];
            this.dateOpt.map(item => {
                day = moment(item).format('ddd')
                switch (day) {
                    case "Tue":
                        format = `${moment(item).format("ddd\xa0\xa0DD MMM YYYY")} ` + 
                                    `(${moment(item).calendar(null, {
                                        lastDay: '[Yesterday]',
                                        sameDay: '[Today]',
                                        nextDay: '[Tomorrow]',
                                        lastWeek: '[last] dddd',
                                        nextWeek: 'dddd',
                                        sameElse: 'L'
                                    })})`
                        break;
                    case "Thu":
                        format = `${moment(item).format("ddd\xa0\xa0DD MMM YYYY")} ` + 
                                    `(${moment(item).calendar(null, {
                                        lastDay: '[Yesterday]',
                                        sameDay: '[Today]',
                                        nextDay: '[Tomorrow]',
                                        lastWeek: '[last] dddd',
                                        nextWeek: 'dddd',
                                        sameElse: 'L'
                                    })})`
                        break;
                    case "Fri":
                        format = `${moment(item).format(`ddd\xa0\xa0\xa0\xa0DD MMM YYYY`)} ` + 
                                    `(${moment(item).calendar(null, {
                                        lastDay: '[Yesterday]',
                                        sameDay: '[Today]',
                                        nextDay: '[Tomorrow]',
                                        lastWeek: '[last] dddd',
                                        nextWeek: 'dddd',
                                        sameElse: 'L'
                                    })})`
                        break;
                    default:
                        format = `${moment(item).format("ddd DD MMM YYYY")} ` + 
                                    `(${moment(item).calendar(null, {
                                        lastDay: '[Yesterday]',
                                        sameDay: '[Today]',
                                        nextDay: '[Tomorrow]',
                                        lastWeek: '[last] dddd',
                                        nextWeek: 'dddd',
                                        sameElse: 'L'
                                    })})`
                        break;
                }
                date = {
                    text: `${format}`,
                    value: item }
                dateArr.push(date)
            })

            return dateArr
        },
        ...mapState({
            employeeName: state => state.employee.employeeName
        }),
        ...mapState({
            projectsName: state => state.projects.projectsName
        }),
        formattedWorkOpt () {
            return this.works.map(item => ({
                text: item*8>1?`${item*8} hrs (${item})`:`${item*8} hr (${item})`,
                value: item
            }))
        },
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
    methods: {
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
                    this.selectedProjects = [{project: '',work: ''},{project: '',work: ''},{project: '',work: ''}]
                    this.selectedDate = ' '
                }
            })
        },
        validate () {
            this.submitted = false
            this.isSubmitting = true
            var sum = 0;
            let msg = `<h4>${moment(this.selectedDate).format("dddd D MMMM YYYY")}</h4>` + "<br/>"
            for (let i = 0; i<this.selectedProjects.length; i++){
                sum = sum + this.selectedProjects[i].work
            }
            if (this.$refs.form.validate()) {
                if (sum == 1){
                    for (const p of this.selectedProjects){
                        if(p.project != '' && p.work != ''){
                            msg = msg + `${p.project} ` + `( ${p.work*8} ${p.work*8>1?'hrs':'hr'} )<br/>`
                        }
                    }
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
                }else{
                    this.isSubmitting = false
                    this.alertType = "warning"
                    this.alertMsg = "Sum of works must equal to 1 unit"
                    this.alertIcon = "error_outline"
                    this.submitted = true
                }
            }else{
                this.isSubmitting = false
                this.alertType = "warning"
                this.alertMsg = "Please fill in the required information"
                this.alertIcon = "error_outline"
                this.submitted = true
            }
            this.$vuetify.goTo('#app')
        },
        addField () {
            console.log("add");
            let row = {project: '', work: ''}
            this.selectedProjects.push(row)
        },
        removeField (index) {
            console.log("remove");
            this.selectedProjects.splice(index, 1)
        },
        checkWorks () {
            var sum = 0;
            for (let i = 0; i<this.selectedProjects.length; i++){
                if (this.selectedProjects[i].work != ''){
                    sum = sum + this.selectedProjects[i].work
                }
            }
            this.workSum = 1 - sum
            if (this.workSum < 0){
                this.remainingMsg = `over ${-this.workSum}`
            }else{
                this.remainingMsg = `${this.workSum}`
            }

            if (sum >= 1){
                return true
            }else{
                return false
            }
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
            this.checkLate(this.selectedDate)
            let row, resPost, projectData, month, m;
            let newVal;
            let msg = "";
            if (this.late){
                msg = "Late"
            }
            month = moment(`${this.month}`, 'M').format('MM MMM')
            month =  month.toUpperCase().slice(0)
            for (let i = 0;i < this.selectedProjects.length;i++){
                if (this.selectedProjects[i].project != '' && this.selectedProjects[i].work != ''){
                    row = {
                        Date: this.date,
                        Week: this.week,
                        Month: `'${month}`,
                        Project: this.selectedProjects[i].project,
                        Work: this.selectedProjects[i].work,
                        NAME: this.name,
                        Department: this.department,
                        Remark: msg,
                    }
                    this.data.push(row)
                }
            }
            resPost = await axios.post(sheetUrl + '/tabs/Per man', this.data )
            console.log(resPost.data);
                if (resPost.status == 200){
                    this.data = []
                    this.isSubmitting = false
                    this.alertType = "success"
                    this.alertMsg = "Submitted!"
                    this.alertIcon = "check"
                    this.submitted = true
                    //remove last submitted date option
                    for (let i = 0;i < this.dateOpt.length;i++){
                        if (moment(`${this.dateOpt[i]}`).isSame(`${this.selectedDate}`, 'day')){
                            this.dateOpt.splice(i,1)
                        }
                    }
                    this.$store.commit("projects/setProjects", this.selectedProjects)
                    for (let i = 0;i < this.projectsName.length;i++){
                        if (this.selectedProjects[i].project != '' && this.selectedProjects[i].work != ''){
                            this.selectedProjects[i].project = this.projectsName[i].project 
                            this.selectedProjects[i].work = ''
                        }
                    }
                    if (this.dateOpt.length >= 1){
                        this.selectedDate = this.dateOpt[0]
                    }else{
                        this.selectedDate = ''
                    }
                    
                }else{
                    this.alertType = "error"
                    this.alertMsg = "Fail to submit!"
                    this.alertIcon = "highlight_off"
                    this.submitted = true
                }
                this.$store.commit("employee/setName", this.name)

        },
        checkLate (val) {
            this.selectedDate = val
            this.late = false
            if (moment(this.selectedDate).isBefore(this.today)){
                if(moment(`${this.selectedDate}`).isSame(moment().subtract(1, 'days').format("YYYY-MM-DD"))){
                    if (moment(`${moment().format("HH:mm")}`, "HH:mm").isBefore(moment('17:30','HH:mm'))){
                        this.late = false
                    }else{
                       this.late = true 
                    }
                }else{
                    this.late = true
                }
            }
            let arr = this.selectedDate.split("-")
            let m
            this.date = parseInt(arr[2])
            this.month = parseInt(arr[1])
            let dateFormat = `${this.month}/${this.date}/${this.year}`
            let firstOfMonth = moment(`${this.month}/1/${this.year}`).format('dddd')
            let day = moment(dateFormat).format('dddd')
            switch (day) {
                case "Wednesday":
                    this.week = moment(dateFormat).week() - moment(dateFormat).startOf('month').weeks()+1;
                    m = moment(dateFormat).format('M')
                    break;
                case "Thursday":
                    this.week = moment(dateFormat).subtract(1, 'days').week() - moment(dateFormat).startOf('month').weeks()+1;
                    m = moment(dateFormat).subtract(1, 'days').format('M')
                    break;
                case "Friday":
                    this.week = moment(dateFormat).subtract(2, 'days').week() - moment(dateFormat).startOf('month').weeks()+1;
                    m = moment(dateFormat).subtract(2, 'days').format('M')
                    break;
                case "Monday":
                    this.week = moment(dateFormat).add(2, 'days').week() - moment(dateFormat).startOf('month').weeks()+1;
                    m = moment(dateFormat).add(2, 'days').format('M')
                    break;
                case "Tuesday":
                    this.week = moment(dateFormat).add(1, 'days').week() - moment(dateFormat).startOf('month').weeks()+1;
                    m = moment(dateFormat).add(1, 'days').format('M')
                    break;
            
                default:
                    this.week = 0
                    break;
            }
            firstOfMonth = moment(`${m}/1/${this.year}`).format('dddd')
            if ((firstOfMonth == "Thursday" || firstOfMonth == "Friday")&& this.week != 1){
                this.week = this.week - 1
            }
        },
        async genDateOpt () {
            this.dateOpt = []
            let date, month, data1, data2, res, formatMonth, m;
            let found1 = false;
            let found2 = false;
            if (moment().subtract(6, 'days').format("M") == moment().format("M")){
                res = await axios.get(sheetUrl + `/tabs/Per man/search?Month=${moment().subtract(6, 'days').format("MM MMM").toUpperCase()}&NAME=${this.name}`)
                    data1 = res.data
                for (let i = 0; i < 7; i++){
                    found1 = false
                    if (!(moment().subtract(i, 'days').format("dddd") == "Saturday" || moment().subtract(i, 'days').format("dddd") == "Sunday")){
                        date = moment().subtract(i, 'days').format("D")
                        month = moment().subtract(i, 'days').format("M")
                        for (const row of data1){
                            formatMonth = row.Month.split(' ')
                            m = parseInt(formatMonth[0])
                            if (row.Date == date && m == month){
                                found1 = true
                            }
                        }
                        if (!found1){
                            this.dateOpt.push(moment().subtract(i, 'days').format("YYYY-MM-DD"))
                        }
                    }
                }
            }else{
                res = await axios.get(sheetUrl + `/tabs/Per man/search?Month=${moment().subtract(6, 'days').format("MM MMM").toUpperCase()}&NAME=${this.name}`)
                    data1 = res.data
                res = await axios.get(sheetUrl + `/tabs/Per man/search?Month=${moment().format("MM MMM").toUpperCase()}&NAME=${this.name}`)
                    data2 = res.data
                for (let i = 0; i < 7; i++){
                    found1 = false
                    found2 = false
                    if (!(moment().subtract(i, 'days').format("dddd") == "Saturday" || moment().subtract(i, 'days').format("dddd") == "Sunday")){
                        date = moment().subtract(i, 'days').format("D")
                        month = moment().subtract(i, 'days').format("M")
                        for (const row of data1){
                            formatMonth = row.Month.split(' ')
                            m = parseInt(formatMonth[0])
                            if (row.Date == date && m == month){
                                found1 = true
                            }
                        }
                        for (const row of data2){
                            formatMonth = row.Month.split(' ')
                            m = parseInt(formatMonth[0])
                            if (row.Date == date && m == month){
                                found2 = true
                            }
                        }
                        if (!found1 && !found2){
                            this.dateOpt.push(moment().subtract(i, 'days').format("YYYY-MM-DD"))
                        }
                    }
                }
            }
            if (this.dateOpt.length > 1){
                if (moment(`${moment().format("HH:mm")}`, "HH:mm").isBefore(moment('17:30','HH:mm'))){
                    if (moment(`${this.dateOpt[1]}`).isSame(moment().subtract(1, 'days').format("YYYY-MM-DD"))){
                        this.selectedDate = this.dateOpt[1]
                        this.checkLate(this.selectedDate)
                    }else{
                        this.selectedDate = this.dateOpt[0]
                        this.checkLate(this.selectedDate)
                    }
                }else{
                    this.selectedDate = this.dateOpt[0]
                    this.checkLate(this.selectedDate)
                }
            }else{
                this.selectedDate = this.dateOpt[0]
                this.checkLate(this.selectedDate)
            }
        },
        findProjectsOpt () {
            this.allProjects = []
            axios.get(sheetUrl + '/tabs/projectsSheet')
                .then(res => {
                    for ( const project of res.data){
                        if (project[this.name] != ''){
                            this.allProjects.push( project[this.name])
                        }
                    }
                    this.allProjects.sort((a, b) => new Intl.Collator().compare(a, b))
                })
        },
        genOpt (val) {
            this.name = val
            this.selectedProjects = [{project: '',work: ''},{project: '',work: ''},{project: '',work: ''}]
            this.findDepartment()
            this.genDateOpt()
            this.findProjectsOpt()
        },
        clearCache () {
            Swal.fire({
                title: `Do you want to clear all cache?`,
                showDenyButton: true,
                showCancelButton: false,
                reverseButtons: true,
                denyButtonText: `Cancel`,
                confirmButtonText: 'Clear',
                }).then((result) => {
                if (result.isConfirmed) {
                    this.$store.commit("employee/clearName")
                    this.$store.commit("projects/clearProjects")
                    this.name = ' '
                    this.selectedProjects = [{project: '',work: ''},{project: '',work: ''},{project: '',work: ''}]
                    this.selectedDate = ' '
                    this.department = ' '
                    Swal.fire('Clear!', '', 'success')
                } 
            })
        }
        
    }
}

</script>

<style scoped>
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
.del-btn:hover {
    background: #FF605D;
    color: #ffff !important;

}
.del-btn {
    font-size: 150%;
}
.add-btn:hover {
    background: #5DADE2;
    color: #ffff !important;
}
.clearC-btn:hover {
    background: #FF605D;
    color: #ffff !important;
}
.main-layout {
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(circle, rgba(249,254,255,0.14469537815126055) 0%, rgba(204,233,233,1) 100%);
}
.project-card {
    padding: 5px !important;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25) !important;
    border-radius: 15px !important;
    background: #E9FFFF !important;
}
.normal-card {
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.0) !important;
}
.work-opt {
    justify-content: flex-end;
}

</style>