<template>
    <div class="caf-icons">
        <section>
            <el-row :gutter="20">
                <el-col v-for="(value, key) in iconGroups" :key="key" :md="6" :sm="8">
                    <caf-icon :name="key" />
                </el-col>
            </el-row>
        </section>
    </div>
</template>
<script>
import Icon from './icon.vue'
export default {
    data: function() {
        return {
            prefix: '',
            iconsAll: {
                'fa': require('./font-awesome.json')
            },
            iconGroups: []
        }
    },
    props: ['type'],
    components: {
        'caf-icon': Icon
    },
    created() {
        this.prefix = this.type;
        this.iconGroups = this.iconsAll[this.type] ? this.iconsAll[this.type] : []
    }
}
</script>
