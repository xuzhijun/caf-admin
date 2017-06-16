import Vue from 'vue'
import ElementUI from 'element-ui'
// import '../../css/scss/font-awesome.scss'
import 'element-ui/lib/theme-default/index.css'
import App from './index.vue'
Vue.use(ElementUI)

new Vue({
  el: '#app',
  render: h => h(App)
})
