<template>
    <v-text-field
    :value="value"
    @change="eventChange"
    ></v-text-field>
</template>

<script>

export default {
    props: {
        value: {
            default: ''
        }
    },
    methods: {
        eventChange (val) {
            this.$emit('onChange', val)
        }
    }
}
</script>
