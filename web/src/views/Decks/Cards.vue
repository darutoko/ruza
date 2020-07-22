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
											<component :is="cardForm.type" @add-card="handleFormSubmit" :is-card-uploading="cardForm.isLoading"></component>
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
				<v-data-table :headers="headers" :items="cards" v-model="selectedCards" sort-by="input" :items-per-page="25" show-select>
					<template v-slot:top>
						<v-container fluid>
							<v-row>
								<v-col></v-col>
								<v-col cols="auto">
									<v-btn
										color="blue darken-3"
										title="Move cards"
										:disabled="!isCardsSelected"
										:dark="isCardsSelected"
										@click="handleMoveClick"
										icon
										large
									>
										<v-icon large>mdi-swap-horizontal-bold</v-icon>
									</v-btn>
								</v-col>
								<v-col cols="auto">
									<v-btn
										color="red darken-3"
										title="Delete cards"
										:disabled="!isCardsSelected"
										:dark="isCardsSelected"
										@click="handleDeleteClick"
										icon
										large
									>
										<v-icon large>mdi-delete</v-icon>
									</v-btn>
								</v-col>
							</v-row>
						</v-container>
					</template>
					<template v-slot:item.streak="{ item }">
						<v-progress-circular color="success" :rotate="-90" width="6" :value="(item.streak * 100) / deck.streakSize">{{
							item.streak
						}}</v-progress-circular>
					</template>
					<template v-slot:item.updatedAt="{ item }">
						{{ formatDate(item.updatedAt) }}
					</template>
				</v-data-table>
			</v-col>
		</v-row>

		<v-row>
			<v-col>
				<DialogDelete v-model="move.isVisible" :isLoading="move.isLoading" @confirm-click="handleConfirmMoveClick">
					Move <strong>{{ this.selectedCards.length }}</strong> cards to:
					<v-select v-model="move.selected" :items="move.select"></v-select>
				</DialogDelete>
				<DialogDelete v-model="del.isVisible" :isLoading="del.isLoading" @confirm-click="handleConfirmDeleteClick">
					Delete <strong>{{ this.selectedCards.length }}</strong> cards?
				</DialogDelete>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { textRequired } from "@/utils/rules.js"
import RowSubheader from "@/components/RowSubheader"
import DialogDelete from "@/components/DialogDelete"
import CardFormDefault from "./_components/CardFormDefault"
import CardFormYaDi from "./_components/CardFormYaDi"

export default {
	name: "Cards",
	components: { DialogDelete, RowSubheader, CardFormDefault, CardFormYaDi },
	data() {
		return {
			deck: {},
			headers: [
				{
					text: "Input",
					value: "input",
					sortable: true,
					width: "88%",
				},
				{
					text: "Streak",
					value: "streak",
					sortable: true,
					width: "5%",
				},
				{
					text: "Last test",
					value: "updatedAt",
					sortable: true,
					width: "7%",
				},
			],
			selectedCards: [],
			cards: [],
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
			move: {
				selected: "",
				select: [],
				isVisible: false,
				isLoading: false,
			},
			del: {
				isVisible: false,
				isLoading: false,
			},
		}
	},
	computed: {
		isCardsSelected() {
			return this.selectedCards.length > 0
		},
	},
	// watch: {},
	methods: {
		async handleFormSubmit(card) {
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
		async handleConfirmDeleteClick() {
			let data = await this.$fetcher({
				toggle: value => (this.del.isLoading = value),
				payload: {
					query:
						"mutation deleteCards($deckId: Int!, $ids: [Int!]){ deleteCards(deckId: $deckId, ids: $ids) { id input front back streak updatedAt } }",
					variables: {
						deckId: this.$route.params.id,
						ids: this.selectedCards.map(c => c.id),
					},
				},
			})

			if (!data) return
			this.cards = data.deleteCards
			this.del.isVisible = false
			this.selectedCards = []
			this.$store.commit("showSnackbar", "Cards has been deleted")
		},
		async handleConfirmMoveClick() {
			let data = await this.$fetcher({
				toggle: value => (this.move.isLoading = value),
				payload: {
					query:
						"mutation moveCards($deckId: Int!, $newDeckId: Int!, $ids: [Int!]){ moveCards(deckId: $deckId, newDeckId: $newDeckId, ids: $ids) { id input front back streak updatedAt } }",
					variables: {
						deckId: this.$route.params.id,
						ids: this.selectedCards.map(c => c.id),
						newDeckId: this.move.selected,
					},
				},
			})

			if (!data) return
			this.cards = data.moveCards
			this.move.isVisible = false
			this.selectedCards = []
			this.$store.commit("showSnackbar", "Cards has been moved")
		},
		handleDeleteClick() {
			this.del.isVisible = true
		},
		async handleMoveClick() {
			let data = await this.$fetcher({
				payload: {
					query: "{ decks { id name } }",
				},
			})

			if (!data) return
			data = data.decks.filter(d => d.id != this.$route.params.id).map(d => ({ text: d.name, value: d.id }))
			this.move.select = data
			this.move.selected = data[0].value
			this.move.isVisible = true
		},
		formatDate(updatedAt) {
			let date = new Date(Number.parseInt(updatedAt))
			return (
				date.getFullYear() +
				"-" +
				(date.getMonth() + 1).toString().padStart(2, "0") +
				"-" +
				date
					.getDate()
					.toString()
					.padStart(2, "0")
			)
		},
	},
	created() {
		this.$fetcher({
			autofill: true,
			payload: {
				query: "query($id: Int!){ cards(deckId: $id) { id input front back streak updatedAt } deck(id: $id) { id name streakSize } }",
				variables: {
					id: this.$route.params.id,
				},
			},
		})
	},
	// mounted() {},
}
</script>
