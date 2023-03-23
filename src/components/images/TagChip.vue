<template>
	<v-chip 
		:prepend-icon="tag.type.icon" 
		:text="tag.name" 
		:closable="closable"
		:variant="variant"
	/>
</template>

<script>
import { useFiltersStore } from '@/stores/filters';

export default {
	props: [ "tag", "closable" ],

	computed: {
		variant() {
			if (this.filtersStore.getIncludedTags.find(t => t.id == this.tag.id)) return 'outlined';
			if (this.filtersStore.getExcludedTags.find(t => t.id == this.tag.id)) return 'plain';
		}
	},

	setup() {

		const filtersStore = useFiltersStore();

		return {
			filtersStore
		}
	}
}
</script>

<style>

</style>