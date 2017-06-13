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