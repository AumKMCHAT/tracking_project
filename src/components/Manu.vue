<template>
    <v-sheet>
        <v-tabs
        background-color="#11b8b8"
        :value="$route.path"
        dark
        next-icon="chevron_right"
        prev-icon="chevron_left"
        show-arrows>

            <v-tabs-slider color="yellow"></v-tabs-slider>

            <v-tab
            href="/">
                Tracking
            </v-tab>

            <v-tab
            href="/leave">
                Leave
            </v-tab>

            <v-tab
            href="/submission">
                Submission
            </v-tab>

            <v-tab
            href="/summary">
                Summary
            </v-tab>

            <v-tab
            href="/viewleave">
                Approval
            </v-tab>

        </v-tabs>
    </v-sheet>
    
</template>

<script>
export default {
    data: () => ({
    })
}

</script>
