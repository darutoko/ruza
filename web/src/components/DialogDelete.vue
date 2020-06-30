<template>
	<v-dialog :value="value" @input="handleInput" max-width="500">
		<v-card>
			<v-card-title class="headline red darken-3 white--text">
				Attention!
			</v-card-title>
			<v-divider class="mb-4"></v-divider>
			<v-card-text class="text-body-1">
				<slot></slot>
			</v-card-text>
			<v-divider></v-divider>
			<v-card-actions>
				<v-btn color="red darken-3" @click="handleConfirm" :loading="isLoading" text>Confirm</v-btn>
				<v-spacer></v-spacer>
				<v-btn @click="handleInput(false)" :disabled="isLoading" text>Cancel</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: "DialogDelete",
	props: ["value", "isLoading"],
	// components: {},
	data() {
		return {
			//
		}
	},
	// computed: {},
	// watch: {},
	methods: {
		handleConfirm(event) {
			this.$emit("confirm-click", event)
		},
		handleInput(value) {
			this.$emit("input", value)
		},
	},
	// created() {},
	// mounted() {},
}
</script>
