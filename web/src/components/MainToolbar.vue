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
        <v-list-tile v-for="item in userItems" :key="item.title" :to="item.to" exact>
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
        </v-list-tile>

				<v-divider v-if="userItems.length"></v-divider>

        <v-list-tile v-for="(item, i) in adminItems" :key="i" :to="item.to">
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
        </v-list-tile>

        <v-list-tile v-if="$store.state.user && $store.state.user.username" @click.prevent="logout">
          <v-list-tile-title>Выйти</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-else :to="{name: 'login'}">
          <v-list-tile-title>Войти</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-toolbar>
</template>

<script>
import { onLogout } from "@/vue-apollo.js";

export default {
	name: "MainToolbar",
	computed: {
		userItems() {
			return this.$store.state.menu.user;
		},
		adminItems() {
			if (this.$store.state.user && this.$store.state.user.isAdmin) {
				return this.$store.state.menu.admin
			} else {
				return []
			}
		}
	},
  methods: {
    sideIconClick() {
      this.$emit("side-icon-click");
    },
    logout() {
      this.$store.commit("clearUser");
      onLogout(this.$apollo.provider.defaultClient);
    }
  }
};
</script>
