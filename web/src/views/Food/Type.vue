<template>
	<v-container>
		<RowSubheader :to="{ name: 'food_list' }">Types</RowSubheader>

		<v-row>
			<v-col>
				<v-form ref="add" @submit.prevent="handleAddSubmit">
					<v-row align="center">
						<v-col cols="auto">
							<v-btn color="blue darken-3" title="Add type" type="submit" :loading="add.isLoading" icon large dark>
								<v-icon large>mdi-plus-circle</v-icon>
							</v-btn>
						</v-col>
						<v-col>
							<v-text-field v-model.trim="add.name" label="Type name" :rules="add.rules" :disabled="add.isLoading"></v-text-field>
						</v-col>
					</v-row>
				</v-form>
			</v-col>
		</v-row>

		<template v-for="(type, i) in types">
			<v-row v-if="edit.index !== i" :key="type.id" align="center" :style="bgcolor(i)">
				<v-col>
					{{ type.name }}
				</v-col>
				<v-col cols="auto">
					<v-btn color="blue darken-3" title="Edit type" @click="handleEditClick(i)" icon>
						<v-icon>mdi-pencil</v-icon>
					</v-btn>
					<v-btn color="red darken-3" title="Delete type" @click="handleDeleteClick(i)" icon>
						<v-icon>mdi-delete</v-icon>
					</v-btn>
				</v-col>
			</v-row>

			<v-row v-else :key="type.id" align="center">
				<v-col>
					<v-form ref="edit" :disabled="edit.isLoading" @submit.prevent="handleEditSubmit">
						<v-container fluid>
							<v-row align="center">
								<v-col cols="auto">
									<v-btn color="blue darken-3" type="submit" title="Save changes" :loading="edit.isLoading" large icon>
										<v-icon large>mdi-check-circle</v-icon>
									</v-btn>
								</v-col>
								<v-col>
									<v-text-field v-model="edit.name" label="Type name" :rules="edit.rules"></v-text-field>
								</v-col>
								<v-col cols="auto">
									<v-btn color="grey darken-3" title="Cancel" :disabled="edit.isLoading" @click="handleCancelClick" icon>
										<v-icon>mdi-cancel</v-icon>
									</v-btn>
								</v-col>
							</v-row>
						</v-container>
					</v-form>
				</v-col>
			</v-row>
		</template>
		<v-row>
			<v-col>
				<DialogDelete v-model="dialog.isVisible" :isLoading="dialog.isLoading" @confirm-click="handleConfirmClick">
					Delete type <strong>{{ (types[dialog.index] || {}).name }}</strong> ?
				</DialogDelete>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { textRequired } from "@/utils/rules.js"
import RowSubheader from "@/components/RowSubheader"
import DialogDelete from "@/components/DialogDelete"

export default {
	name: "Type",
	components: { DialogDelete, RowSubheader },
	data() {
		return {
			types: [],
			add: {
				name: "",
				isLoading: false,
				rules: [textRequired, this.uniqueName],
			},
			edit: {
				index: null,
				name: "",
				isLoading: false,
				rules: [textRequired, this.uniqueName],
			},
			dialog: {
				index: 0,
				isVisible: false,
				isLoading: false,
			},
		}
	},
	// computed: {},
	// watch: {},
	methods: {
		bgcolor(i) {
			return i % 2 ? { backgroundColor: "#f5f5f5" } : {}
		},
		async handleAddSubmit() {
			if (!this.$refs.add.validate()) return

			let data = await this.$fetcher({
				toggle: value => (this.add.isLoading = value),
				payload: {
					query: "mutation($name: String!){ addType(name: $name) { id name } }",
					variables: {
						name: this.add.name,
					},
				},
			})

			if (!data) return
			this.types.unshift(data.addType)
			this.$store.commit("showSnackbar", "Type added")
			this.$refs.add.reset()
		},
		handleCancelClick() {
			this.edit.index = null
		},
		async handleConfirmClick() {
			let type = this.types[this.dialog.index]
			let data = await this.$fetcher({
				toggle: value => (this.dialog.isLoading = value),
				payload: {
					query: "mutation($id: Int!){ deleteType(id: $id) }",
					variables: {
						id: type.id,
					},
				},
			})

			this.dialog.isVisible = false
			if (!data) return
			this.types.splice(this.dialog.index, 1)
			this.$store.commit("showSnackbar", `Type "${type.name}" has been deleted!`)
		},
		handleDeleteClick(index) {
			this.dialog.index = index
			this.dialog.isVisible = true
		},
		handleEditClick(index) {
			this.edit.index = index
			this.edit.name = this.types[index].name
		},
		async handleEditSubmit() {
			if (!this.$refs.edit[0].validate()) return

			let type = this.types[this.edit.index]
			let data = await this.$fetcher({
				toggle: value => (this.edit.isLoading = value),
				payload: {
					query: "mutation($id: Int!, $name: String!){ updateType(id: $id, name: $name) { id name } }",
					variables: {
						id: type.id,
						name: this.edit.name,
					},
				},
			})

			if (!data) return
			type.name = data.updateType.name
			this.$store.commit("showSnackbar", "Type updated")
			this.handleCancelClick()
		},
		uniqueName(value) {
			if (this.types.some(type => type.name === value)) return "Type name should be unique"
			return true
		},
	},
	created() {
		this.$fetcher({
			autofill: true,
			payload: {
				query: "{ types { id name } }",
			},
		})
	},
	// mounted() {},
}
</script>
