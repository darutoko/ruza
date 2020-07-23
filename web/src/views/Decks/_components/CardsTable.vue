<template>
	<v-data-table :headers="headers" :items="cards" v-model="selectedCards" sort-by="input" :items-per-page="25" show-select dense>
		<template v-slot:top>
			<v-container fluid>
				<v-row>
					<v-col>
						<v-btn color="blue darken-3" title="Select completed" @click="handleSelectCompletedClick" icon large>
							<v-icon large>mdi-check-all</v-icon>
						</v-btn>
						<v-btn color="blue darken-3" title="Select failed" @click="handleSelectFailedClick" icon large>
							<v-icon large>mdi-cancel</v-icon>
						</v-btn>
					</v-col>
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
						<DialogDelete
							v-model="dialog.isVisible"
							v-if="dialog.isDeleting"
							:isLoading="isCardsLoading"
							@confirm-click="handleConfirmDeleteClick"
						>
							Delete <strong>{{ selectedCards.length }}</strong> cards?
						</DialogDelete>
						<DialogDelete v-model="dialog.isVisible" v-else :isLoading="isCardsLoading" @confirm-click="handleConfirmMoveClick">
							Move <strong>{{ selectedCards.length }}</strong> cards to:
							<v-select v-model="dialog.deck" :items="decks"></v-select>
						</DialogDelete>
					</v-col>
				</v-row>
			</v-container>
		</template>
		<template v-slot:item.streak="{ item }">
			<v-progress-circular color="success" :rotate="-90" width="6" :value="(item.streak * 100) / streakSize">
				{{ item.streak }}
			</v-progress-circular>
		</template>
		<template v-slot:item.updatedAt="{ item }">
			{{ formatDate(item.updatedAt) }}
		</template>
	</v-data-table>
</template>

<script>
import DialogDelete from "@/components/DialogDelete"

export default {
	name: "CardsTable",
	components: { DialogDelete },
	props: ["cards", "decks", "streakSize", "isCardsLoading"],
	data() {
		return {
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
			dialog: {
				deck: 0,
				isDeleting: false,
				isLoading: false,
				isVisible: false,
			},
		}
	},
	computed: {
		isCardsSelected() {
			return this.selectedCards.length > 0
		},
	},
	watch: {
		isCardsLoading() {
			this.dialog.isVisible = this.isCardsLoading
		},
	},
	methods: {
		handleDeleteClick() {
			this.dialog.isDeleting = true
			this.dialog.isVisible = true
		},
		handleConfirmDeleteClick() {
			this.$emit(
				"delete-cards",
				this.selectedCards.map(card => card.id)
			)
			this.selectedCards = []
			this.dialog.isVisible = false
		},
		handleMoveClick() {
			this.dialog.deck = this.decks[0].value
			this.dialog.isDeleting = false
			this.dialog.isVisible = true
		},
		handleConfirmMoveClick() {
			this.$emit(
				"move-cards",
				this.dialog.deck,
				this.selectedCards.map(card => card.id)
			)
			this.selectedCards = []
			this.dialog.isVisible = false
		},
		handleSelectCompletedClick() {
			this.selectedCards = this.cards.filter(card => card.streak >= this.streakSize)
		},
		handleSelectFailedClick() {
			this.selectedCards = this.cards.filter(card => !card.streak)
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
	// created() {},
	// mounted() {},
}
</script>
