<template>
  <v-layout>
    <v-flex>
      <router-view></router-view>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: "Food",
  data() {
    return {
      //
    };
  },
  mounted() {
    this.$store.commit("setMenu", {
      admin: [
        {
          title: "Редактировать Ингредиенты",
          to: { name: "food_ingredient" }
        }
      ]
    });
  }
};
</script>
