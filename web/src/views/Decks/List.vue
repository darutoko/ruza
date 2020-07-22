<template>
	<v-container>
		<v-row v-if="isAdmin">
			<v-col class="pa-0">
				<v-form ref="form" :disabled="add.isLoading" @submit.prevent="handleSubmitAddForm">
					<v-row align="center">
						<v-col cols="auto" class="text-right">
							<v-btn color="blue darken-3" title="Add deck" type="submit" :loading="add.isLoading" icon large dark>
								<v-icon large>mdi-plus-circle</v-icon>
							</v-btn>
						</v-col>
						<v-col>
							<v-text-field v-model.trim="add.value" label="Add deck" :rules="add.rules" required></v-text-field>
						</v-col>
					</v-row>
				</v-form>
			</v-col>
		</v-row>

		<v-row v-for="deck in decks" :key="deck.id">
			<v-col>
				<Deck v-bind="deck" @delete-deck="handleDeleteClick"></Deck>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { textRequired } from "@/utils/rules.js"
import Deck from "@/components/Deck.vue"

export default {
	name: "List",
	components: { Deck },
	data() {
		return {
			decks: [],
			add: {
				value: "",
				isLoading: false,
				rules: [textRequired, this.deckUniqueRule],
			},
		}
	},
	computed: {
		isAdmin() {
			return this.$store.state.user.isAdmin
		},
	},
	// watch: {},
	methods: {
		fetchDecks() {
			this.$fetcher({
				autofill: true,
				payload: {
					query: "{ decks { id name totalCards completedCards failedCards memorizeSize testSize isStrakDegrades } }",
				},
			})
		},
		async handleSubmitAddForm() {
			if (!this.$refs.form.validate()) return

			let data = await this.$fetcher({
				toggle: value => (this.add.isLoading = value),
				payload: {
					query: "mutation addDeck($name: String!){ addDeck(name: $name) }",
					variables: {
						name: this.add.value,
					},
				},
			})

			if (!data) return
			this.$store.commit("showSnackbar", "Deck added")
			this.$refs.form.reset()
			this.fetchDecks()
		},
		deckUniqueRule(name) {
			if (this.decks.some(deck => deck.name === name)) return "Deck name must be unique"
			return true
		},
		async handleDeleteClick(id) {
			let data = await this.$fetcher({
				payload: {
					query: "mutation deleteDeck($id: Int!){ deleteDeck(id: $id) }",
					variables: {
						id,
					},
				},
			})

			if (!data) return
			this.decks = this.decks.filter(d => d.id != id)
			this.$store.commit("showSnackbar", "Deck has been deleted")
		},
	},
	created() {
		this.fetchDecks()
	},
	// mounted() {},
}
</script>
