<template>
	<v-form ref="form" @submit.prevent="login">
		<v-layout column>
			<v-flex>
				<v-text-field v-model.trim="form.username" label="Имя пользователя" :rules="form.textRules" required></v-text-field>
				<v-text-field v-model.trim="form.password" label="Пароль" :rules="form.textRules" type="password" required></v-text-field>
			</v-flex>

			<v-flex mt-3>
				<v-layout>
					<v-flex shrink>
						<v-btn color="primary" outline @click="goBack">
							<v-icon>navigate_before</v-icon>Назад
						</v-btn>
					</v-flex>
					<v-spacer></v-spacer>
					<v-flex shrink>
						<v-btn color="primary" type="submit" :loading="form.loading" :disabled="form.loading">
							Войти
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</v-form>
</template>

<script>
import { onLogin } from "@/vue-apollo.js";
import { textRequired } from "@/utils/rules.js";

export default {
  name: "Login",
  data() {
    return {
			form: {
            // username: "admin",
            // password: "admin",
				username: "",
				password: "",
				loading: false,
				textRules: [textRequired],
			}
    };
  },
  mounted() {
    this.$store.commit("setMenu", {
      admin: [],
			user: []
    });
	},
	methods: {
    async login() {
			if (!this.$refs.form.validate()) return;

			this.graphql({
				mutation: "mutation($username: String!, $password: String!) { login(username: $username, password: $password) { username isAdmin } }",
				variables: {
					username: this.form.username,
					password: this.form.password
				},
				loadingKey: "form",
			},
			(data, result) => {
				this.$store.commit("setUser", result.token);
				onLogin(this.$apollo.provider.defaultClient, result.token);
				this.goBack();
			});
    },
		goBack() {
			this.$router.go(-1);
		},
	}
};
</script>

