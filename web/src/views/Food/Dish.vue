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
        <v-btn @click.prevent="fetchData">Fetch</v-btn>
        <v-btn color="warning" @click.prevent="resetForm">Сброосить</v-btn>
        <v-btn color="success" @click.prevent="saveDish">Сохранить</v-btn>
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
      console.log("Fetching Data");

      this.$apollo
        .query({
          query: this.$gql`{
					types {
						id
						name
					}
					ingredients {
						id
						name
					}
				}`
        })
        .then(result => {
          this.types = result.data.types;
          this.ingredients = result.data.ingredients;
        })
        .catch(error => console.log(error));
    },
    saveDish() {
      if (!this.$refs.form.validate()) return;
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
