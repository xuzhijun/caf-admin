<template>
  <div id="app">
  </div>
</template>

<script>
import Api from '../../api'
export default {
  data() {
    return {
    }
  },
  methods: {
    test: function() {
      let a = Api.resource_list();

    }
  },
  mounted() {
    this.test();
  },
  created() {

  }
}
</script>
<style lang="scss">
body, html, input, textarea, select, button {
  font-family: "Helvetica Neue",Helvetica,"Microsoft YaHei","微软雅黑","PingFang SC","Hiragino Sans GB",Arial,sans-serif;
}
</style>
