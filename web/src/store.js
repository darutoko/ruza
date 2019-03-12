import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		user: {},
		alerts: [],
		loading: 0,
		menu: {
			user: [],
			admin: [],
		}
	},
	mutations: {
		success(state, message) {
			state.alerts.push({ type: "success", isShown: true, message });
		},
		error(state, message) {
			state.alerts.push({ type: "error", isShown: true, message });
		},
		addAlert(state, payload) {
			payload.isShown = true;
			state.alerts.push(payload);
		},
		setUser(state, payload) {
			let user = parseToken(payload);

			if (!Object.keys(user).length) return;
			if (Math.round(Date.now() / 1000) > user.exp) return;

			state.user = {
				username: user.username,
				isAdmin: user.isAdmin
			};
		},
		clearUser(state) {
			state.user = {};
		},
		setMenu(state, payload) {
			state.menu.user = payload.user || [];
			state.menu.admin = payload.admin || [];
		},
		loadingStop(state)  { state.loading-- },
		loadingStart(state) { state.loading++ },
		loading(state, isLoading) {
			if (isLoading === true) state.loading++
			if (isLoading === false) state.loading--
		},
	},
	actions: {

	}
});

function parseToken(payload) {
	let user = {};
	let token = (payload || "").split(".")[1];

	if (!token) return user;

	try {
		user = JSON.parse(atob(token));
	} catch {
		user = {};
	}

	return user;
}