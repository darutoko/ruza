<template>
	<v-layout column>
		<v-flex>
			<v-toolbar color="blue darken-2" dark tabs>
				<v-btn
					icon ripple
					title="Остановить видео"
					:disabled="ui.loading"
					@click.prevent="videoStop()">
					<v-icon>stop</v-icon>
				</v-btn>
				<v-spacer></v-spacer>
				<v-btn
					icon ripple
					title="Уменьшить звук"
					:disabled="ui.loading"
					@click.prevent="volumeChange(-1)">
					<v-icon>volume_down</v-icon>
				</v-btn>
				<v-btn
					icon ripple
					title="Увеличить звук"
					:disabled="ui.loading"
					@click.prevent="volumeChange(1)">
					<v-icon>volume_up</v-icon>
				</v-btn>
				<template v-slot:extension>
					<v-tabs v-model="service" color="blue darken-2">
						<v-tab v-for="s in services" :key="s">{{ s }}</v-tab>
					</v-tabs>
				</template>
			</v-toolbar>
		</v-flex>
		<v-flex>
			<v-card v-for="stream in streams" :key="stream.name" color="blue darken-2" class="mt-2" dark>
				<v-card-title>
					<v-btn
						icon ripple
						title="Запустить стрим"
						:disabled="ui.loading"
						@click.prevent="videoStart(stream.name)">
						<v-icon>play_arrow</v-icon>
					</v-btn>
					<span class="title mr-4">
						{{ stream.name }}
					</span>
					<span class="subheading">
						{{ stream.game }}
					</span>
				</v-card-title>
				<v-card-text class="headline">
					{{ stream.status }}
				</v-card-text>
			</v-card>
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	name: "Internet",
	// components: {},
	data() {
		return {
			service: 0,
			services: ["twitch"],
			streams: [],
			ui: {
				loading: false
			}
		}
	},
	computed: {
		//
	},
	// watch: {},
	methods: {
		fetchStreams() {
			this.graphql({
				query: "query($service: Service!) { videoInternet(service: $service) { name game status } }",
				variables: {
					service: this.services[this.service],
				},
				loadingKey: "ui",
			},
			data => {
				this.streams = data.videoInternet;
			});
		},
		videoStart(name) {
			this.graphql({
				mutation: "mutation($name: String!) { twitchStart(name: $name) }",
				variables: {
					name,
				},
				loadingKey: "ui",
			},
			data => {
				if (data.twitchStart) this.$store.commit("snackbar", `Видео запущено`);
			});
		},
		videoStop() {
			this.graphql({
				mutation: "mutation { videoStop }",
				loadingKey: "ui",
			},
			data => {
				if (data.videoStop) this.$store.commit("snackbar", `Видео остановлено`);
			});
		},
		volumeChange(multiplier) {
			this.graphql({
				mutation: "mutation($multiplier: Int!) { volumeChange(multiplier: $multiplier) }",
				variables: {
					multiplier,
				},
				loadingKey: "ui",
			},
			data => {
				if (data.volumeChange) this.$store.commit("snackbar", `Звук изменен`);
			});
		},
	},
	// created() {},
	mounted() {
		this.fetchStreams();
	},
}
</script>