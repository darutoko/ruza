<template>
	<v-container>
		<RowSubheader :to="{ name: 'decks_list' }"></RowSubheader>

		<v-row>
			<v-col>
				<v-card>
					<v-progress-linear color="blue darken-3" height="4" :value="progress"></v-progress-linear>
					<v-card-text class="text-center py-12">
						<p v-for="(t, i) in cardText" :class="cardClass" :key="i">{{ t }}</p>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>

		<v-row>
			<v-col>
				<v-btn color="blue darken-3" @click="handleCardClick" autofocus block dark>Next</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import RowSubheader from "@/components/RowSubheader"

export default {
	name: "Memorize",
	components: { RowSubheader },
	data() {
		return {
			deck: { name: "" },
			cards: [],
			cardState: "front",
			cardIndex: 0,
		}
	},
	computed: {
		cardClass() {
			var isFront = this.cardState === "front"
			var isBack = !isFront
			return {
				"font-weight-bold": isFront,
				"display-4": isFront,
				"font-weight-lightd": isBack,
				"display-3": isBack,
			}
		},
		cardText() {
			if (this.cards.length == 0) return [""]
			if (this.cardIndex >= this.cards.length) {
				this.goBack(500)
				return ["All Done!"]
			}
			return this.cards[this.cardIndex][this.cardState].split("\n")
		},
		progress() {
			return Math.floor((this.cardIndex / this.cards.length) * 100)
		},
	},
	// watch: {},
	methods: {
		goBack(ms) {
			setTimeout(() => this.$router.push({ name: "decks_list" }), ms)
		},
		handleCardClick() {
			if (this.cardState === "front") this.flipCard()
			else if (this.cardState === "back") this.nextCard()
		},
		flipCard() {
			this.cardState = "back"
		},
		nextCard() {
			this.cardIndex++
			this.cardState = "front"
		},
	},
	async created() {
		let data = await this.$fetcher({
			payload: {
				query:
					"query($deckId: Int!, $limit: Int!, $subset: String!){ cardsSubset(deckId: $deckId, limit: $limit, subset: $subset) { front back } }",
				variables: {
					deckId: this.$route.params.id,
					limit: this.$route.query.limit,
					subset: this.$route.query.subset,
				},
			},
		})

		if (!data) return
		this.cards = data.cardsSubset
	},
	// mounted() {},
}
</script>
