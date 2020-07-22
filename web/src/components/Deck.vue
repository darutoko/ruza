<template>
	<v-card>
		<v-card-title class="blue darken-3 white--text">
			{{ name }}<v-spacer></v-spacer><v-icon v-show="isStrakDegrades" color="white">mdi-timer-sand-full</v-icon>
		</v-card-title>
		<v-card-text>
			<v-container class="pa-0">
				<v-row>
					<v-col>Deck status, containing {{ this.totalCards }} cards</v-col>
				</v-row>
				<v-row no-gutters>
					<v-col :cols="columns.completed" class="pa-0 green darken-3 text-center">
						<strong class="white--text">{{ this.completedCards }}</strong>
					</v-col>
					<v-col :cols="columns.progressed" class="pa-0 blue darken-3 text-center">
						<strong class="white--text">{{ this.progressedCards }}</strong>
					</v-col>
					<v-col :cols="columns.failed" class="pa-0 red darken-3 text-center">
						<strong class="white--text">{{ this.failedCards }}</strong>
					</v-col>
				</v-row>
				<v-row>
					<v-col>
						<v-select v-model="subset" :items="subsets"></v-select>
					</v-col>
				</v-row>
			</v-container>
		</v-card-text>
		<v-card-actions>
			<v-btn
				color="blue darken-3"
				title="Memorize"
				:to="{ name: 'decks_memorize', params: { id: id }, query: { subset, limit: memorizeSize } }"
				icon
				large
				dark
			>
				<v-icon large>mdi-head-cog</v-icon>
			</v-btn>
			<v-btn
				color="blue darken-3"
				title="Test"
				:to="{ name: 'decks_test', params: { id: id }, query: { subset, limit: testSize } }"
				icon
				large
				dark
			>
				<v-icon large>mdi-clipboard-check</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<v-btn color="blue darken-3" title="Cards" v-if="isAdmin" :to="{ name: 'decks_cards', params: { id: id } }" icon large dark>
				<v-icon large>mdi-table-of-contents</v-icon>
			</v-btn>
			<v-btn color="blue darken-3" title="Settings" v-if="isAdmin" :to="{ name: 'decks_settings', params: { id: id } }" icon large dark>
				<v-icon large>mdi-cog</v-icon>
			</v-btn>
			<v-btn color="red darken-3" title="Delete deck" v-if="isAdmin" @click="handleDelete" icon large dark>
				<v-icon large>mdi-delete</v-icon>
			</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script>
export default {
	name: "Deck",
	// components: {},
	props: ["id", "name", "totalCards", "completedCards", "failedCards", "memorizeSize", "testSize", "isStrakDegrades"],
	data() {
		return {
			columns: {
				completed: 1,
				progressed: 1,
				failed: 1,
			},
			subset: "incomplete",
			subsets: [
				{
					text: "Cards: all",
					value: "all",
				},
				{
					text: "Cards: incomplete",
					value: "incomplete",
				},
				{
					text: "Cards: failed",
					value: "failed",
				},
			],
		}
	},
	computed: {
		isAdmin() {
			return this.$store.state.user.isAdmin
		},
		progressedCards() {
			return this.totalCards - this.completedCards - this.failedCards
		},
	},
	// watch: {},
	methods: {
		calculateCoumnSize(count) {
			var size = Math.floor((count * 12) / this.totalCards)
			if (size == 0) return 1
			if (size > 10) return 10
			return size
		},
		handleDelete() {
			this.$emit("delete-deck", this.id)
		},
	},
	created() {
		this.columns.completed = this.calculateCoumnSize(this.completedCards)
		this.columns.failed = this.calculateCoumnSize(this.failedCards)
		this.columns.progressed = 12 - this.columns.completed - this.columns.failed
	},
	// mounted() {},
}
</script>
