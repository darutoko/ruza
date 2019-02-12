<template>
  <v-layout column>
    <v-flex>
      <v-layout align-center>
        <v-flex xs5 sm2>
          <v-btn color="primary" outline :to="{ name: 'food_list' }">
            <v-icon>navigate_before</v-icon>Назад
          </v-btn>
        </v-flex>
        <v-flex xs7 sm10>
          <v-text-field
            label="Добавить"
            v-model="add.value"
            :error="add.error"
            :error-messages="add.errorMessage"
            v-on:keyup.enter="addItem"
          ></v-text-field>
        </v-flex>
      </v-layout>
    </v-flex>

    <v-flex>
      <v-list>
        <v-hover v-for="item in items" :key="item.id">
          <v-list-tile slot-scope="{ hover }" @click.prevent>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.name }}</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-btn v-if="hover" icon ripple>
                <v-icon color="info">edit</v-icon>
              </v-btn>
            </v-list-tile-action>
            <v-list-tile-action>
              <v-btn v-if="hover" icon ripple>
                <v-icon color="error">delete</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-hover>
      </v-list>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      add: {
        error: false,
        value: "",
        errorMessage: ""
      }
    };
  },
  apollo: {
    items: {
      query() {
        return this.$gql`
				{ 
					${this.name}s {
						id
						name
					}
				}
				`;
      },
      update: data => data.ingredients || data.types
    }
  },
  computed: {
    name() {
      return this.$route.name.split("_")[1];
    },
    addName() {
      return this.name === "ingredient" ? "addIngredient" : "addType";
    },
    updateName() {
      return this.name === "ingredient" ? "updateIngredient" : "updateType";
    }
  },
  methods: {
    addItem(e) {
      e.preventDefault();
      // if (!this.isInputValid(this.add)) return;
      this.$apollo
        .mutate({
          mutation: this.$gql`
						mutation($name: String!) {
							${this.addName}(name: $name) {
								id
								name
							}
						}
					`,
          variables: {
            name: this.add.value
          }
        })
        .then(result => this.items.push(result.data[this.addName]))
        .catch(error => console.log(error.message));
    },
    isInputValid(input) {
      input.value.trim();
      input.error = false;
      input.errorMessage = "";
      if (!input.value) return false;
      if (this.items.some(item => item.name === input.value)) {
        input.error = true;
        input.errorMessage = "Название уже занято";
        return false;
      }

      return true;
    }
  }
};
</script>
