<template>
	<router-view></router-view>
</template>

<script>
export default {
	name: "Food",
	// components: {},
	data() {
		return {
			//
		}
	},
	// computed: {},
	// watch: {},
	// methods: {},
	// created() {},
	mounted() {
		this.$store.commit("setMenu", {
			admin: [
				{
					title: "Add Dish",
					to: { name: "food_dish" },
				},
				{
					title: "Edit Types",
					to: { name: "food_type" },
				},
				{
					title: "Edit Ingredients",
					to: { name: "food_ingredient" },
				},
			],
			user: [],
		})
	},
}
</script>
