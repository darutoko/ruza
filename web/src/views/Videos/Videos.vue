<template>
  <v-layout>
    <v-flex>
      <router-view></router-view>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: "Videos",
  data() {
    return {
      //
    };
  },
  mounted() {
    this.$store.commit("setMenu", {
      admin: [
        // {
        //   title: "Добавить Блюдо",
        //   to: { name: "food_dish" }
        // },
			],
			user: []
    });
  }
};
</script>

