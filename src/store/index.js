import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    icon: ''
  },
  mutations: {
    setIcon(state, icon) {
        state.icon = icon
    }
  }
})

export default store
