<template>
  <v-toolbar app clipped-left dark color="blue darken-3">
    <v-toolbar-side-icon @click="toggleDrawer"></v-toolbar-side-icon>
    <v-toolbar-title>HMWA</v-toolbar-title>
    <v-spacer></v-spacer>

    <v-menu bottom left>
      <v-btn dark icon slot="activator">
        <v-icon>more_vert</v-icon>
      </v-btn>

      <v-list>
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
import gql from "graphql-tag";
import { onLogin, onLogout } from "@/vue-apollo.js";

export default {
  methods: {
    toggleDrawer() {
      this.$emit("toggle-drawer");
    },
    login() {
      this.$apollo
        .mutate({
          mutation: gql`
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
