<template>
    <div class="pa-5 main-layout fill-height">
        <v-card min-width="800" max-width="800" class="pa-5 custom-card" >
            <v-alert class="col-12"
                dense dismissible
                close-icon="close"
                border="left"
                :icon="alertIcon"
                :value="submitted"
                :type="alertType"
                @input="submitted=false">{{alertMsg}}</v-alert>

            <v-card-title class="text-h4 pl-3">Company Project</v-card-title>
            <v-container>
            <v-form 
            ref="form"
            v-model="form"
            lazy-validation
            >
                <v-row>
                    <v-col cols="4">
                        <!-- <v-select
                        v-model="name"
                        :items="nameList"
                        :rules="[v => !!v || 'Name is required!']"
                        label="Name"
                        @change="genOpt"
                        required
                        ></v-select> -->
                        <Select
                        :value="name"
                        :items="nameList"
                        rule="Name is required"
                        label="Name"
                        @onChange="genOpt"
                        ></Select>
                    </v-col>

                    <v-col>
                        <!-- <v-select
                        v-model="department"
                        :items="allDepartments"
                        :rules="[v => !!v || 'Department is required!']"
                        label="Department"
                        readonly
                        required 
                        ></v-select> -->
                        <Select
                        :value="department"
                        :items="allDepartments"
                        rule="Department is required!"
                        label="Department"
                        readonly
                        ></Select>
                    </v-col>
                </v-row>

                <v-row class="pl-4">
                    <v-col class="pl-0">
                        <!-- <v-select
                        v-model="selectedDate"
                        :items="formattedDateOpt"
                        item-text="text"
                        item-value="value"
                        :rules="[v => !!v || 'Date is required!']"
                        label="Date"
                        @change="checkLate()"
                        required
                        ></v-select> -->
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

                <div v-for="(selectedProject, index) in selectedProjects" 
                v-bind:key="index">
                    <v-row> 
                        <v-col 
                        cols="auto"
                        align-self="center"
                        >{{index+1}}.</v-col>
                        <v-col>
                            <!-- <v-autocomplete
                            v-model="selectedProject.project"
                            :items="allProjects"
                            :rules="[v => !!v || 'Project is required!']"
                            label="Project"
                            required
                            ></v-autocomplete> -->

                            <AutoComplete
                            :value="selectedProject.project"
                            :items="allProjects"
                            rules="Project is required!"
                            label="Project"
                            @onChange="selectedProject.project=$event"></AutoComplete>
                        </v-col>

                        <v-col>
                            <!-- <v-autocomplete
                            v-model="selectedProject.work"
                            :items="works"
                            :rules="[v => !!v || 'Work is required!']"
                            label="Work"
                            required
                            ></v-autocomplete> -->

                            <AutoComplete
                            :value="selectedProject.work"
                            :items="works"
                            rules="Work is required!"
                            label="Work"
                            @onChange="selectedProject.work=$event"></AutoComplete>
                        </v-col>

                        <v-col 
                        cols="auto"
                        align-self="center">
                            <v-btn
                            :disabled="selectedProjects.length <= 1"
                            outlined
                            color="error"
                            x-small class="del-btn"
                            fab
                            @click="removeField(index)">
                            <v-icon >remove</v-icon></v-btn>
                        </v-col>
                        
                    </v-row>

                </div>

                <v-row>
                    <v-btn
                    :disabled="checkWorks()"
                    outlined
                    color="primary"
                    class="mb-4 mt-3 add-btn"
                    small
                    @click="addField">Add more work</v-btn>
                </v-row>

                <v-row> </v-row>
                
                <v-layout justify-end>
                    <v-flex shrink>
                        <v-btn color="error"
                        class="mr-3"
                        rounded
                        @click="clear">Clear</v-btn>

                        <v-btn color="success" 
                        :loading="isSubmitting"
                        rounded
                        @click="validate">Submit</v-btn> 
                    </v-flex>
                </v-layout> 

            </v-form>
            </v-container>
        </v-card>
    </div>
</template>

<script>
import moment from 'moment'
import axios from 'axios'
import { sheetUrl } from '../store/constants'
import Select from '../components/Select.vue'
import AutoComplete from '../components/AutoComplete.vue'
import {mapState} from 'vuex'

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
        allDepartments:[ "DEV", "BA", "QA", "GRAPHIC"],
        allProjects: [],
        works: [0.0625, 0.125, 0.1875, 0.25, 0.3125, 0.3750, 0.4375, 0.5, 0.5625, 0.625, 0.6875, 0.75, 0.8125, 0.8750, 0.9375, 1],
        name: '',
        department: '',
        selectedProjects: [{project: '',work: ''}],
        today: moment().format('YYYY-MM-DD'),
        date: '',
        month: '',
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
    }),
    computed: {
        formattedDateOpt () {
            return this.dateOpt.map(item => ({
                text: moment(item).format('dddd DD/MM/YYYY'),
                value: item
            }))
        },
        ...mapState({
            employeeName: state => state.employee.employeeName
        })
    },
    methods: {
        clear () {
            this.selectedProjects = [{project: '',work: ''}]
            this.selectedDate = ' '
        },
        validate () {
            this.submitted = false
            this.isSubmitting = true
            var sum = 0;
            for (let i = 0; i<this.selectedProjects.length; i++){
                sum = sum + this.selectedProjects[i].work
            }
            if (this.$refs.form.validate()) {
                if (sum == 1){
                    this.submit()
                }else{
                    this.isSubmitting = false
                    this.alertType = "warning"
                    this.alertMsg = "Sum of works must equal to 1"
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
                sum = sum + this.selectedProjects[i].work
            }
            if (sum >= 1){
                return true
            }else{
                return false
            }
        },
        getName () {
            // tabs/sheetName
            axios.get(sheetUrl + '/tabs/nameSheet')
                .then(res => {
                    for (const n of res.data){
                        this.nameList.push(n.name)
                    }
                    if (this.employeeName){
                        this.name = this.employeeName
                        this.findDepartment()
                        this.genDateOpt()
                        this.findProjectsOpt()
                    }
                })
        },
        findDepartment () {
            axios.get(sheetUrl + `/tabs/nameSheet/name/${this.name}`)
                .then(res => {
                    this.department = res.data[0].department
                })
        },
        async submit () {
            let row, resPost;
            let msg = "";
            if (this.late){
                msg = "Late"
            }
            for (let i = 0;i < this.selectedProjects.length;i++){
                row = {
                    date: this.date,
                    month: this.month,
                    project: this.selectedProjects[i].project,
                    work: this.selectedProjects[i].work,
                    name: this.name,
                    department: this.department,
                    remark: msg,
                }
                this.data.push(row)
            }
            resPost = await axios.post(sheetUrl + '/tabs/data', this.data )
                if (resPost.status == 200){
                    row = {
                        work: 1,
                        remark: msg,
                    }
                    console.log(this.name,this.date,this.month);
                    axios.patch(sheetUrl + `/tabs/sumData/search?name=${this.name}&date=${this.date}&month=${this.month}`,row)
                        .then(res => {
                            console.log(row);
                            console.log(res);
                        })
                    this.data = []
                    this.isSubmitting = false
                    this.alertType = "success"
                    this.alertMsg = "Submitted!"
                    this.alertIcon = "check"
                    this.submitted = true
                    this.clear()
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
                this.late = true
            }
            let arr = this.selectedDate.split("-")
            this.date = parseInt(arr[2])
            this.month = parseInt(arr[1])
        },
        async genDateOpt () {
            this.dateOpt = []
            let date, month, data1, data2, res;
            let found1 = false;
            let found2 = false;
            // for (let i = 0; i < 7; i++){
            //     if (!(moment().subtract(i, 'days').format("dddd") == "Saturday" || moment().subtract(i, 'days').format("dddd") == "Sunday")){
            //         date = moment().subtract(i, 'days').format("D")
            //         month = moment().subtract(i, 'days').format("M")
            //         await axios.get(sheetUrl + `/tabs/data/search?date=${date}&month=${month}&name=${this.name}`)
            //             .then(res => {
            //                 if (res.data.length < 1){
            //                     this.dateOpt.push(moment().subtract(i, 'days').format("YYYY-MM-DD"))
            //                 }
            //             })
            //     }
            // }

            if (moment().subtract(6, 'days').format("M") == moment().format("M")){
                res = await axios.get(sheetUrl + `/tabs/data/search?month=${moment().subtract(6, 'days').format("M")}&name=${this.name}`)
                    data1 = res.data
                for (let i = 0; i < 7; i++){
                    found1 = false
                    if (!(moment().subtract(i, 'days').format("dddd") == "Saturday" || moment().subtract(i, 'days').format("dddd") == "Sunday")){
                        date = moment().subtract(i, 'days').format("D")
                        month = moment().subtract(i, 'days').format("M")
                        for (const row of data1){
                            if (row.date == date && row.month == month){
                                found1 = true
                            }
                        }
                        if (!found1){
                            this.dateOpt.push(moment().subtract(i, 'days').format("YYYY-MM-DD"))
                        }
                    }
                }
            }else{
                res = await axios.get(sheetUrl + `/tabs/data/search?month=${moment().subtract(6, 'days').format("M")}&name=${this.name}`)
                    data1 = res.data
                res = await axios.get(sheetUrl + `/tabs/data/search?month=${moment().format("M")}&name=${this.name}`)
                    data2 = res.data
                for (let i = 0; i < 7; i++){
                    found1 = false
                    found2 = false
                    if (!(moment().subtract(i, 'days').format("dddd") == "Saturday" || moment().subtract(i, 'days').format("dddd") == "Sunday")){
                        date = moment().subtract(i, 'days').format("D")
                        month = moment().subtract(i, 'days').format("M")
                        for (const row of data1){
                            if (row.date == date && row.month == month){
                                found1 = true
                            }
                        }
                        for (const row of data2){
                            if (row.date == date && row.month == month){
                                found2 = true
                            }
                        }
                        if (!found1 && !found2){
                            this.dateOpt.push(moment().subtract(i, 'days').format("YYYY-MM-DD"))
                        }
                    }
                }
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
                })
        },
        genOpt (val) {
            this.name = val
            this.findDepartment()
            this.genDateOpt()
            this.findProjectsOpt()
        }
        
    }
}

</script>

<style scoped>
.custom-card {
    box-shadow: 3px 16px 43px rgba(0, 0, 0, 0.35) !important;
    border-radius: 12px !important;
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
.main-layout {
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(circle, rgba(249,254,255,0.14469537815126055) 0%, rgba(204,233,233,1) 100%);
}
</style>