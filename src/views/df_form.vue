<template>
    <div class="pa-5 main-layout">
        <v-card class="pa-5 custom-shadow" >
            <v-card-title class="text-h4 pl-3">Company Project</v-card-title>
            <v-container>
            <v-form 
            ref="form"
            v-model="form"
            lazy-validation
            >
            <v-row class="pl-3 mb-4">{{today}} {{time}}</v-row>
            <v-row class="pl-3">Week {{week}} : {{firstDay}} - {{lastDay}}</v-row>
                <v-row>
                    <v-col cols="4">
                        <v-select
                        v-model="name"
                        :items="nameList"
                        :rules="[v => !!v || 'Name is required!']"
                        label="Name"
                        required
                        ></v-select>
                    </v-col>

                    <v-col>
                        <v-select
                        v-model="department"
                        :items="allDepartments"
                        :rules="[v => !!v || 'Department is required!']"
                        label="Department"
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
                
                <!-- <pre>{{ select }}</pre> -->
                <!-- <v-text-field v-model="selectedWork" required> </v-text-field> -->
                <!-- <TextField :value="textField" @onChange="textField = $event"></TextField> -->
                <v-layout justify-end>
                    <v-flex shrink>
                        <v-btn color="error"
                        class="mr-3"
                        rounded
                        @click="clear">Clear</v-btn>

                        <v-btn color="success"
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
import TextField from "../components/TextField.vue"

export default {
    name: 'TrackingForm',
    components: {
        // TextField
    },
    beforeMount() {
        this.showDate()
        this.genWorks()
    },
    data: () => ({
        nameList: [ "Earl", "Namo", "Men", "Champ", "Ton", "Kom", "Guitar", "Mac", "Sem", "Kane", "Pakad", "Preaw BA", "Jaokeng", "Kratai", "Kat", "Mew", "Ball", "Book"],
        allDepartments:[ "DEV", "BA", "QA", "GRAPHIC"],
        allProjects: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        // works: [0.0625, 0.125, 0.1875, 0.25, 0.3125, 0.3750, 0.4375, 0.5, 0.5625, 0.625, 0.6875, 0.75, 0.8125, 0.8750, 0.9375, 1],
        works: [],
        name: '',
        department: '',
        selectedProjects: [{project: '',work: ''}],
        firstDay: '',
        lastDay: '',
        week: '',
        today: moment().format('dddd'),
        time: moment().format('H:mm'),
        timeHr: moment().format('H'),
        testDay: 'Wednesday',
        form: true,
        late: false,
        firstForm: false,
    }),
    methods: {
        // onTyping (val) {
        //     this.textField = val
        //     console.log(this.textField);
        // }
        clear () {
            this.$refs.form.reset()
        },
        validate () {
            if (this.$refs.form.validate()) {
                var sum = 0;
                for (let i = 0; i<this.selectedProjects.length; i++){
                    sum = sum + this.selectedProjects[i].work
                }
                if (this.firstForm){
                    if (sum == 2){
                        alert("Submitted!")
                    }else{
                        alert("Sum of works must equal to 2")
                    }
                }else{
                    if (sum == 3){
                        alert("Submitted!")
                    }else{
                        alert("Sum of works must equal to 3")
                    }
                }
            }else{
                alert("Please fill in the required information")
            }
        },
        addField () {
            console.log("add");
            let data = {project: '', work: ''}
            this.selectedProjects.push(data)
        },
        removeField (index) {
            console.log("remove");
            this.selectedProjects.splice(index, 1)
        },
        showDate () {
            switch (this.today) {
                case "Wednesday":
                    this.firstDay = moment().subtract(2, 'days').format("dddd DD/MM/YYYY");
                    this.lastDay = moment().subtract(1, 'days').format("dddd DD/MM/YYYY");
                    this.week = moment().week() - moment().startOf('month').weeks()+1;
                    this.firstForm = true;
                    break;
                case "Thursday":
                    this.firstDay = moment().subtract(3, 'days').format("dddd DD/MM/YYYY");
                    this.lastDay = moment().subtract(2, 'days').format("dddd DD/MM/YYYY");
                    this.week = moment().subtract(1, 'days').week() - moment().startOf('month').weeks()+1;
                    this.firstForm = true;
                    this.late = true;
                    break;
                case "Friday":
                    if (this.timeHr <= 18){
                        this.firstDay = moment().subtract(4, 'days').format("dddd DD/MM/YYYY");
                        this.lastDay = moment().subtract(3, 'days').format("dddd DD/MM/YYYY");
                        this.week = moment().subtract(2, 'days').week() - moment().startOf('month').weeks()+1;
                        this.firstForm = true;
                        this.late = true;
                    }else{
                        this.firstDay = moment().subtract(2, 'days').format("dddd DD/MM/YYYY");
                        this.lastDay = moment().format("dddd DD/MM/YYYY");
                        this.week = moment().subtract(2, 'days').week() - moment().startOf('month').weeks()+1;
                        this.firstForm = false;
                        this.late = false;
                    }
                    break;
                case "Saturday":
                    this.firstDay = moment().subtract(3, 'days').format("dddd DD/MM/YYYY");
                    this.lastDay = moment().subtract(1, 'days').format("dddd DD/MM/YYYY");
                    this.week = moment().subtract(3, 'days').week() - moment().startOf('month').weeks()+1;
                    break;
                case "Sunday":
                    this.firstDay = moment().subtract(4, 'days').format("dddd DD/MM/YYYY");
                    this.lastDay = moment().subtract(2, 'days').format("dddd DD/MM/YYYY");
                    this.week = moment().subtract(4, 'days').week() - moment().startOf('month').weeks()+1;
                    break;
                case "Monday":
                    this.firstDay = moment().subtract(5, 'days').format("dddd DD/MM/YYYY");
                    this.lastDay = moment().subtract(3, 'days').format("dddd DD/MM/YYYY");
                    this.week = moment().subtract(5, 'days').week() - moment().startOf('month').weeks()+1;
                    break;
                case "Tuesday":
                    if (this.timeHr >= 18){
                        this.firstDay = moment().subtract(1, 'days').format("dddd DD/MM/YYYY");
                        this.lastDay = moment().format("dddd DD/MM/YYYY");
                        this.week = moment().add(1, 'days').week() - moment().startOf('month').weeks()+1;
                        this.firstForm = false;
                        this.late = false;
                    }else{
                        this.firstDay = moment().subtract(6, 'days').format("dddd DD/MM/YYYY");
                        this.lastDay = moment().subtract(4, 'days').format("dddd DD/MM/YYYY");
                        this.week = moment().subtract(6, 'days').week() - moment().startOf('month').weeks()+1;
                        this.firstForm = true;
                        this.late = true;
                        break;
                    }
                }
        },
        genWorks () {
            var num;
            if (this.firstForm){
                num = 32;
                for(let i = 1;i<=num;i++){
                    this.works.push(i/16)
                }
            }else{
                num = 48;
                for(let i = 1;i<=num;i++){
                    this.works.push(i/16)
                }
            }

        },
        checkWorks () {
            var sum = 0;
            for (let i = 0; i<this.selectedProjects.length; i++){
                sum = sum + this.selectedProjects[i].work
            }
            if (this.firstForm){
                if (sum >= 2){
                    return true;
                }else{
                    return false;
                }
            }else{
                if (sum >= 3){
                    return true;
                }else{
                    return false;
                }
            }
        },
        
        
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