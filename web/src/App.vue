<template>
  <v-app>
    <MainNav :isShown="isMenuShown"/>

    <MainToolbar v-on:side-icon-click="toggleDrawer"/>

    <v-content>
      <v-progress-linear app v-if="isLoading" :indeterminate="true"></v-progress-linear>

      <v-container>
        <v-layout mb-2>
          <v-flex>
            <v-alert
              v-for="( alert, index ) in $store.state.alerts"
              :key="index"
              v-model="alert.isShown"
              :type="alert.type"
              dismissible>{{ alert.message }}</v-alert>
						<v-snackbar v-model="$store.state.snackbar.isShown" :timeout="$store.state.snackbar.timeout" :top="true">
							{{ $store.state.snackbar.message }}
						</v-snackbar>
          </v-flex>
        </v-layout>

        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import MainNav from "@/components/MainNav.vue";
import MainToolbar from "@/components/MainToolbar.vue";

export default {
  name: "App",
  components: {
    MainNav,
    MainToolbar
  },
  data() {
    return {
      isMenuShown: null
    };
	},
	computed: {
		isLoading() { return this.$store.state.loading > 0 }
	},
  methods: {
    toggleDrawer() {
      this.isMenuShown = !this.isMenuShown;
    }
  },
  created() {
    this.$store.commit("setUser", localStorage.getItem("apollo-token"));
  }
};
</script>
