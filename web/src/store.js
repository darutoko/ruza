import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		alerts: []
	},
	mutations: {
		addAlert(state, payload) {
			payload.isShown = true;
			state.alerts.push(payload);
		}
	},
	actions: {

	}
})
