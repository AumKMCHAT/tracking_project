<template>
    <v-sheet>
        <v-tabs
        background-color="#11b8b8"
        :value="$route.path"
        dark
        next-icon="mdi-arrow-right-bold-box-outline"
        prev-icon="mdi-arrow-left-bold-box-outline"
        show-arrows>

            <v-tabs-slider color="yellow"></v-tabs-slider>

            <v-tab
            href="/">
                Tracking Form
            </v-tab>

            <v-tab
            href="/submission">
                Submission
            </v-tab>

            <v-tab
            href="/summary">
                Summary
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
