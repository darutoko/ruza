<template>
	<v-container>
		<v-row align="center" v-if="isAdmin">
			<v-col cols="auto" class="text-right">
				<v-btn color="blue darken-3" title="Add show" :loading="add.isLoading" @click="handleAddShow" icon large dark>
					<v-icon large>mdi-plus-circle</v-icon>
				</v-btn>
			</v-col>
			<v-col>
				<v-form v-model="add.isValid" @submit.prevent>
					<v-text-field
						v-model="add.value"
						label="Add show"
						:disabled="add.isLoading"
						:rules="add.rules"
						@keyup.enter="handleAddShow"
						required
					></v-text-field>
				</v-form>
			</v-col>
		</v-row>

		<v-row>
			<v-col>
				<v-card v-for="(show, i) in shows" :key="show.id">
					<v-hover v-slot:default="{ hover }">
						<v-card-title class="blue darken-3 ">
							<v-btn
								v-if="!isAdmin && show.season && show.season.episodesTotal && show.season.episodesTotal === show.season.episodesAired"
								color="green lighten-3"
								title="Season ended"
								icon
							>
								<v-icon>mdi-check-outline</v-icon>
							</v-btn>
							<v-btn v-else color="white" title="Sync" :disabled="isSyncing" @click.stop="handleSyncClick(i)" icon>
								<v-icon>mdi-sync</v-icon>
							</v-btn>
							<a class="ml-2 white--text" style="text-decoration: none;" :href="show.url" target="_blank">
								{{ show.title }} S{{ show.currentSeason.toString().padStart(2, "0") }}
							</a>
							<v-spacer></v-spacer>
							<v-btn v-if="isAdmin && hover" color="white" title="Edit show" :to="{ name: 'shows_show', params: { id: show.id } }" icon>
								<v-icon>mdi-pencil</v-icon>
							</v-btn>
							<v-btn v-if="isAdmin && hover" color="red darken-3" title="Delete show" @click.stop="handleDeleteClick(i)" icon>
								<v-icon>mdi-delete</v-icon>
							</v-btn>
						</v-card-title>
					</v-hover>

					<v-card-text v-if="show.season">
						<v-row>
							<v-col cols="6" md="3">
								<v-icon title="Episodes">mdi-television-play</v-icon> {{ show.season.episodesAired }} / {{ show.season.episodesTotal }}
							</v-col>
							<v-col cols="6" md="3"> <v-icon title="Previous">mdi-calendar-arrow-left</v-icon> {{ show.season.episodeLastAt }} </v-col>
							<v-col cols="6" md="3"> <v-icon title="Next">mdi-calendar-arrow-right</v-icon> {{ show.season.episodeNextAt }} </v-col>
							<v-col cols="6" md="3"> <v-icon title="Last">mdi-calendar-check</v-icon> {{ show.season.episodeFinalAt }} </v-col>
						</v-row>
					</v-card-text>
				</v-card>

				<DialogDelete v-model="dialog.isVisible" :isLoading="dialog.isLoading" @confirm-click="handleConfirmClick">
					Delete show "<strong>{{ this.dialog.show.title }}</strong
					>"?
				</DialogDelete>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { textRequired } from "@/utils/rules.js"
import DialogDelete from "@/components/DialogDelete"

export default {
	name: "List",
	components: {
		DialogDelete,
	},
	data() {
		return {
			shows: [],
			isSyncing: false,
			add: {
				value: "",
				isLoading: false,
				isValid: true,
				rules: [textRequired, this.showUniqueRule],
			},
			dialog: {
				index: 0,
				show: {},
				isVisible: false,
				isLoading: false,
			},
			showFields: "id url title seasonsTotal currentSeason",
			seasonFields: "num episodesTotal episodesAired episodeLastAt episodeNextAt episodeFinalAt",
		}
	},
	computed: {
		isAdmin() {
			return this.$store.state.user.isAdmin
		},
	},
	// watch: {},
	methods: {
		async handleAddShow() {
			if (!this.add.isValid) return
			let data = await this.$fetcher({
				toggle: value => (this.add.isLoading = value),
				payload: {
					query: "mutation($url: String!){ addShow(url: $url) { " + this.showFields + " season { " + this.seasonFields + " } } }",
					variables: {
						url: this.add.value,
					},
				},
			})

			if (!data) return
			this.add.value = ""
			this.shows.push(data.addShow)
		},
		handleDeleteClick(index) {
			this.dialog.index = index
			this.dialog.show = this.shows[index]
			this.dialog.isVisible = true
		},
		async handleConfirmClick() {
			let data = await this.$fetcher({
				toggle: value => (this.dialog.isLoading = value),
				payload: {
					query: "mutation($id: Int!){ deleteShow(id: $id) }",
					variables: {
						id: this.dialog.show.id,
					},
				},
			})

			this.dialog.isVisible = false
			if (!data.deleteShow) return
			this.shows.splice(this.dialog.index, 1)
			this.$store.commit("success", `Show "${this.dialog.show.title}" has been deleted!`)
		},
		async handleSyncClick(i) {
			let show = this.shows[i]
			let data = await this.$fetcher({
				toggle: value => (this.isSyncing = value),
				payload: {
					query: "mutation($id: Int!){ syncShow(id: $id) { season { " + this.seasonFields + " } } }",
					variables: {
						id: show.id,
					},
				},
			})

			if (!data) return
			show.season = data.syncShow.season
		},
		showUniqueRule(value) {
			let title = /tt\d+/.exec(value)
			if (!title) return "Invalid url format"
			if (this.shows.some(show => show.url.includes(title[0]))) return "Show already in the list"
			return true
		},
	},
	async created() {
		let data = await this.$fetcher({
			payload: {
				query: "{ shows { " + this.showFields + " season { " + this.seasonFields + " } } }",
			},
		})

		if (!data) return
		this.shows = data.shows.sort((a, b) =>
			!a.season ? 1 : !b.season ? -1 : a.season.episodesTotal - a.season.episodesAired - (b.season.episodesTotal - b.season.episodesAired)
		)
	},
	// mounted() {},
}
</script>
