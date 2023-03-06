<template>
	<v-navigation-drawer
		v-model="drawer"
		permanent
		color="primary"
		:width="width"
	>
		<FoldableSearchBars 
			color="success"
			icon="mdi-tag"
			title="Include these tags:"
			:items="filtersStore.getIncludableTags"
			:selections="filtersStore.getIncludedTags"
			@update:selections="filtersStore.setIncludedTags"
		/>
	</v-navigation-drawer>
</template>

<script>
import { ref } from 'vue';
import { useFiltersStore } from '@/stores/filters'

import FoldableSearchBars from '@/components/search/FoldableSearchBars.vue';

export default {
  components: { FoldableSearchBars },

	computed: {
		width() {
			return window.innerWidth * .25;
		}
	},

	setup() {
		const filtersStore = useFiltersStore();

		const drawer = ref(true);

		return {
			drawer,

			filtersStore
		}
	}
}
</script>

<style>

</style>