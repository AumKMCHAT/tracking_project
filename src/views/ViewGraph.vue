<template>
    <div>
        <v-card>
            <v-card-title>TO THE MOON</v-card-title>
        </v-card>
    </div>
    
</template>

<script>
import axios from 'axios'
import { sheetUrl } from '../store/constants'

export default {
    summary (sProject, sDerpartment) {
        var workSum = 0;
        axios.get(sheetUrl + `/tabs/data/search?project=*${sProject}*&department=*${sDerpartment}*`)
            .then(res => {
                for (const row of res.data){
                    workSum = workSum + row.work
                }
                return workSum
            })
    },
    summaryAll (sProject) {
        var workSum = 0;
        axios.get(sheetUrl + `/tabs/data/search?project=*${sProject}*`)
            .then(res => {
                for (const row of res.data){
                    workSum = workSum + row.work
                }
                return workSum
            })
    }

}
</script>

<style scoped>

</style>
