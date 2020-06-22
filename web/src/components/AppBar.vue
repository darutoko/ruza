<template>
	<v-app-bar app color="blue darken-3" clipped-left dark>
		<v-app-bar-nav-icon @click="handleNavClick"></v-app-bar-nav-icon>
		<v-toolbar-title>HMWA</v-toolbar-title>

		<v-spacer></v-spacer>

		<v-menu left bottom>
			<template v-slot:activator="{ on }">
				<v-btn v-on="on" icon>
					<v-icon>mdi-dots-vertical</v-icon>
				</v-btn>
			</template>

			<v-list>
				<v-list-item v-for="(item, i) in userItems" :key="i" :to="item.to">
					<v-list-item-title>{{ item.title }}</v-list-item-title>
				</v-list-item>

				<v-divider v-if="userItems.length"></v-divider>

				<v-list-item v-for="(item, i) in adminItems" :key="i" :to="item.to">
					<v-list-item-title>{{ item.title }}</v-list-item-title>
				</v-list-item>

				<v-list-item v-if="$store.state.user && $store.state.user.username" @click.prevent="handleLogoutClick">
					<v-list-item-title>Logout</v-list-item-title>
				</v-list-item>
				<v-list-item v-else :to="{ name: 'login' }">
					<v-list-item-title>Login</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-menu>
	</v-app-bar>
</template>

<script>
export default {
	name: "AppBar",
	// components: {},
	data() {
		return {}
	},
	computed: {
		userItems() {
			return this.$store.state.menu.user
		},
		adminItems() {
			if (this.$store.state.user && this.$store.state.user.isAdmin) {
				return this.$store.state.menu.admin
			} else {
				return []
			}
		},
	},
	// watch: {},
	methods: {
		handleLogoutClick() {
			this.$store.commit("clearUser")
		},
		handleNavClick() {
			this.$emit("nav-icon-click")
		},
	},
	// created() {},
	// mounted() {},
}
</script>
