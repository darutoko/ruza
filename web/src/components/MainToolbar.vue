<template>
  <v-toolbar app clipped-left dark color="blue darken-3">
    <v-toolbar-side-icon @click="sideIconClick"></v-toolbar-side-icon>
    <v-toolbar-title>HMWA</v-toolbar-title>
    <v-spacer></v-spacer>

    <v-menu bottom left>
      <v-btn dark icon slot="activator">
        <v-icon>more_vert</v-icon>
      </v-btn>

      <v-list>
        <v-list-tile v-for="(item, i) in $store.state.menu.admin" :key="i" :to="item.to">
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
        </v-list-tile>

        <v-list-tile v-if="$store.state.user && $store.state.user.username" @click.prevent="logout">
          <v-list-tile-title>Выйти</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-else @click.prevent="login">
          <v-list-tile-title>Войти</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-toolbar>
</template>

<script>
import { onLogin, onLogout } from "@/vue-apollo.js";

export default {
  methods: {
    sideIconClick() {
      this.$emit("side-icon-click");
    },
    login() {
      this.$apollo
        .mutate({
          mutation: this.$gql`
            mutation($username: String!, $password: String!) {
              login(username: $username, password: $password) {
                username
                isAdmin
              }
            }
          `,
          variables: {
            username: "admin",
            password: "admin"
          }
        })
        .then(result => {
          this.$store.commit("setUser", result.token);
          onLogin(this.$apollo.provider.defaultClient, result.token);
        });
    },
    logout() {
      this.$store.commit("clearUser");
      onLogout(this.$apollo.provider.defaultClient);
    }
  }
};
</script>
