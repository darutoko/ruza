<template>
	<v-container fluid>
		<v-row>
			<v-col class="pa-0">
				<v-form ref="lookupForm" :disabled="lookup.isLoading" @submit.prevent="lookupYaDi">
					<v-container fluid>
						<v-row align="center">
							<v-col cols="12" md="1" class="pl-0">
								<v-select v-model="lookup.lang" :items="lookup.langs"></v-select>
							</v-col>
							<v-col class="px-0">
								<v-text-field
									v-model.trim="lookup.text"
									label="Enter a word"
									autocomplete="off"
									:rules="lookup.rules"
									required
								></v-text-field>
							</v-col>
							<v-col cols="auto" class="pr-0">
								<v-btn color="blue darken-3" type="submit" :loading="lookup.isLoading" dark>Lookup</v-btn>
							</v-col>
						</v-row>
					</v-container>
				</v-form>
			</v-col>
		</v-row>

		<v-row>
			<v-col class="pa-0">
				<v-form ref="cardForm" :disabled="isCardUploading" @submit.prevent="addCard">
					<v-container fluid>
						<v-row>
							<v-col>
								<v-select v-model="defSelected" :items="defOptions"></v-select>
							</v-col>
						</v-row>
						<v-row>
							<v-col cols="1">Input</v-col>
							<v-col>{{ input }}</v-col>
						</v-row>
						<v-row align="center">
							<v-col cols="1">Front</v-col>
							<v-col>
								<pre>{{ front }}</pre>
							</v-col>
						</v-row>
						<v-row align="center">
							<v-col cols="1">
								<p>Back</p>
								<v-btn color="blue darken-3" v-if="tr.length" @click="showDialog" dark>Edit</v-btn>
							</v-col>
							<v-col>
								<v-checkbox v-model="backSelected" v-for="row in tr" :label="row" :value="row" :key="row" dense></v-checkbox>
							</v-col>
						</v-row>
						<v-row>
							<v-col>
								<v-btn color="blue darken-3" type="submit" :loading="isCardUploading" dark>Add Card</v-btn>
							</v-col>
						</v-row>
					</v-container>
				</v-form>
			</v-col>
		</v-row>

		<v-row justify="center">
			<v-dialog v-model="dialog.isVisible" max-width="500" persistent>
				<v-card>
					<v-card-title class="headline blue darken-3 white--text">
						Edit Translations
					</v-card-title>
					<v-divider class="mb-4"></v-divider>
					<v-card-text>
						<p v-for="(row, i) in dialog.tr" :key="i">
							<v-chip
								v-for="(trans, j) in row"
								:key="j"
								class="mr-1 mb-1"
								:close="row.length > 1"
								@click:close="() => removeTranslation(i, j)"
								>{{ trans }}</v-chip
							>
						</p>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-btn color="blue darken-3" @click="confirmDialog" text>Ok</v-btn>
						<v-spacer></v-spacer>
						<v-btn @click="hideDialog" text>Cancel</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-row>
	</v-container>
</template>

<script>
import { textRequired } from "@/utils/rules.js"

export default {
	name: "CardFormYaDi",
	props: {
		isCardUploading: Boolean,
	},
	data() {
		return {
			backSelected: [],
			def: [],
			defSelected: "",
			lookup: {
				text: "",
				lang: "fr-ru",
				langs: [
					{
						text: "fr-ru",
						value: "fr-ru",
					},
				],
				isLoading: false,
				rules: [textRequired],
			},
			dialog: {
				isVisible: false,
				tr: [],
			},
		}
	},
	computed: {
		defOptions() {
			var options = this.def.map((def, i) => ({ text: `${i + 1}. ${def.pos}`, value: i }))
			if (options.length) this.defSelected = 0
			return options
		},
		input() {
			if (!this.def.length || this.defSelected === "") return ""
			return this.def[this.defSelected].text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
		},
		front() {
			if (!this.def.length || this.defSelected === "") return ""
			return `${this.def[this.defSelected].text}\n[${this.def[this.defSelected].ts}]`
		},
		tr() {
			if (!this.def.length || this.defSelected === "") return []
			return this.def[this.defSelected].tr
		},
	},
	methods: {
		addCard() {
			if (!this.input || !this.front || this.backSelected.length < 1) return

			this.$emit("add-card", {
				input: this.input,
				front: this.front,
				back: this.getBack(),
				testByFront: false,
			})

			this.clear()
		},
		clear() {
			this.backSelected = []
			this.def = []
			this.defSelected = ""
		},
		getBack() {
			if (this.backSelected.length == 1) return this.backSelected[0]
			return this.backSelected.map((s, i) => `${i + 1}. ${s}`).join("\n")
		},
		async lookupYaDi() {
			if (!this.$refs.lookupForm.validate()) return

			this.clear()
			let data = await this.$fetcher({
				autofill: true,
				toggle: value => (this.lookup.isLoading = value),
				payload: {
					query: "query($text: String!, $lang: String!){ yandexDictionary(text: $text, lang: $lang) { text pos ts tr } }",
					variables: {
						text: this.lookup.text,
						lang: this.lookup.lang,
					},
				},
			})

			if (!data) return
			this.lookup.text = ""
			this.def = data.yandexDictionary
		},
		confirmDialog() {
			this.def[this.defSelected].tr = this.dialog.tr.map(t => t.join(", "))
			this.hideDialog()
		},
		hideDialog() {
			this.dialog.tr = []
			this.dialog.isVisible = false
		},
		showDialog() {
			this.dialog.tr = this.tr.map(t => t.split(", "))
			this.dialog.isVisible = true
		},
		removeTranslation(row, element) {
			if (this.dialog.tr[row] <= 1) return
			this.dialog.tr[row].splice(element, 1)
		},
	},
}
</script>
