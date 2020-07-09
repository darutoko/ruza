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
		initUser(state) {
			let value = localStorage.getItem("user")
			if (!value) return
			try {
				let user = JSON.parse(value)
				let token = user.token.split(".")[1]
				let data = JSON.parse(atob(token))
				if (Math.round(Date.now() / 1000) > data.exp) throw new Error("Token expired")
				state.user = user
			} catch {
				localStorage.removeItem("user")
			}
		},
		setUser(state, payload) {
			state.user = {
				username: payload.login.username,
				isAdmin: payload.login.isAdmin,
				token: payload.token,
			}
			localStorage.setItem("user", JSON.stringify(state.user))
		},
		clearUser(state) {
			state.user = {}
			localStorage.removeItem("user")
		},
		setMenu(state, payload) {
			state.menu.user = payload.user || []
			state.menu.admin = payload.admin || []
		},
	},
	actions: {},
	modules: {},
})
