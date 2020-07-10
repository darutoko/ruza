<template>
	<router-view></router-view>
</template>

<script>
export default {
	name: "Videos",
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
			user: [
				{
					title: "Disk",
					to: { name: "videos_disk" },
				},
				{
					title: "Internet",
					to: { name: "videos_internet" },
				},
			],
		})
	},
}
</script>
