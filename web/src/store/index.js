import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		user: {},
		alerts: [],
		isLoading: false,
		menu: {
			user: [],
			admin: [],
		},
		snackbar: {
			message: "",
			timeout: 4000,
			isVisible: false,
		},
	},
	mutations: {
		error(state, message) {
			state.alerts.push({ color: "red darken-3", type: "error", message })
		},
		success(state, message) {
			state.alerts.push({ color: "green darken-3", type: "success", message })
		},
		info(state, message) {
			state.alerts.push({ color: "blue darken-3", type: "info", message })
		},
		showSnackbar(state, message) {
			state.snackbar.message = message
			state.snackbar.isVisible = true
		},
		hideSnackbar(state) {
			state.snackbar.isVisible = false
		},
		setLoading(state, value) {
			state.isLoading = value
		},
		showIsLoading(state) {
			state.isLoading = true
		},
		hideIsLoading(state) {
			state.isLoading = false
		},
		setUser_(state, token) {
			let user = parseToken(token)

			if (!Object.keys(user).length) return
			if (Math.round(Date.now() / 1000) > user.exp) return

			state.user = {
				token,
				username: user.username,
				isAdmin: user.isAdmin,
			}
		},
		setUser(state, payload) {
			state.user = {
				username: payload.login.username,
				isAdmin: payload.login.isAdmin,
				token: payload.token,
			}
		},
		clearUser(state) {
			state.user = {}
		},
		setMenu(state, payload) {
			state.menu.user = payload.user || []
			state.menu.admin = payload.admin || []
		},
	},
	actions: {},
	modules: {},
})

function parseToken(payload) {
	let user = {}
	let token = (payload || "").split(".")[1]

	if (!token) return user

	try {
		user = JSON.parse(atob(token))
	} catch {
		user = {}
	}

	return user
}
