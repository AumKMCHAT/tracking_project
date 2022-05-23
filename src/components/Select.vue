<template>
    <v-select
    :menu-props="menu"
    :color="color"
    :value="value"
    :items="items"
    :rules="rule ? [v => !!v || rule]:[]"
    :label="label"
    :required="required"
    :readonly="readonly"
    :append-icon="readonly ? undefined : 'arrow_drop_down'"
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
        },
        menu: {
            default: 'offsetY'
        }
    },
    methods: {
        eventChange (val) {
            this.$emit('onChange', val)
        }
    }
}
</script>
