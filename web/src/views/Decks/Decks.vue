<template>
	<router-view></router-view>
</template>

<script>
export default {
	name: "Decks",
	// components: {},
	data() {
		return {}
	},
	// computed: {}
	// watch: {},
	// methods: {}
	// created() {},
	mounted() {
		this.$store.commit("setMenu", {
			admin: [],
			user: [],
		})
	},
}
</script>
