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
            :loading="add.loading"
            v-on:keyup.enter="addItem"
          ></v-text-field>
        </v-flex>
      </v-layout>
    </v-flex>

    <v-flex>
      <v-hover v-for="item in items" :key="item.id">
        <v-card slot-scope="{ hover }" :color="`${hover ? 'grey lighten-4' : 'white'}`">
          <v-container pa-0>
            <v-layout align-center>
              <v-flex xs8 md10 v-if="item.id == update.item.id">
                <v-text-field
                  label="Изменить"
                  v-model="update.value"
                  :error="update.error"
                  :error-messages="update.errorMessage"
                  :full-width="true"
                  :loading="update.loading"
                  v-on:keyup.enter="updateItem"
                ></v-text-field>
              </v-flex>
              <v-flex xs8 md10 v-else>
                <v-card-text>{{ item.name }}</v-card-text>
              </v-flex>
              <v-flex xs4 md2 class="text-xs-right">
                <v-btn
                  v-if="hover && item.id != update.item.id"
                  icon
                  ripple
                  title="Изменить"
                  @click.prevent="showUpdateInput(item)"
                >
                  <v-icon color="info">edit</v-icon>
                </v-btn>
                <v-btn
                  v-if="hover && item.id == update.item.id"
                  icon
                  ripple
                  title="Отмена"
                  @click.prevent="hideUpdateInput()"
                >
                  <v-icon color="secondary">cancel</v-icon>
                </v-btn>
                <v-btn v-if="hover" icon ripple title="Удалить" @click.stop="confirmDelete(item)">
                  <v-icon color="error">delete</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-hover>
      <v-dialog v-model="remove.dialog" persistent max-width="290">
        <v-card>
          <v-card-title class="error white--text">Внимание!</v-card-title>
          <v-card-text>Подтвердите удаление элемента "{{ remove.item.name }}"</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" outline @click="clearDelete()">Отмена</v-btn>
            <v-btn
              color="error"
              :loading="remove.loading"
              :disabled="remove.loading"
              @click="deleteItem"
            >Подтвердить</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
        loading: false,
        errorMessage: ""
      },
      update: {
        item: {},
        error: false,
        value: "",
        loading: false,
        errorMessage: ""
      },
      remove: {
        item: {},
        dialog: false,
        loading: false
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
    },
    deleteName() {
      return this.name === "ingredient" ? "deleteIngredient" : "deleteType";
    }
  },
  methods: {
    async addItem(e) {
      e.preventDefault();
      if (!this.isInputValid(this.add)) return;

      this.add.loading = true;
      try {
        let result = await this.$apollo.mutate({
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
        });
        this.items.push(result.data[this.addName]);
      } catch (error) {
        console.log(error.message);
      }

      this.clearInput(this.add);
    },
    async updateItem(e) {
      e.preventDefault();
      if (!this.isInputValid(this.update)) return;

      this.update.loading = true;
      try {
        let result = await this.$apollo.mutate({
          mutation: this.$gql`
						mutation($id: Int!, $name: String!) {
							${this.updateName}(id: $id, name: $name) {
								id
								name
							}
						}
					`,
          variables: {
            id: this.update.item.id,
            name: this.update.value
          }
        });
        this.update.item.name = result.data[this.updateName].name;
      } catch (error) {
        console.log(error.message);
      }

      this.hideUpdateInput();
    },
    async deleteItem(e) {
      e.preventDefault();

      this.remove.loading = true;
      try {
        let result = await this.$apollo.mutate({
          mutation: this.$gql`
						mutation($id: Int!) {
							${this.deleteName}(id: $id) 
						}
					`,
          variables: {
            id: this.remove.item.id
          }
        });
        if (result.data[this.deleteName])
          this.items = this.items.filter(
            item => item.id != this.remove.item.id
          );
      } catch (error) {
        console.log(error.message);
      }

      this.clearDelete();
    },
    showUpdateInput(item) {
      this.hideUpdateInput();
      this.update.item = item;
      this.update.value = item.name;
    },
    hideUpdateInput() {
      this.update.item = {};
      this.clearInput(this.update);
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
    },
    clearInput(input) {
      input.value = "";
      input.error = false;
      input.loading = false;
      input.errorMessage = "";
    },
    confirmDelete(item) {
      this.remove.item = item;
      this.remove.dialog = true;
    },
    clearDelete() {
      this.remove.item = {};
      this.remove.dialog = false;
      this.remove.loading = false;
    }
  }
};
</script>
