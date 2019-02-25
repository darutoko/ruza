<template>
  <v-layout column>
    <v-flex>
			<v-form>
        <v-text-field v-model.trim="username" label="Имя пользователя" :rules="usernameRules" required></v-text-field>
        <v-text-field v-model.trim="password" label="Пароль" :rules="passwordRules" type="password" required></v-text-field>
			</v-form>
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
					<v-btn color="primary" :loading="isLoading" :disabled="isLoading" @click="login">
						Войти
					</v-btn>
				</v-flex>
			</v-layout>
		</v-flex>
  </v-layout>
</template>

<script>
import { onLogin } from "@/vue-apollo.js";

export default {
  name: "Login",
  data() {
    return {
            // username: "admin",
            // password: "admin",
			username: "",
			password: "",
			isLoading: false,
			usernameRules: [this.stringRequired],
			passwordRules: [this.stringRequired]
    };
  },
  mounted() {
    this.$store.commit("setMenu", {
      admin: [],
			user: []
    });
	},
	methods: {
    stringRequired(value) {
      if (value) return true;
      return "Поле необходимо заполнить";
		},
		goBack() {
			this.$router.go(-1);
		},
    async login() {
			this.isLoading = true;
			try {
				let result = await this.$apollo.mutate({
						mutation: this.$gql`
							mutation($username: String!, $password: String!) {
								login(username: $username, password: $password) {
									username
									isAdmin
								}
							}`,
						variables: {
							username: this.username,
							password: this.password
						},
				});
				this.$store.commit("setUser", result.token);
				onLogin(this.$apollo.provider.defaultClient, result.token);
				this.goBack();
			} catch (error) {
				this.$store.commit("addAlert", {
					type: "error",
					message: error.message
				});
			}
			this.isLoading = false;
    },
	}
};
</script>

