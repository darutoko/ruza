<template>
	<v-container>
		<RowSubheader :to="{ name: 'decks_list' }"></RowSubheader>

		<v-row>
			<v-col>
				<v-card>
					<v-progress-linear color="blue darken-3" height="4" :value="progress"></v-progress-linear>
					<v-card-text>
						<pre class="display-2 font-weight-bold text-center py-10">{{ cardText }}</pre>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>

		<v-row>
			<v-col>
				<v-sheet class="white--text text-center py-5 my-4 headline darken-3" :class="bannerClass">{{ bannerText }}</v-sheet>
			</v-col>
		</v-row>

		<v-row>
			<v-col>
				<v-text-field
					v-model.trim="testInput"
					label="Input"
					placeholder="Input"
					@keyup.enter="handleInput"
					autocomplete="off"
					:style="{ fontSize: '1.6em' }"
					autofocus
				></v-text-field>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import RowSubheader from "@/components/RowSubheader"

export default {
	name: "Test",
	components: { RowSubheader },
	data() {
		return {
			deck: { name: "" },
			cards: [],
			cardIndex: 0,
			testInput: "",
			bannerClass: {
				white: true,
			},
			bannerText: "!",
		}
	},
	computed: {
		cardText() {
			if (this.cards.length == 0) return ""
			if (this.cardIndex >= this.cards.length) {
				this.goBack(500)
				return "All Done!"
			}
			let card = this.cards[this.cardIndex]
			if (card.testByFront) return card.front
			else return card.back
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
		handleInput() {
			if (!this.testInput) return

			let card = this.cards[this.cardIndex]
			let isTestPassed = this.testInput === card.input
			if (!card.isStreakUpdated) this.updateCardStreak(card, isTestPassed)

			if (isTestPassed) {
				this.cardIndex++
				this.testInput = ""
			}

			this.bannerText = card.input
			this.bannerClass = {
				red: !isTestPassed,
				green: isTestPassed,
				white: false,
			}

			setTimeout(() => {
				this.bannerText = "!"
				this.bannerClass = {
					red: false,
					green: false,
					white: true,
				}
			}, 3000)
		},
		updateCardStreak(card, isTestPassed) {
			this.$fetcher({
				toggle: value => {},
				payload: {
					query: "mutation($id: Int!, $isTestPassed: Boolean!){ updateCardStreak(id: $id, isTestPassed: $isTestPassed) }",
					variables: {
						isTestPassed,
						id: card.id,
					},
				},
			})
			card.isStreakUpdated = true
		},
	},
	async created() {
		let data = await this.$fetcher({
			payload: {
				query:
					"query($deckId: Int!, $limit: Int!, $subset: String!){ cardsSubset(deckId: $deckId, limit: $limit, subset: $subset) { id input front back testByFront } }",
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
