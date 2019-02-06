<template>
  <v-app>
    <v-navigation-drawer app clipped v-model="drawer.isShown">
      <v-list>
        <v-list-tile v-for="item in drawer.items" :key="item.name" :to="item.route">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.name }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar app clipped-left dark color="blue darken-3">
      <v-toolbar-side-icon @click="toggleDrawer"></v-toolbar-side-icon>
      <v-toolbar-title>HMWA</v-toolbar-title>
    </v-toolbar>

    <v-content>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: "App",
  components: {},
  data() {
    return {
      drawer: {
        isShown: null,
        items: [
          {
            icon: "live_tv",
            name: "Сериалы",
            route: "/"
          },
          {
            icon: "restaurant_menu",
            name: "Еда",
            route: "/food"
          },
          {
            icon: "video_label",
            name: "Видео",
            route: "/video"
          }
        ]
      }
    };
  },
  methods: {
    toggleDrawer() {
      this.drawer.isShown = !this.drawer.isShown;
    }
  }
};
</script>
