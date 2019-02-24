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
            <v-hover>
              <v-card-title slot-scope="{hover}" class="blue darken-2 white--text">
                <div class="headline">{{ dish.name }}</div>
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  small
                  ripple
                  class="my-0"
                  title="Изменить"
                  v-if="isAdmin && hover"
                  :to="{name: 'food_dish', params: {id: dish.id}}"
                >
                  <v-icon color="grey lighten-5">edit</v-icon>
                </v-btn>
                <v-btn
                  icon
                  ripple
                  small
                  class="my-0"
                  title="Удалить"
                  v-if="isAdmin && hover"
                  @click.stop="confirmDelete(dish, type)"
                >
                  <v-icon color="error">delete</v-icon>
                </v-btn>
              </v-card-title>
            </v-hover>

            <v-card-text>
              <v-layout column>
                <v-flex
                  v-for="ingredient in dish.ingredients"
                  :key="ingredient.id"
                  class="body-2"
                >{{ ingredient.name }}</v-flex>
                <v-flex v-if="dish.recipe" class="pt-2" style="white-space: pre-wrap;">
                  <v-sheet color="grey lighten-4" class="pa-3">{{ dish.recipe }}</v-sheet>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>

      <DialogDelete
        :shown="remove.dialog"
        :loading="remove.loading"
        :name="remove.dish.name"
        @confirm-click="deleteDish"
        @cancel-click="clearDelete()"
      />
    </v-flex>
  </v-layout>
</template>

<script>
import DialogDelete from "@/components/DialogDelete.vue";

export default {
  name: "List",
  components: { DialogDelete },
  data() {
    return {
      types: [],
      ingredients: [],
      filter: [],
      remove: {
        dish: {},
        type: {},
        dialog: false,
        loading: false
      }
    };
  },
  computed: {
    isAdmin() {
      return this.$store.state.user.isAdmin;
    }
  },
  methods: {
    async fetchList() {
			this.$store.commit("loadingStart");
      try {
        let result = await this.$apollo.query({
          query: this.$gql` {
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
          ingredients {
            id
            name
          }
        } `
        });
        this.types = result.data.types;
        this.ingredients = result.data.ingredients;
      } catch (error) {
        console.log(error);
			}
			this.$store.commit("loadingStop");
    },
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
    },
    async deleteDish(e) {
      e.preventDefault();

      this.remove.loading = true;
      try {
        let result = await this.$apollo.mutate({
          mutation: this.$gql`
						mutation($id: Int!) {
							deleteDish(id: $id) 
						}
					`,
          variables: {
            id: this.remove.dish.id
          }
        });
        if (result.data.deleteDish) {
          this.$store.commit("addAlert", {
            type: "success",
            message: `Блюдо "${this.remove.dish.name}" удалено`
          });
          this.remove.type.dishes = this.remove.type.dishes.filter(
            dish => dish.id != this.remove.dish.id
          );
        }
      } catch (error) {
        console.log(error.message);
      }

      this.clearDelete();
    },
    confirmDelete(dish, type) {
      this.remove.dish = dish;
      this.remove.type = type;
      this.remove.dialog = true;
    },
    clearDelete() {
      this.remove.dish = {};
      this.remove.type = {};
      this.remove.dialog = false;
      this.remove.loading = false;
    }
  },
  created() {
    this.fetchList();
  }
};
</script>
