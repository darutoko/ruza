<template>
	<v-form v-model="form.isValid" @submit.prevent="handleFormSubmit">
		<v-container>
			<v-row>
				<v-col>
					<v-text-field v-model.trim="form.username" label="Username" :rules="form.rules" autofocus required></v-text-field>
				</v-col>
			</v-row>
			<v-row>
				<v-col>
					<v-text-field v-model.trim="form.password" label="Password" :rules="form.rules" required></v-text-field>
				</v-col>
			</v-row>
			<v-row>
				<v-col>
					<v-btn color="blue darken-3" type="submit" :loading="form.isLoading" dark>Login</v-btn>
				</v-col>
			</v-row>
		</v-container>
	</v-form>
</template>

<script>
import { textRequired } from "@/utils/rules.js"

export default {
	name: "Login",
	// components: {},
	data() {
		return {
			form: {
				// username: "admin",
				// password: "admin",
				username: "",
				password: "",
				isLoading: false,
				isValid: true,
				rules: [textRequired],
			},
		}
	},
	// computed: {},
	// watch: {},
	methods: {
		async handleFormSubmit() {
			if (!this.form.isValid) return
			let data = await this.$fetcher({
				toggle: value => (this.form.isLoading = value),
				payload: {
					query:
						"mutation($username: String!, $password: String!) { login(username: $username, password: $password) { username isAdmin } }",
					variables: {
						username: this.form.username,
						password: this.form.password,
					},
				},
			})
			if (!data) return
			this.$store.commit("setUser", data)
			this.$router.go(-1)
		},
	},
	// created() {},
	mounted() {
		this.$store.commit("setMenu", {
			admin: [],
			user: [],
		})
	},
}
</script>
