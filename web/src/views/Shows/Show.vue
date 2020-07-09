<template>
	<v-form v-model="update.isValid" @submit.prevent="handleUpdateSubmit">
		<v-container>
			<RowSubheader :to="{ name: 'shows_list' }">{{ show.title }}</RowSubheader>
			<v-row>
				<v-col>
					<v-select v-model="update.season" :items="seasonsList" label="Season" required></v-select>
				</v-col>
			</v-row>
			<v-row>
				<v-col>
					<v-btn color="green darken-3" type="submit" :loading="update.isLoading" dark>Save</v-btn>
				</v-col>
			</v-row>
		</v-container>
	</v-form>
</template>

<script>
import RowSubheader from "@/components/RowSubheader"

export default {
	name: "Show",
	components: { RowSubheader },
	data() {
		return {
			show: {},
			update: {
				season: 1,
				isLoading: false,
				isValid: true,
			},
			showFields: "id url title seasonsTotal currentSeason",
		}
	},
	computed: {
		seasonsList() {
			let list = []
			if (this.show.seasonsTotal) for (let s = 1; s <= this.show.seasonsTotal; s++) list.push(s)
			return list
		},
	},
	// watch: {},
	methods: {
		async handleUpdateSubmit() {
			await this.$fetcher({
				payload: {
					query: "mutation($id: Int!, $season: Int!){ updateShow(id: $id, season: $season) }",
					variables: {
						id: this.$route.params.id,
						season: this.update.season,
					},
				},
				toggle: value => (this.update.isLoading = value),
			})
			this.$store.commit("success", "Show updated")
		},
	},
	async created() {
		await this.$fetcher({
			autofill: true,
			payload: {
				query: "query($id: Int!){ show(id: $id) { " + this.showFields + " } }",
				variables: {
					id: this.$route.params.id,
				},
			},
		})
		this.update.season = this.show.currentSeason
	},
	// mounted() {},
}
</script>
