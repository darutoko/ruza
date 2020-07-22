<template>
	<v-container>
		<RowSubheader :to="{ name: 'decks_list' }">{{ deck.name }}</RowSubheader>

		<v-row v-if="deck.id">
			<v-col class="pa-0">
				<v-form ref="form" @submit.prevent="handleSubmitForm" :disabled="isUpdating">
					<v-container fluid>
						<v-row align="center">
							<v-col>
								<v-text-field
									v-model.number="update.memorizeSize"
									label="Memorize Size"
									type="number"
									:rules="rules"
									required
								></v-text-field>
							</v-col>
							<v-col>
								<v-text-field v-model.number="update.testSize" label="Test Size" type="number" :rules="rules" required></v-text-field>
							</v-col>
							<v-col>
								<v-text-field v-model.number="update.streakSize" label="Streak Size" type="number" :rules="rules" required></v-text-field>
							</v-col>
						</v-row>
						<v-row align="center">
							<v-col cols="auto">
								<v-switch v-model="update.isStrakDegrades" label="Streak Degardes"></v-switch>
							</v-col>
							<v-col>
								<v-text-field
									v-model.number="update.degradationInterval"
									label="Degradation Interval"
									type="number"
									:rules="rules"
									:disabled="!update.isStrakDegrades"
									required
								></v-text-field>
							</v-col>
							<v-col>
								<v-text-field
									v-model.number="update.degradationStep"
									label="Degradation Step"
									type="number"
									:rules="rules"
									:disabled="!update.isStrakDegrades"
									required
								></v-text-field>
							</v-col>
						</v-row>
						<v-row align="center">
							<v-col>
								<v-btn color="blue darken-3" type="submit" dark>Save</v-btn>
							</v-col>
							<v-col cols="auto">
								<v-btn color="gray darken-3" @click="handleResetClick" dark>Reset</v-btn>
							</v-col>
						</v-row>
					</v-container>
				</v-form>
			</v-col>
		</v-row>

		<v-row v-else>
			<v-col>
				No data available
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { textRequired } from "@/utils/rules.js"
import RowSubheader from "@/components/RowSubheader"

export default {
	name: "Settings",
	components: { RowSubheader },
	data() {
		return {
			deck: {},
			update: {
				memorizeSize: "",
			},
			rules: [textRequired],
			isUpdating: false,
		}
	},
	// computed: {},
	// watch: {},
	methods: {
		async handleSubmitForm() {
			if (!this.$refs.form.validate()) return

			let data = await this.$fetcher({
				toggle: value => (this.isUpdating = value),
				payload: {
					query:
						"mutation updateDeck($id: Int!, $memorizeSize: Int!, $testSize: Int!, $streakSize: Int!, $isStrakDegrades: Boolean!, $degradationInterval: Int!, $degradationStep: Int!){ \
						updateDeck(id: $id, memorizeSize: $memorizeSize, testSize: $testSize, streakSize: $streakSize, isStrakDegrades: $isStrakDegrades, degradationInterval: $degradationInterval, degradationStep: $degradationStep) }",
					variables: {
						...this.update,
						id: this.$route.params.id,
					},
				},
			})

			if (!data) return
			this.$store.commit("showSnackbar", "Settings saved")
		},
		handleResetClick() {
			this.resetForm()
		},
		resetForm() {
			this.update = JSON.parse(JSON.stringify(this.deck))
			this.$refs.form.resetValidation()
		},
	},
	async created() {
		await this.$fetcher({
			autofill: true,
			payload: {
				query:
					"query($id: Int!){ deck(id: $id) { id name memorizeSize testSize streakSize isStrakDegrades degradationInterval degradationStep } }",
				variables: {
					id: this.$route.params.id,
				},
			},
		})
		this.resetForm()
	},
	// mounted() {},
}
</script>
