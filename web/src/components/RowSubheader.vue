<template>
	<v-row>
		<v-col cols="auto">
			<v-btn color="black" :to="to" text><v-icon>mdi-arrow-left</v-icon> Go back</v-btn>
		</v-col>
		<v-col class="text-h5">
			<slot></slot>
		</v-col>
	</v-row>
</template>

<script>
export default {
	name: "RowSubheader",
	// components: {},
	props: ["to"],
	data() {
		return {
			//
		}
	},
	// computed: {},
	// watch: {},
	// methods: {},
	// created() {},
	// mounted() {},
}
</script>
