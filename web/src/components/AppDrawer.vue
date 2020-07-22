<template>
	<v-navigation-drawer :value="value" @input="handleDrawerInput" app clipped>
		<v-list>
			<v-list-item v-for="item in items" :key="item.title" :to="item.route" link>
				<v-list-item-icon>
					<v-icon>{{ item.icon }}</v-icon>
				</v-list-item-icon>
				<v-list-item-content>
					<v-list-item-title>{{ item.title }}</v-list-item-title>
				</v-list-item-content>
			</v-list-item>
		</v-list>
	</v-navigation-drawer>
</template>

<script>
export default {
	name: "AppDrawer",
	props: ["value"],
	data() {
		return {
			items: [
				{
					icon: "mdi-television",
					title: "TV-Series",
					route: { name: "shows_list" },
				},
				{
					icon: "mdi-silverware",
					title: "Food",
					route: { name: "food_list" },
				},
				{
					icon: "mdi-animation", //ballot
					title: "Flash Cards",
					route: { name: "decks_list" },
				},
				{
					icon: "mdi-youtube-tv",
					title: "Video",
					route: { name: "videos_disk" },
				},
			],
		}
	},
	// computed: {},
	// watch: {},
	methods: {
		handleDrawerInput(value) {
			this.$emit("input", value)
		},
	},
}
</script>
