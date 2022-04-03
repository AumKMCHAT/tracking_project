<template>
    <div class="pa-5 main-layout">
        <v-card class="pa-5 custom-shadow" >
            <v-alert class="col-12"
                dense dismissible
                close-icon="close"
                border="left"
                :icon="alertIcon"
                :value="submitted"
                :type="alertType">{{alertMsg}}</v-alert>

            <v-card-title class="text-h4 pl-3">Company Project</v-card-title>
            <v-container>
            <v-form 
            ref="form"
            v-model="form"
            lazy-validation
            >
                <v-row class="pl-4">
                    <v-col class="pl-0">
                        <v-select
                        v-model="selectedDate"
                        :items="formattedDateOpt"
                        :item-text="text"
                        :item-value="value"
                        :rules="[v => !!v || 'Date is required!']"
                        label="Date"
                        @change="checkLate()"
                        required
                        ></v-select>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="4">
                        <v-select
                        v-model="name"
                        :items="nameList"
                        :rules="[v => !!v || 'Name is required!']"
                        label="Name"
                        @change="findProjectsOpt(),findDepartment()"
                        required
                        ></v-select>
                    </v-col>

                    <v-col>
                        <v-select
                        v-model="department"
                        :items="allDepartments"
                        :rules="[v => !!v || 'Department is required!']"
                        label="Department"
                        readonly
                        required 
                        ></v-select>
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
                            <v-autocomplete
                            v-model="selectedProject.project"
                            :items="allProjects"
                            :rules="[v => !!v || 'Project is required!']"
                            label="Project"
                            required
                            ></v-autocomplete>
                        </v-col>

                        <v-col>
                            <v-autocomplete
                            v-model="selectedProject.work"
                            :items="works"
                            :rules="[v => !!v || 'Work is required!']"
                            label="Work"
                            required
                            ></v-autocomplete>
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

                        <v-btn color="success" :loading="isSubmitting"
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

export default {
    name: 'TrackingForm',
    components: {

    },
    beforeMount() {
        this.genDateOpt()
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
        }
    },
    methods: {
        clear () {
            this.$refs.form.reset()
            this.selectedProjects = [{project: '',work: ''}]
            this.allProjects = []
        },
        validate () {
            this.isSubmitting = true
            var sum = 0;
            for (let i = 0; i<this.selectedProjects.length; i++){
                sum = sum + this.selectedProjects[i].work
            }
            // remind: fix show icon
            if (this.$refs.form.validate()) {
                if (sum == 1){
                    this.submit()
                }else{
                    this.isSubmitting = false
                    this.alertType = "warning"
                    this.alertMsg = "Sum of works must equal to 1"
                    this.alertIcon = "alert"
                }
            }else{
                this.isSubmitting = false
                this.alertType = "warning"
                this.alertMsg = "Please fill in the required information"
                this.alertIcon = "alert"
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
        getProjects () {
            // tabs/sheetName
            axios.get(sheetUrl + '/tabs/projectsSheet')
            .then(res => {
                for (const n of res.data){
                    this.allProjects.push(n.project)
                }
            })
        },
        getName () {
            axios.get(sheetUrl + '/tabs/nameSheet')
            .then(res => {
                for (const n of res.data){
                    this.nameList.push(n.name)
                }
            })
        },
        findDepartment () {
            axios.get(sheetUrl + `/tabs/nameSheet/name/${this.name}`)
                .then(res => {
                    this.department = res.data[0].department
                })
        },
        submit () {
            let row;
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
            axios.post(sheetUrl + '/tabs/data', this.data )
                .then(res => {
                    if (res.status == 200){
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
                        this.alertIcon = "close"
                    }
                })
        },
        checkLate () {
            this.late = false
            if (moment(this.selectedDate).isBefore(this.today)){
                this.late = true
            }
            let arr = this.selectedDate.split("-")
            this.date = arr[2]
            this.month = arr[1]
        },
        genDateOpt () {
            for (let i = 0; i < 7; i++){
                if (!(moment().subtract(i, 'days').format("dddd") == "Saturday" || moment().subtract(i, 'days').format("dddd") == "Sunday")){
                    this.dateOpt.push(moment().subtract(i, 'days').format("YYYY-MM-DD"))
                }
            }
        },
        findProjectsOpt () {
            console.log("findProjects");
            this.allProjects = []
            axios.get(sheetUrl + '/tabs/projectsSheet')
                .then(res => {
                    for ( const project of res.data){
                        if (project[this.name] != ''){
                            this.allProjects.push( project[this.name])
                        }
                    }
                })
        }
        
    }
}

</script>

<style scoped>
.custom-shadow {
    box-shadow: 3px 16px 43px rgba(0, 0, 0, 0.35) !important;
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
</style>