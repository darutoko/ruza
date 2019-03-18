<template>
  <v-navigation-drawer app clipped :value="isShown">
    <v-list>
      <v-list-tile v-for="item in items" :key="item.name" :to="item.route">
        <v-list-tile-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ item.name }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: ["isShown"],
  data() {
    return {
      items: [
        {
          icon: "live_tv",
          name: "Сериалы",
          route: {name: "shows_list"}
        },
        {
          icon: "restaurant_menu",
          name: "Еда",
          route: {name: "food_list"}
        },
        {
          icon: "video_label",
          name: "Видео",
          route: {name: "videos"}
        }
      ]
    };
  }
};
</script>
