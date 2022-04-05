<template>
    <v-select
    :color="color"
    :value="value"
    :items="items"
    :rules="rule ? [v => !!v || rule]:[]"
    :label="label"
    :required="required"
    :readonly="readonly"
    @change="eventChange"
    ></v-select>
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
        },
        readonly: {
            default: false
        }
    },
    methods: {
        eventChange (val) {
            this.$emit('onChange', val)
        }
    }
}
</script>
