<template>
  <v-card :color="color">
    <v-card-title><v-icon>{{ icon }}</v-icon>{{ title }}</v-card-title>

    <SearchBar 
      v-if="!expand"
			bg-color="success" 
			prepend-inner-icon="mdi-tag" 
			:items="items"
			:selections="selections"
			@update:selections="$emit('update:selections', $event)"
			:displayCount="true"
    />

    <v-row >
    </v-row>
  </v-card>
</template>

<script>
import { ref } from 'vue'
import SearchBar from '@/components/search/SearchBar.vue';

export default {
  components: { SearchBar },
  props: [ "color", "icon", "title", "items", "selections" ],

  setup() {
    const expand = ref(false);

    return {
      expand
    }
  }
}
</script>

<style>

</style>