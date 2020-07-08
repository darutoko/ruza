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
						<v-snackbar v-model="isSnackbar" :timeout="$store.state.snackbar.timeout" left>
							{{ $store.state.snackbar.message }}
							<template v-slot:action>
								<v-btn @click="handleCloseSnackbar" text dark>Close</v-btn>
							</template>
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
	computed: {
		isSnackbar: {
			get() {
				return this.$store.state.snackbar.isVisible
			},
			set(value) {
				this.$store.commit("hideSnackbar")
			},
		},
	},
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
