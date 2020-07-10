<template>
	<v-container>
		<v-row>
			<v-col>
				<v-tabs v-model="directoryIndex" color="blue darken-3">
					<v-tab v-for="dir in directories" :key="dir">{{ dir }}</v-tab>
				</v-tabs>
			</v-col>
		</v-row>

		<v-row>
			<v-col class="pa-0">
				<v-breadcrumbs :items="breadcrumbs" large>
					<template v-slot:item="{ item }">
						<v-breadcrumbs-item href="#" :disabled="item.disabled" @click.prevent="cdBack(item.index)">
							{{ item.text }}
						</v-breadcrumbs-item>
					</template>
				</v-breadcrumbs>
				<v-list :disabled="$store.state.isLoading" dense>
					<v-list-item v-for="file in files" :key="file.name">
						<v-list-item-avatar>
							<v-btn v-if="file.isFile" color="blue darken-3" @click="videoStart(file.name)" icon>
								<v-icon>mdi-play-circle</v-icon>
							</v-btn>
							<v-btn v-else color="blue darken-3" @click="cdForfward(file.name)" icon>
								<v-icon>mdi-folder</v-icon>
							</v-btn>
						</v-list-item-avatar>
						<v-list-item-content>{{ file.name }}</v-list-item-content>
					</v-list-item>
				</v-list>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
export default {
	name: "Disk",
	// components: {},
	data() {
		return {
			directoryIndex: 0,
			directories: ["downloads", "films"],
			path: [],
			files: [],
		}
	},
	computed: {
		breadcrumbs() {
			let bc = [this.directory, ...this.path].map((text, index) => ({ text, index, disabled: false }))
			bc[bc.length - 1].disabled = true
			return bc
		},
		directory() {
			return this.directories[this.directoryIndex]
		},
	},
	watch: {
		path() {
			this.fetchFiles()
		},
		directoryIndex() {
			this.path = []
		},
	},
	methods: {
		async fetchFiles() {
			let data = await this.$fetcher({
				payload: {
					query: "query($directory: Directory!, $path: String!) { videoDisk(directory: $directory, path: $path) { name isFile } }",
					variables: {
						directory: this.directory,
						path: this.path.join("/"),
					},
				},
			})

			if (!data) return
			this.files = data.videoDisk
		},
		cdBack(index) {
			this.path.splice(index)
		},
		cdForfward(name) {
			this.path.push(name)
		},
		async videoStart(name) {
			let data = await this.$fetcher({
				payload: {
					query: "mutation($directory: Directory!, $path: String!) { videoStart(directory: $directory, path: $path) }",
					variables: {
						directory: this.directory,
						path: [...this.path, name].join("/"),
					},
				},
			})

			if (data) this.$store.commit("showSnackbar", "Video started")
		},
	},
	async created() {
		await this.fetchFiles()
	},
	// mounted() {},
}
</script>
