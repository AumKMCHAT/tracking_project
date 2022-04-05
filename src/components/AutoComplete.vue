<template>
    <v-autocomplete
    :color="color"
    :value="value"
    :items="items"
    :rules="rule ? [v => !!v || rule]:[]"
    :label="label"
    :required="required"
    @change="eventChange"
    ></v-autocomplete>
</template>

<script>

export default {
    props: {
        color: {
            default: '#5DADE2'
        },
        value: {
            default: ''
        },
        items: {
            default: () => ([])
        },
        rule: {
            default: ''
        },
        label: {
            default: ''
        },
        required: {
            default: true
        }
    },
    methods: {
        eventChange (val) {
            this.$emit('onChange', val)
        }
    }
}
</script>
