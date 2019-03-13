<template>
	<v-form ref="form" @submit.prevent="updateShow">
		<v-layout column>
			<v-flex mb-3><h6 class="title">{{ show.title }}</h6></v-flex>
			<v-flex>
				<v-select
					v-model="form.current_season"
					:items="seasonsList"
					label="Сезон"
					required></v-select>
			</v-flex>
			<v-flex>
        <v-text-field v-model.trim="form.search" label="Поиск по" :rules="textRules" required></v-text-field>
			</v-flex>
			<v-flex>
        <v-text-field v-model.trim="form.uploaded" label="Загружен пользователем" :rules="textRules" required></v-text-field>
			</v-flex>
			<v-flex>
        <v-text-field v-if="isSeasonSynced" v-model.trim="form.directory" label="Директория" :rules="textRules" required></v-text-field>
			</v-flex>
			<v-flex>
				<v-layout>
					<v-flex>
        <v-btn color="primary" outline :disabled="form.loading" :to="{ name: 'shows_list' }">
          <v-icon>navigate_before</v-icon>Назад
        </v-btn>
					</v-flex>
					<v-flex shrink>
        <v-btn color="warning" :disabled="form.loading" @click.prevent="resetForm">Сброосить</v-btn>
        <v-btn
					type="submit"
          color="success"
          :loading="form.loading"
          :disabled="form.loading"
        >Сохранить</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</v-form>
</template>

<script>
import { textRequired } from "@/utils/rules.js";

export default {
	name: "Show",
	// components: {},
	data() {
		return {
			form: {
				directory: "",
				search: "",
				uploaded: "",
				loading: false,
				current_season: null,
			},
			textRules: [textRequired],
			show: {},
			seasons: [],
			isSeasonSynced: false,
			showFields: "id url title seasons current_season search uploaded",
			seasonFields: "num directory episodes_total episodes_aired episode_last_at episode_next_at episode_final_at",
		}
	},
	computed: {
		seasonsList() {
			if (!this.show.seasons) return [];
			let arr = [...Array(this.show.seasons + 1).keys()];
			arr.shift();
			return arr;
		}
	},
	watch: {
		"form.current_season": function (value) {
			let season = this.getSeason(value);
			if (season) {
				this.form.directory = season.directory;
				this.isSeasonSynced = true;
			} else {
				this.form.directory = "";
				this.isSeasonSynced = false;
			}
      this.$refs.form.resetValidation();
		}
	},
	methods: {
		fetchShow() {
			this.graphql({
				query: "query($id: Int!){ show(id: $id) { " + this.showFields + "  } seasons(show_id: $id) { " + this.seasonFields + " } }",
				variables: {
					id: this.$route.params.id
				},
			},
			data => {
				this.show = data.show;
				this.seasons = data.seasons;
				this.resetForm();
			});
		},
		updateShow() {
			if (!this.$refs.form.validate()) return;

			let variables = {id: this.$route.params.id};
			let season = this.getSeason(this.form.current_season);
			if (season && season.directory !== this.form.directory) variables.directory = this.form.directory;
			["current_season", "search", "uploaded"].forEach(key => { if (this.show[key] !== this.form[key]) variables[key] = this.form[key] });

			if (Object.keys(variables).length <= 1) return alert("Нет изменений в данных");

			console.log(variables);
			this.graphql({
				mutation: "mutation($id: Int!, $current_season: Int, $search: String, $uploaded: String, $directory: String){ updateShow(id: $id, current_season: $current_season, search: $search, uploaded: $uploaded, directory: $directory) }",
				variables,
				loadingKey: "form",
			},
			() => {
				this.resetForm();
				this.$router.replace({ name: "shows_list" });
			});
		},
		resetForm() {
			this.form.current_season = this.show.current_season;
			this.form.search = this.show.search;
			this.form.uploaded = this.show.uploaded;
		},
		getSeason(num) {
			return this.seasons.find(season => season.num === num);
		},
	},
	// created() {},
	mounted() {
		this.fetchShow();
	},
}
</script>