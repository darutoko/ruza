<template>
	<v-container>
		<RowSubheader :to="{ name: 'decks_list' }">{{ deck.name }}</RowSubheader>

		<v-row>
			<v-col class="pa-0">
				<v-expansion-panels flat>
					<v-expansion-panel>
						<v-expansion-panel-header>
							<h3>Add Flash Card</h3>
						</v-expansion-panel-header>
						<v-expansion-panel-content>
							<v-sheet class="px-4" elevation="5">
								<v-container fluid>
									<v-row align="center">
										<v-col cols="auto" class="pl-0">Card Type</v-col>
										<v-col>
											<v-select v-model="cardForm.type" :items="cardForm.types"></v-select>
										</v-col>
									</v-row>
									<v-row>
										<v-col class="pa-0">
											<component :is="cardForm.type" @add-card="handleAdd" :is-card-uploading="cardForm.isLoading"></component>
										</v-col>
									</v-row>
								</v-container>
							</v-sheet>
						</v-expansion-panel-content>
					</v-expansion-panel>
				</v-expansion-panels>
			</v-col>
		</v-row>

		<v-row>
			<v-col class="pa-0">
				<CardsTable
					:cards="cards"
					:decks="decks"
					:streakSize="deck.streakSize"
					:is-cards-loading="isCardsLoading"
					@delete-cards="handleDelete"
					@move-cards="handleMove"
				></CardsTable>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { textRequired } from "@/utils/rules.js"
import RowSubheader from "@/components/RowSubheader"
import CardFormDefault from "./_components/CardFormDefault"
import CardFormYaDi from "./_components/CardFormYaDi"
import CardsTable from "./_components/CardsTable"

export default {
	name: "Cards",
	components: { RowSubheader, CardFormDefault, CardFormYaDi, CardsTable },
	data() {
		return {
			deck: {},
			cards: [],
			decks: [],
			cardForm: {
				type: "CardFormDefault",
				types: [
					{
						text: "Default",
						value: "CardFormDefault",
					},
					{
						text: "Yandex Dictionary",
						value: "CardFormYaDi",
					},
				],
				isLoading: false,
			},
			isCardsLoading: false,
		}
	},
	// computed: {},
	// watch: {},
	methods: {
		async handleAdd(card) {
			let data = await this.$fetcher({
				toggle: value => (this.cardForm.isLoading = value),
				payload: {
					query:
						"mutation addCard($input: String!, $front: String!, $back: String!, $testByFront: Boolean!, $deckId: Int!){ addCard(input: $input, front: $front, back: $back, testByFront: $testByFront, deckId: $deckId) }",
					variables: {
						...card,
						deckId: this.$route.params.id,
					},
				},
			})

			if (!data) return
			this.$store.commit("showSnackbar", "Card added")
			this.cards.push({ ...card, streak: 0, updatedAt: Date.now() })
		},
		async handleDelete(ids) {
			let data = await this.$fetcher({
				toggle: value => (this.isCardsLoading = value),
				payload: {
					query:
						"mutation deleteCards($deckId: Int!, $ids: [Int!]){ deleteCards(deckId: $deckId, ids: $ids) { id input front back streak updatedAt } }",
					variables: {
						ids,
						deckId: this.$route.params.id,
					},
				},
			})

			if (!data) return
			this.cards = data.deleteCards
			this.$store.commit("showSnackbar", "Cards has been deleted")
		},
		async handleMove(newDeckId, ids) {
			let data = await this.$fetcher({
				toggle: value => (this.isCardsLoading = value),
				payload: {
					query:
						"mutation moveCards($deckId: Int!, $newDeckId: Int!, $ids: [Int!]){ moveCards(deckId: $deckId, newDeckId: $newDeckId, ids: $ids) { id input front back streak updatedAt } }",
					variables: {
						ids,
						newDeckId,
						deckId: this.$route.params.id,
					},
				},
			})

			if (!data) return
			this.cards = data.moveCards
			this.$store.commit("showSnackbar", "Cards has been moved")
		},
	},
	async created() {
		await this.$fetcher({
			autofill: true,
			payload: {
				query: "query($id: Int!){ cards(deckId: $id) { id input front back streak updatedAt } decks { id name streakSize } }",
				variables: {
					id: this.$route.params.id,
				},
			},
		})

		this.deck = this.decks.find(deck => deck.id == this.$route.params.id)
		this.decks = this.decks.filter(deck => deck.id != this.$route.params.id).map(deck => ({ text: deck.name, value: deck.id }))
	},
	// mounted() {},
}
</script>
