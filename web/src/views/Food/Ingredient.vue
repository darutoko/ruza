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
						ref="addInput"
            label="Добавить"
            v-model.trim="add.value"
            :rules="add.rules"
            :loading="add.loading"
            :disable="add.loading"
						@blur="$refs.addInput.resetValidation()"
            @keyup.enter="addItem"></v-text-field>
        </v-flex>
      </v-layout>
    </v-flex>

    <v-flex>
      <v-hover v-for="(item, i) in items" :key="item.id">
        <v-card slot-scope="{ hover }" :color="`${hover ? 'grey lighten-4' : 'white'}`">
          <v-container pa-0>
            <v-layout align-center>
              <v-flex xs8 md10 v-if="item.id == update.item.id">
                <v-text-field
                  label="Изменить"
									class="pl-2"
                  v-model.trim="update.value"
                  :rules="update.rules"
                  :loading="update.loading"
                  :disabled="update.loading"
                  @keyup.enter="updateItem"></v-text-field>
              </v-flex>
              <v-flex xs8 md10 v-else>
                <v-card-text>{{ item.name }}</v-card-text>
              </v-flex>
              <v-flex xs4 md2 class="text-xs-right">
                <v-btn
                  v-if="hover && item.id != update.item.id"
                  icon ripple
                  title="Изменить"
                  @click.prevent="showUpdateInput(item)">
                  <v-icon color="info">edit</v-icon>
                </v-btn>
                <v-btn
                  v-if="hover && item.id == update.item.id"
                  icon ripple
                  title="Отмена"
                  @click.prevent="hideUpdateInput()">
                  <v-icon color="secondary">cancel</v-icon>
                </v-btn>
                <v-btn v-if="hover" icon ripple title="Удалить" @click.stop="confirmDelete(i)">
                  <v-icon color="error">delete</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-hover>

      <DialogDelete
        :shown="remove.dialog"
        :loading="remove.loading"
        :name="remove.name"
        @confirm-click="deleteItem"
        @cancel-click="clearDelete()"/>
    </v-flex>
  </v-layout>
</template>

<script>
import DialogDelete from "@/components/DialogDelete.vue";
import { textRequired } from "@/utils/rules.js";

export default {
  name: "Ingredient",
  components: { DialogDelete },
  data() {
    return {
      items: [],
      add: {
        value: "",
				loading: false,
				rules: [textRequired, this.uniqueItem],
      },
      update: {
        item: {},
        value: "",
        loading: false,
				rules: [textRequired, this.uniqueItem],
      },
      remove: {
				name: "",
        index: null,
        dialog: false,
        loading: false
      }
    };
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
		fetchItems() {
			this.graphql({
				query: `{ ${this.name}s { id name } }`,
				fetchPolicy: "no-cache",
			},
			data => {
        this.items = data[this.name + "s"];
			});
		},
    addItem() {
			if (!this.$refs.addInput.validate()) return;
			this.graphql({
				mutation: `mutation($name: String!) { ${this.addName}(name: $name) { id name } }`,
				variables: {
					name: this.add.value
				},
				loadingKey: "add",
			},
			data => {
        this.items.push(data[this.addName]);
				this.$store.commit("success", `Компонент "${this.items[this.items.length - 1].name}" добавлен`);
				this.add.value = "";
				this.$refs.addInput.resetValidation();
			});
    },
    updateItem() {
			if (this.update.value === "") return;
			this.graphql({
				mutation: `mutation($id: Int!, $name: String!) { ${this.updateName}(id: $id, name: $name) { id name } }`,
				variables: {
					id: this.update.item.id,
					name: this.update.value
				},
				loadingKey: "update",
			},
			data => {
        this.update.item.name = data[this.updateName].name;
				this.$store.commit("success", `Компонент "${this.update.item.name}" обновлен`);
				this.hideUpdateInput();
			});
    },
    deleteItem() {
			this.graphql({
				mutation: `mutation($id: Int!) { ${this.deleteName}(id: $id) }`,
				variables: {
					id: this.items[this.remove.index].id
				},
				loadingKey: "remove",
			},
			data => {
				this.items.splice(this.remove.index, 1);
				this.$store.commit("success", `Компонент "${this.remove.name}" удален`);
				this.clearDelete();
			});
    },
    showUpdateInput(item) {
      this.update.item = item;
      this.update.value = item.name;
    },
    hideUpdateInput() {
      this.update.item = {};
		},
		uniqueItem(value) {
			if (this.items.some(item => item.name === value)) return "Название уже занято";
			return true;
		},
    confirmDelete(i) {
			this.remove.name = this.items[i].name;
			this.remove.index = i;
      this.remove.dialog = true;
    },
    clearDelete() {
      this.remove.name = "";
      this.remove.index = null;
      this.remove.dialog = false;
		},
  },
	mounted() {
		this.fetchItems();
	}
};
</script>
