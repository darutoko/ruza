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
      admin: [],
			user: [
        {
          title: "Диск",
          to: { name: "videos_disk" }
        },
        {
          title: "Интернет",
          to: { name: "videos_internet" }
        },
			]
    });
  }
};
</script>

