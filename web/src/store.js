import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		alerts: [],
		user: {}
	},
	mutations: {
		addAlert(state, payload) {
			payload.isShown = true;
			state.alerts.push(payload);
		},
		setUser(state, payload) {
			if (Math.round(Date.now() / 1000) > payload.exp) return;

			state.user = {
				username: payload.username,
				isAdmin: payload.isAdmin
			};
		},
		clearUser(state) {
			state.user = {};
		}
	},
	actions: {

	}
})
