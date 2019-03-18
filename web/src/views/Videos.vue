<template>
  <v-layout column>
    <v-flex>
			Videos
    </v-flex>
  </v-layout>
</template>

<script>
export default {
	name: "Videos",
	// components: {},
	data() {
		return {
			//
		}
	},
	computed: {
		//
	},
	// watch: {},
	methods: {
		//
	},
	// created() {},
	mounted() {
    this.$store.commit("setMenu", {
      admin: [
        // {
        //   title: "Добавить Блюдо",
        //   to: { name: "food_dish" }
        // },
			],
			user: []
    });
	},
}
</script>