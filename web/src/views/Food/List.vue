<template>
	<v-container>
		<v-row>
			<v-col class="text-center">
				<v-btn class="mx-0" color="blue darken-3" @click="handleAllClick" small dark>All</v-btn>
				<v-btn class="mx-2" color="blue darken-3" @click="handleClearClick" small dark>Clear</v-btn>
				<v-btn class="mx-0" color="blue darken-3" @click="handleInvertClick" small dark>Invert</v-btn>
			</v-col>
		</v-row>

		<v-row>
			<v-col>
				<v-chip-group v-model="filter" column multiple>
					<v-chip v-for="ingredient in ingredients" :key="ingredient.id" :value="ingredient.id" filter outlined>
						{{ ingredient.name }}
					</v-chip>
				</v-chip-group>
			</v-col>
		</v-row>

		<v-row>
			<v-col>
				<v-tabs v-model="tabs" centered>
					<v-tabs-slider></v-tabs-slider>
					<v-tab v-for="type in types" :key="type.id">{{ type.name }}</v-tab>

					<v-tab-item class="mt-3" v-for="type in types" :key="type.id">
						<v-card v-for="dish in filteredDishes(type.dishes)" :key="dish.id">
							<v-hover v-slot:default="{ hover }">
								<v-card-title class="blue darken-3 white--text py-2">
									{{ dish.name }}
									<v-spacer></v-spacer>
									<v-btn v-if="isAdmin && hover" color="white" title="Edit dish" :to="{ name: 'food_dish', params: { id: dish.id } }" icon>
										<v-icon>mdi-pencil</v-icon>
									</v-btn>
									<v-btn v-if="isAdmin && hover" color="red darken-3" title="Delete dish" @click.stop="handleDeleteClick(dish, type)" icon>
										<v-icon>mdi-delete</v-icon>
									</v-btn>
									<v-btn v-else color="blue darken-3" icon>
										<v-icon>mdi-checkbox-blank-outline</v-icon>
									</v-btn>
								</v-card-title>
							</v-hover>
							<v-card-text class="pt-2">
								<v-chip v-for="ingredient in dish.ingredients" :key="ingredient.id">{{ ingredient.name }}</v-chip>
								<v-sheet v-if="dish.recipe" class="pa-3 mt-2" color="blue lighten-4" style="white-space: pre-wrap;">{{
									dish.recipe
								}}</v-sheet>
							</v-card-text>
						</v-card>
					</v-tab-item>
				</v-tabs>

				<DialogDelete v-model="dialog.isVisible" :isLoading="dialog.isLoading" @confirm-click="handleConfirmClick">
					Delete dish <strong>{{ dialog.dish.name }}</strong> ?
				</DialogDelete>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import DialogDelete from "@/components/DialogDelete"

export default {
	name: "List",
	components: { DialogDelete },
	data() {
		return {
			types: [],
			ingredients: [],
			filter: [],
			tabs: 0,
			dialog: {
				dish: {},
				type: {},
				isVisible: false,
				isLoading: false,
			},
		}
	},
	computed: {
		isAdmin() {
			return this.$store.state.user.isAdmin
		},
	},
	// watch: {},
	methods: {
		filteredDishes(dishes) {
			return dishes.filter(dish => {
				for (let ingredient of dish.ingredients) {
					if (this.filter.includes(ingredient.id)) return true
				}
				return false
			})
		},
		handleAllClick() {
			this.filter = this.ingredients.map(ingredient => ingredient.id)
		},
		handleClearClick() {
			this.filter = []
		},
		handleInvertClick() {
			this.filter = this.ingredients.map(ingredient => ingredient.id).filter(ingredient => !this.filter.includes(ingredient))
		},
		handleDeleteClick(dish, type) {
			this.dialog.dish = dish
			this.dialog.type = type
			this.dialog.isVisible = true
		},
		async handleConfirmClick() {
			let data = await this.$fetcher({
				toggle: value => (this.dialog.isLoading = value),
				payload: {
					query: "mutation($id: Int!) { deleteDish(id: $id) }",
					variables: {
						id: this.dialog.dish.id,
					},
				},
			})

			this.dialog.isVisible = false
			if (!data.deleteDish) return
			this.dialog.type.dishes = this.dialog.type.dishes.filter(dish => dish.id != this.dialog.dish.id)
			this.$store.commit("showSnackbar", `Dish "${this.dialog.dish.name}" has been deleted!`)
		},
	},
	created() {
		this.$fetcher({
			autofill: true,
			payload: {
				query: "{ types { id name dishes { id name recipe ingredients { id name } } } ingredients { id name } }",
			},
		})
	},
	// mounted() {},
}
</script>
