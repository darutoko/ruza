<template>
	<v-form ref="form" :disabled="isCardUploading" @submit.prevent="handleSubmitForm">
		<v-container fluid>
			<v-row>
				<v-col class="pa-0">
					<v-text-field v-model.trim="input" name="input" label="Input" :rules="rules"></v-text-field>
				</v-col>
			</v-row>
			<v-row>
				<v-col class="pa-0">
					<v-textarea v-model="front" name="front" label="Front" rows="3" :rules="rules"></v-textarea>
				</v-col>
			</v-row>
			<v-row>
				<v-col class="pa-0">
					<v-textarea v-model="back" name="back" label="Back" rows="3" :rules="rules"></v-textarea>
				</v-col>
			</v-row>
			<v-row>
				<v-col class="pa-0">
					<v-switch v-model="testByFront" label="Use card front in tests"></v-switch>
				</v-col>
			</v-row>
			<v-row>
				<v-col cols="auto">
					<v-btn color="blue darken-3" type="submit" :loading="isCardUploading" dark>Add Card</v-btn>
				</v-col>
				<v-col>
					<v-btn color="red darken-3" @click="clearForm" dark>Clear</v-btn>
				</v-col>
			</v-row>
		</v-container>
	</v-form>
</template>

<script>
import { textRequired } from "@/utils/rules.js"

export default {
	name: "CardFormDefault",
	props: {
		isCardUploading: Boolean,
	},
	data() {
		return {
			input: "",
			front: "",
			back: "",
			testByFront: false,
			rules: [textRequired],
		}
	},
	methods: {
		clearForm() {
			this.$refs.form.reset()
		},
		handleSubmitForm() {
			if (!this.$refs.form.validate()) return

			this.$emit("add-card", {
				input: this.input || "",
				front: this.front || "",
				back: this.back || "",
				testByFront: this.testByFront || false,
			})

			this.$refs.form.reset()
		},
	},
}
</script>
