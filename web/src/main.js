import Vue from 'vue'
import gql from "graphql-tag";
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import { createProvider } from './vue-apollo'

Vue.config.productionTip = false;
Vue.prototype.$gql = gql;

new Vue({
	router,
	store,
	apolloProvider: createProvider(),
	render: h => h(App)
}).$mount('#app')
