<template>
  <v-layout>
    <v-flex>
      <v-form ref="form">
        <v-text-field v-model="form.name" label="Название" :rules="stringRules" required></v-text-field>
        <v-select
          v-model="form.typeId"
          :items="types"
          :rules="numberRules"
          item-text="name"
          item-value="id"
          label="Вид"
          required
        ></v-select>
        <v-select
          v-model="form.ingredients"
          :items="ingredients"
          :rules="arrayRules"
          item-text="name"
          item-value="id"
          label="Ингредиенты"
          multiple
          chips
          required
        ></v-select>
        <v-textarea v-model="form.recipe" label="Рецепт"></v-textarea>
        <v-btn color="primary" outline :to="{ name: 'food_list' }">
          <v-icon>navigate_before</v-icon>Назад
        </v-btn>
        <v-btn color="warning" :disabled="form.loading" @click.prevent="resetForm">Сброосить</v-btn>
        <v-btn
          color="success"
          :loading="form.loading"
          :disabled="form.loading"
          @click.prevent="saveDish"
        >Сохранить</v-btn>
      </v-form>
    </v-flex>
  </v-layout>
</template>

<script>
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
      stringRules: [this.stringRequired],
      numberRules: [this.numberRequired],
      arrayRules: [this.arrayOneOrMore]
    };
  },
  methods: {
    fetchData() {
      console.log("Fetching Data", this.$route.params.id);
      let prefix = "{";
      if (this.$route.params.id)
        prefix = `query($id: Int!) {
			dish(id: $id) {
				id
				name
				typeId
				recipe
				ingredients {
					id
				}
			}`;

      this.$apollo
        .query({
          query: this.$gql`${prefix}
					types {
						id
						name
					}
					ingredients {
						id
						name
					}
				}`,
          variables: {
            id: this.$route.params.id
          }
        })
        .then(result => {
          if (this.$route.params.id) this.dish = result.data.dish;
          this.types = result.data.types;
          this.ingredients = result.data.ingredients;
          this.resetForm();
        })
        .catch(error => console.log(error));
    },
    async saveDish() {
      if (!this.$refs.form.validate()) return;

      this.form.loading = true;
      if (this.$route.params.id) {
        await this.updateDish();
      } else {
        await this.addDish();
      }
      this.form.loading = false;
    },
    async addDish() {
      try {
        let result = await this.$apollo.mutate({
          mutation: this.$gql`
						mutation($name: String!, $typeId: Int!, $recipe: String, $ingredients: [Int!]) {
							addDish(name: $name, typeId: $typeId, recipe: $recipe, ingredients: $ingredients)
						}
					`,
          variables: {
            ...this.form
          }
        });
        this.$store.commit("addAlert", {
          type: "success",
          message: `Блюдо ${this.form.name} добавлено с ID ${
            result.data.addDish
          }`
        });
      } catch (error) {
        this.$store.commit("addAlert", {
          type: "error",
          message: error.message
        });
      }
    },
    async updateDish() {
      try {
        let result = await this.$apollo.mutate({
          mutation: this.$gql`
						mutation($id: Int!, $name: String!, $typeId: Int!, $recipe: String, $ingredients: [Int!]) {
							updateDish(id: $id, name: $name, typeId: $typeId, recipe: $recipe, ingredients: $ingredients)
						}
					`,
          variables: {
            ...this.form,
            id: this.$route.params.id
          }
        });
        this.$store.commit("addAlert", {
          type: "success",
          message: `Блюдо ${this.form.name} обновлено`
        });
        this.$router.replace({ name: "food" });
      } catch (error) {
        this.$store.commit("addAlert", {
          type: "error",
          message: error.message
        });
      }
    },
    resetForm() {
      let form = this.form,
        dish = this.dish;
      form.name = dish.name;
      form.typeId = dish.typeId;
      form.ingredients = dish.ingredients.map(ingredient => ingredient.id);
      form.recipe = dish.recipe;
      this.$refs.form.resetValidation();
    },
    stringRequired(value) {
      if (value.trim()) return true;
      return "Поле необходимо заполнить";
    },
    numberRequired(value) {
      if (value) return true;
      return "Поле необходимо заполнить";
    },
    arrayOneOrMore(value) {
      if (value.length > 0) return true;
      return "Необходимо выбрать хотя бы один элемент";
    }
  },
  mounted() {
    this.fetchData();
  }
};
</script>
