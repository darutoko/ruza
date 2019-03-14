<template>
	<v-layout column>
		<v-flex mb-3>
			<v-text-field
				ref="addInput"
				label="Добавить"
				v-if="isAdmin"
				v-model.trim="add.value"
				:disabled="add.loading"
				:loading="add.loading"
				:rules="add.rules"
				@keyup.enter="addShow"
				required
			></v-text-field>
		</v-flex>
		<v-flex>
			<v-card v-for="(show, i) in shows" :key="show.id">
				<v-hover>
					<v-card-title slot-scope="{hover}" class="blue darken-2 white--text pa-2">
						<v-btn
							v-if="show.season && show.season.episodes_total && show.season.episodes_total === show.season.episodes_aired"
							icon small ripple
							class="ma-0"
							title="Сезон закончен">
							<v-icon color="teal lighten-3">done</v-icon>
						</v-btn>
						<v-btn
							v-else
							icon small ripple
							class="ma-0"
							title="Обновить"
							:disabled="sync.loading"
							@click.stop="syncShow(i)">
							<v-icon color="grey lighten-5">sync</v-icon>
						</v-btn>
						<div class="headline ml-1">
							<a class="white--text" style="text-decoration: none;" :href="show.url" target="_blank">{{ show.title }} S{{ show.current_season.toString().padStart(2, "0")}}</a>
						</div>
						<v-spacer></v-spacer>
						<v-btn
							icon small ripple
							class="my-0"
							title="Изменить"
							v-if="isAdmin && hover"
							:to="{name: 'shows_show', params: {id: show.id}}">
							<v-icon color="grey lighten-5">edit</v-icon>
						</v-btn>
						<v-btn
							icon ripple small
							class="my-0"
							title="Удалить"
							v-if="isAdmin && hover"
							@click.stop="confirmDelete(i)">
							<v-icon color="error">delete</v-icon>
						</v-btn>
					</v-card-title>
				</v-hover>

				<v-card-text v-if="show.season">
					<v-layout wrap>
						<v-flex xs6 md3>
							<v-icon title="Эпизоды">tv</v-icon> {{ show.season.episodes_aired }} / {{ show.season.episodes_total }}
						</v-flex>
						<v-flex xs6 md3>
							<v-icon title="Предыдущий">date_range</v-icon> {{ show.season.episode_last_at }}
						</v-flex>
						<v-flex xs6 md3>
							<v-icon title="Следующий">date_range</v-icon> {{ show.season.episode_next_at }}
						</v-flex>
						<v-flex xs6 md3>
							<v-icon title="Последний">event_available</v-icon> {{ show.season.episode_final_at }}
						</v-flex>
					</v-layout>
				</v-card-text>
			</v-card>

      <DialogDelete
        :shown="remove.dialog"
        :loading="remove.loading"
        :name="deleteTitle"
        @confirm-click="deleteShow"
        @cancel-click="clearDelete()"
      />
		</v-flex>
	</v-layout>
</template>

<script>
import DialogDelete from "@/components/DialogDelete.vue";
import { textRequired } from "@/utils/rules.js";

export default {
	name: "List",
  components: { DialogDelete },
	data() {
		return {
			add: {
				value: "",
				loading: false,
				rules: [textRequired, this.uniqueShow]
			},
			remove: {
				index: null,
				dialog: false,
				loading: false
			},
			sync: {
				loading: false,
			},
			shows: [],
			showFields: "id url title seasons current_season search uploaded",
			seasonFields: "num directory episodes_total episodes_aired episode_last_at episode_next_at episode_final_at",
		}
	},
  computed: {
    isAdmin() {
      return this.$store.state.user.isAdmin;
		},
		deleteTitle() {
			let show = this.shows[this.remove.index];
			if (!show) return "";
			return show.title;
		}
  },
	methods: {
    fetchList() {
			this.graphql({
				query: "{ shows { " + this.showFields + " season { " + this.seasonFields + " } } }",
			},
			data => {
        this.shows = data.shows;
			});
    },
		addShow() {
			if (!this.$refs.addInput.validate()) return;
			this.graphql({
				mutation: "mutation($url: String!){ addShow(url: $url) { " + this.showFields + " season { " + this.seasonFields + " } } }",
				variables: {
					url: this.add.value
				},
				loadingKey: "add",
			},
			data => {
				this.$store.commit("success", `Сериал ${data.addShow.title} добавлен`);
				this.shows.push(data.addShow);
				this.add.value = "";
				this.$refs.addInput.resetValidation();
			});
		},
		syncShow(i) {
			let show = this.shows[i];
			this.graphql({
				mutation: "mutation($id: Int!){ syncShow(id: $id) { season { " + this.seasonFields + " } } }",
				variables: {
					id: show.id
				},
				loadingKey: "sync",
			},
			data => {
				this.$store.commit("success", `Сериал ${show.title} обновлен`);
				show.season = data.syncShow.season;
			});
		},
		deleteShow() {
			this.graphql({
				mutation: "mutation($id: Int!){ deleteShow(id: $id) { title } }",
				variables: {
					id: this.shows[this.remove.index].id
				},
				loadingKey: "remove",
			},
			data => {
				this.shows.splice(this.remove.index, 1);
				this.$store.commit("success", `Сериал ${data.deleteShow.title} удален`);
				this.clearDelete();
			});
		},
		confirmDelete(i) {
			this.remove.index = i;
			this.remove.dialog = true;
		},
		clearDelete() {
      this.remove.index = null;
      this.remove.dialog = false;
		},
		uniqueShow(url) {
			let value = /tt\d+/.exec(url);
			if (!value) return "Неверный формат ссылки";
			if (this.shows.some(show => show.url.includes(value[0]))) return "Сериал уже в списке";
			return true;
		},
	},
	mounted() {
		this.fetchList();
	}
}
</script>
