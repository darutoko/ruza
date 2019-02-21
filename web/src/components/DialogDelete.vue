<template>
  <v-dialog :value="shown" persistent max-width="500">
    <v-card>
      <v-card-title class="error white--text">Внимание!</v-card-title>
      <v-card-text>
        Подтвердите удаление "<strong>{{ name }}</strong>"
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" outline @click="$emit('cancel-click', $event)">Отмена</v-btn>
        <v-btn
          color="error"
          :loading="loading"
          :disabled="loading"
          @click="$emit('confirm-click', $event)"
        >Подтвердить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "DialogDelete",
  props: ["shown", "loading", "name"]
};
</script>
