<template>
    <a class="icon" @dblclick="handlerEvent">
        <i :class="'el-icon-'+this.name"></i>{{name}}</a>
</template>
<script>
export default {
    props: ['prefix', 'name'],
    methods: {
        handlerEvent: function() {
            this.$store.commit('setIcon', this.name)
        }
    }
}    
</script>
<style lang="scss" scoped>
.icon {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    color: #222;
    line-height: 32px;
    height: 32px;
    padding: 0 10px;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;

    &:hover {
        color: #fff;
        background-color: #20a0ff;
    }
}
</style>

