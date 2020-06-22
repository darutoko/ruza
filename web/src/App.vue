<template>
	<v-app>
		<AppDrawer v-model="isDrawer"></AppDrawer>
		<AppBar @nav-icon-click="handleNavIconClick"></AppBar>

		<v-main>
			<v-progress-linear
				class="mt-1"
				:active="$store.state.isLoading"
				color="blue darken-3"
				height="4"
				:style="{ 'z-index': 100 }"
				fixed
				indeterminate
			></v-progress-linear>

			<v-container>
				<v-row>
					<v-col>
						<v-alert v-for="(alert, index) in $store.state.alerts" :color="alert.color" :type="alert.type" :key="index" dark dismissible>
							{{ alert.message }}
						</v-alert>
						<v-snackbar :value="$store.state.snackbar.isVisible" :timeout="$store.state.snackbar.timeout" left>
							{{ $store.state.snackbar.message }}
							<v-btn @click="handleCloseSnackbar" text dark>Close</v-btn>
						</v-snackbar>
					</v-col>
				</v-row>
			</v-container>

			<router-view></router-view>
		</v-main>
	</v-app>
</template>

<script>
import AppBar from "@/components/AppBar"
import AppDrawer from "@/components/AppDrawer"

export default {
	name: "App",
	components: {
		AppBar,
		AppDrawer,
	},
	data() {
		return {
			isDrawer: null,
		}
	},
	// computed: {},
	// watch: {},
	methods: {
		handleNavIconClick() {
			this.isDrawer = !this.isDrawer
		},
		handleCloseSnackbar() {
			this.$store.commit("hideSnackbar")
		},
	},
	// created() {},
	// mounted() {},
}
</script>
