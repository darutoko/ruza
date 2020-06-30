export default {
	// toggle: function to change spinner/loader status
	// autofill: flag, if true - use response data object to fill instance data
	install(Vue, settings) {
		Vue.prototype.$fetcher = async function({ payload, toggle, autofill }) {
			let init = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			}

			let token = this.$store.state.user.token
			if (token) init.headers.Authorization = "Bearer " + token

			if (!toggle) toggle = value => this.$store.commit("setLoading", value)

			let data
			toggle(true)
			try {
				let response = await fetch("/api", init)

				data = await response.json()
				if (data.errors) throw new Error(data.errors[0].message)

				if (response.status >= 500) throw new Error(response.statusText)
				let contentType = response.headers.get("content-type")
				if (!contentType || !contentType.includes("application/json"))
					throw new Error("Expected JSON response from server but got: " + contentType)

				data = data.data
				if (autofill) for (let key in data) this[key] = data[key]
			} catch (error) {
				data = undefined
				this.$store.commit("error", error.message)
			}
			toggle(false)

			return data
		}
	},
}
