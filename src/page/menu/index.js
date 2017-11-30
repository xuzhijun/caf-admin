import Vue from 'vue'
import ElementUI from 'element-ui'
import store from '../../store/index'
import 'element-ui/lib/theme-default/index.css'
import '../../css/style.scss'
import App from './index.vue'
Vue.use(ElementUI)

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
