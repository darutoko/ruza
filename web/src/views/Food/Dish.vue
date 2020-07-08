<template>
	<v-form ref="form" :disabled="form.isLoading" @submit.prevent="handleSubmitForm">
		<v-container v-if="isDataAvaliable">
			<RowSubheader :to="{ name: 'food_list' }">{{ dish.name || "New Dish" }}</RowSubheader>

			<v-row>
				<v-col>
					<v-text-field v-model.trim="form.name" label="Name" :rules="textRules" required></v-text-field>
				</v-col>
			</v-row>

			<v-row>
				<v-col>
					<v-select
						v-model="form.typeId"
						:items="types"
						item-text="name"
						item-value="id"
						label="Type"
						:rules="selectRules"
						required
					></v-select>
				</v-col>
			</v-row>

			<v-row>
				<v-col>
					<v-select
						v-model="form.ingredients"
						:items="ingredients"
						:rules="multiSelectRules"
						item-text="name"
						item-value="id"
						label="Ingredients"
						multiple
						chips
						required
					></v-select>
				</v-col>
			</v-row>

			<v-row>
				<v-col>
					<v-textarea v-model="form.recipe" label="Recipe" outlined></v-textarea>
				</v-col>
			</v-row>

			<v-row>
				<v-col>
					<v-btn color="blue darken-3" type="submit" :loading="form.isLoading" dark>Save</v-btn>
				</v-col>
				<v-col cols="auto">
					<v-btn color="gray darken-3" :disabled="form.isLoading" @click.prevent="handleResetClick" dark>Reset</v-btn>
				</v-col>
			</v-row>
		</v-container>
		<v-container v-else>
			<v-row>
				<v-col>
					No data available
				</v-col>
			</v-row>
		</v-container>
	</v-form>
</template>

<script>
import { textRequired } from "@/utils/rules.js"
import RowSubheader from "@/components/RowSubheader"

export default {
	name: "Dish",
	components: { RowSubheader },
	data() {
		return {
			dish: {
				name: "",
				typeId: null,
				ingredients: [],
				recipe: "",
			},
			types: [],
			ingredients: [],
			form: {},
			textRules: [textRequired],
			selectRules: [this.selectRequired],
			multiSelectRules: [this.multiSelectOneOrMore],
		}
	},
	computed: {
		isDataAvaliable() {
			return this.types.length > 0 && this.ingredients.length > 0
		},
	},
	watch: {
		dish() {
			this.dish.ingredients = this.dish.ingredients.map(ingredient => ingredient.id)
			this.resetForm()
		},
	},
	methods: {
		async handleSubmitForm() {
			if (!this.$refs.form.validate()) return

			if (this.$route.params.id) {
				var message = "Dish updated"
				var query =
					"mutation($id: Int!, $name: String!, $typeId: Int!, $recipe: String, $ingredients: [Int!]) { updateDish(id: $id, name: $name, typeId: $typeId, recipe: $recipe, ingredients: $ingredients)}"
			} else {
				var message = "Dish added"
				var query =
					"mutation($name: String!, $typeId: Int!, $recipe: String, $ingredients: [Int!]) { addDish(name: $name, typeId: $typeId, recipe: $recipe, ingredients: $ingredients) }"
			}

			let data = await this.$fetcher({
				toggle: value => (this.form.isLoading = value),
				payload: {
					query,
					variables: {
						id: this.$route.params.id,
						...this.form,
					},
				},
			})

			if (!data) return
			this.$store.commit("showSnackbar", message)
			this.$router.replace({ name: "food_list" })
		},
		handleResetClick() {
			this.resetForm()
			this.$refs.form.resetValidation()
		},
		selectRequired(value) {
			if (value) return true
			return "An option is required"
		},
		multiSelectOneOrMore(value) {
			if (value.length > 0) return true
			return "At least 1 option is required"
		},
		resetForm() {
			this.form = { isLoading: false, ...JSON.parse(JSON.stringify(this.dish)) }
		},
	},
	created() {
		this.resetForm()
		let prefix = "{"
		if (this.$route.params.id) prefix = "query($id: Int!) { dish(id: $id) { id name typeId recipe ingredients { id name } }"

		this.$fetcher({
			autofill: true,
			payload: {
				query: prefix + " types { id name } ingredients { id name } }",
				variables: {
					id: this.$route.params.id,
				},
			},
		})
	},
	// mounted() {},
}
</script>
