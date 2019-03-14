import Vue from 'vue'
import './plugins/vuetify'
import './plugins/graphql-query'
import App from './App.vue'
import router from './router'
import store from './store'
import { createProvider } from './vue-apollo'

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	apolloProvider: createProvider(),
	render: h => h(App)
}).$mount('#app')
