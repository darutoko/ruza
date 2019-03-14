<template>
	<v-form ref="form" @submit.prevent="saveDish">
		<v-layout column>
			<v-flex>
        <v-text-field v-model.trim="form.name" label="Название" :rules="textRules" required></v-text-field>
			</v-flex>
			<v-flex>
        <v-select
          v-model="form.typeId"
          :items="types"
          item-text="name"
          item-value="id"
          label="Вид"
          required></v-select>
			</v-flex>
			<v-flex>
        <v-select
          v-model="form.ingredients"
          :items="ingredients"
          :rules="multiSelectRules"
          item-text="name"
          item-value="id"
          label="Ингредиенты"
          multiple chips required></v-select>
			</v-flex>
			<v-flex>
        <v-textarea v-model="form.recipe" label="Рецепт"></v-textarea>
			</v-flex>
			<v-flex>
				<v-layout wrap>
					<v-flex xs12 sm6>
						<v-btn color="primary" outline :to="{ name: 'food_list' }">
							<v-icon>navigate_before</v-icon>Назад
						</v-btn>
					</v-flex>
					<v-flex xs5 sm6	class="text-sm-right text-xs-left">
						<v-btn color="warning" :disabled="form.loading" @click.prevent="resetForm">Сброосить</v-btn>
						<v-btn
							type="submit"
							color="success"
							:loading="form.loading"
							:disabled="form.loading">Сохранить</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</v-form>
</template>

<script>
import { textRequired } from "@/utils/rules.js";

export default {
  name: "Dish",
  data() {
    return {
      types: [],
      ingredients: [],
      dish: {
        name: "",
        typeId: null,
        ingredients: [],
        recipe: ""
      },
      form: {
        loading: false,
        name: "",
        typeId: null,
        ingredients: [],
        recipe: ""
      },
			textRules: [textRequired],
      multiSelectRules: [this.multiSelectOneOrMore]
    };
  },
  methods: {
    fetchData() {
      let prefix = "{";
      if (this.$route.params.id) prefix = `query($id: Int!) { dish(id: $id) { id name typeId recipe ingredients { id } }`;

			this.graphql({
				query: `${prefix} types { id name } ingredients { id name } }`,
				variables: {
					id: this.$route.params.id
				},
				fetchPolicy: "no-cache",
			},
			data => {
				if (this.$route.params.id) this.dish = data.dish;
				this.types = data.types;
				this.ingredients = data.ingredients;
				this.resetForm();
			});
    },
    saveDish() {
      if (!this.$refs.form.validate()) return;

      if (this.$route.params.id) this.updateDish()
			else this.addDish();
    },
    addDish() {
			this.graphql({
				mutation: "mutation($name: String!, $typeId: Int!, $recipe: String, $ingredients: [Int!]) { addDish(name: $name, typeId: $typeId, recipe: $recipe, ingredients: $ingredients) }",
				variables: { ...this.form },
				loadingKey: "form",
			},
			data => {
				this.resetForm();
				this.$store.commit("success", `Блюдо ${this.form.name} добавлено с ID ${data.addDish}`);
			});
    },
    updateDish() {
			this.graphql({
				mutation: "mutation($id: Int!, $name: String!, $typeId: Int!, $recipe: String, $ingredients: [Int!]) { updateDish(id: $id, name: $name, typeId: $typeId, recipe: $recipe, ingredients: $ingredients)}",
				variables: { ...this.form, id: this.$route.params.id },
				loadingKey: "form",
			},
			() => {
				this.resetForm();
				this.$store.commit("success", `Блюдо ${this.form.name} обновлено`);
				this.$router.replace({ name: "food_list" });
			});
    },
    resetForm() {
      this.form.name = this.dish.name;
      this.form.typeId = this.dish.typeId || this.types[0].id;
      this.form.ingredients = this.dish.ingredients.map(ingredient => ingredient.id);
      this.form.recipe = this.dish.recipe;
      this.$refs.form.resetValidation();
    },
    multiSelectOneOrMore(value) {
      if (value.length > 0) return true;
      return "Необходимо выбрать хотя бы один элемент";
    }
  },
  mounted() {
    this.fetchData();
  }
};
</script>
