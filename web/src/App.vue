<template>
  <v-app>
    <MainMenu :isShown="isMenuShown"/>

    <v-toolbar app clipped-left dark color="blue darken-3">
      <v-toolbar-side-icon @click="toggleDrawer"></v-toolbar-side-icon>
      <v-toolbar-title>HMWA</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click.prevent="login">Login</v-btn>
    </v-toolbar>

    <v-content>
      <v-progress-linear app v-if="$apollo.loading" :indeterminate="true"></v-progress-linear>

      <v-container>
        <v-layout mb-2>
          <v-flex>
            <v-alert
              v-for="( alert, index ) in $store.state.alerts"
              :key="index"
              v-model="alert.isShown"
              :type="alert.type"
              dismissible
            >{{ alert.message }}</v-alert>
          </v-flex>
        </v-layout>

        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import gql from "graphql-tag";
import { onLogin, onLogout } from "@/vue-apollo.js";
import MainMenu from "@/components/MainMenu.vue";

export default {
  name: "App",
  components: {
    MainMenu
  },
  data() {
    return {
      isMenuShown: null
    };
  },
  methods: {
    toggleDrawer() {
      this.isMenuShown = !this.isMenuShown;
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
        .then(result =>
          onLogin(this.$apollo.provider.defaultClient, result.token)
        );
    }
  }
};
</script>
