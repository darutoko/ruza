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
					<v-tabs v-model="directory" color="blue darken-2">
						<v-tab v-for="d in directories" :key="d">{{ d }}</v-tab>
					</v-tabs>
				</template>
			</v-toolbar>
    </v-flex>
		<v-flex>
			<v-breadcrumbs :items="breadcrumbs">
				<template v-slot:item="props">
					<a
						class="v-breadcrumbs__item"
						@click.prevent="navigateBack(props.item.index)"
						:disabled="props.item.disabled"
						:class="props.item.disabled ? 'v-breadcrumbs__item--disabled' : ''">{{ props.item.text }}</a>
				</template>
			</v-breadcrumbs>
		</v-flex>
		<v-flex>
			<v-list>
				<v-list-tile v-for="file in files" :key="file.name">
					<v-list-tile-avatar>
						<v-btn
							icon ripple
							v-if="file.isFile"
							title="Запустить видео"
							:disabled="ui.loading"
							@click.prevent="videoStart(file.name)">
							<v-icon color="blue darken-2">play_arrow</v-icon>
						</v-btn>
						<v-btn
							icon ripple
							v-else
							title="Открыть папку"
							:disabled="ui.loading"
							@click.prevent="navigateForward(file.name)">
							<v-icon color="blue darken-2">folder</v-icon>
						</v-btn>
					</v-list-tile-avatar>
					<v-list-tile-content>
						<v-list-tile-title>{{ file.name }}</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-flex>
  </v-layout>
</template>

<script>
export default {
	name: "Disk",
	// components: {},
	data() {
		return {
			directory: 0,
			directories: ["downloads", "films"],
			path: [],
			files: [],
			ui: {
				loading: false,
			},
		}
	},
	computed: {
		breadcrumbs() {
			let path = this.path.map((text, index) => ({text, index: index + 1, disabled: false}));
			path.unshift({text: this.directoryTitle, index: 0, disabled: false});
			path[path.length-1].disabled = true;
			return path;
		},
		directoryTitle() {
			return this.directories[this.directory].charAt(0).toUpperCase() + this.directories[this.directory].slice(1);
		},
	},
	watch: {
		path: function() {
			this.fetchFiles();
		},
		directory: function() {
			this.path = [];
		},
	},
	methods: {
		fetchFiles() {
			this.graphql({
				query: "query($directory: Directory!, $path: String!) { videoDisk(directory: $directory, path: $path) { name isFile } }",
				variables: {
					directory: this.directories[this.directory],
					path: this.path.join("/")
				},
				loadingKey: "ui",
			},
			data => {
				this.files = data.videoDisk;
			});
		},
		navigateBack(index) {
			this.path.splice(index);
		},
		navigateForward(name) {
			this.path.push(name);
		},
		videoStart(file) {
			this.graphql({
				mutation: "mutation($directory: Directory!, $path: String!) { videoStart(directory: $directory, path: $path) }",
				variables: {
					directory: this.directories[this.directory],
					path: [...this.path, file].join("/")
				},
				loadingKey: "ui",
			},
			data => {
				console.log(data.videoStart);
			});
		},
		videoStop() {
			this.graphql({
				mutation: "mutation { videoStop }",
				loadingKey: "ui",
			},
			data => {
				console.log(data.videoStop);
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
				console.log(data.volumeChange);
			});
		},
	},
	// created() {},
	mounted() {
		this.fetchFiles();
	},
}
</script>