<template>
  <v-layout>
    <v-flex>
      <v-expansion-panel :value="0">
        <v-expansion-panel-content>
          <div slot="header">Ингредиенты</div>

          <v-card>
            <v-card-text>
              <v-layout>
                <v-flex class="text-xs-center">
                  <v-btn class="mx-0" color="primary" small @click="filterAll">Все</v-btn>
                  <v-btn class="mx-0" color="primary" small @click="filterNone">Очистить</v-btn>
                  <v-btn class="mx-0" color="primary" small @click="filterInvert">Инверт.</v-btn>
                </v-flex>
              </v-layout>

              <v-layout wrap>
                <v-flex v-for="ingredient in ingredients" :key="ingredient.name">
                  <v-checkbox v-model="filter" :label="ingredient.name" :value="ingredient.name"></v-checkbox>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-tabs fixed-tabs>
        <v-tab v-for="type in types" :key="type.id">{{ type.name }}</v-tab>

        <v-tab-item v-for="type in types" :key="type.id">
          <v-card v-for="dish in filteredDishes(type.dishes)" :key="dish.id">
            <v-card-title class="title blue darken-2 white--text">{{ dish.name }}</v-card-title>

            <v-card-text>
              <v-layout column>
                <v-flex
                  v-for="ingredient in dish.ingredients"
                  :key="ingredient.id"
                  class="body-2"
                >{{ ingredient.name }}</v-flex>
                <v-flex
                  v-if="dish.recipe"
                  class="pt-2"
                  style="white-space: pre-wrap;"
                >{{ dish.recipe }}</v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-flex>
  </v-layout>
</template>

<script>
import gql from "graphql-tag";

export default {
  name: "Food",
  data() {
    return {
      types: [],
      ingredients: [],
      filter: []
    };
  },
  apollo: {
    types: {
      query: gql`
        {
          types {
            id
            name
            dishes {
              id
              name
              recipe
              ingredients {
                id
                name
              }
            }
          }
        }
      `
    },
    ingredients: {
      query: gql`
        {
          ingredients {
            id
            name
          }
        }
      `
    }
  },
  methods: {
    filterAll() {
      this.filter = this.ingredients.map(ingredient => ingredient.name);
    },
    filterNone() {
      this.filter = [];
    },
    filterInvert() {
      this.filter = this.ingredients
        .map(ingredient => ingredient.name)
        .filter(ingredient => !this.filter.includes(ingredient));
    },
    filteredDishes(dishes) {
      return dishes.filter(dish => {
        for (let ingredient of dish.ingredients) {
          if (this.filter.includes(ingredient.name)) return true;
        }
        return false;
      });
    }
  }
};
</script>
