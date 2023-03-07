<template>
	<v-autocomplete 
		v-model="filtersStore.author"
		:items="dataStore.getAuthors"
		label="Filter by an author:" 
		prepend-icon="mdi-account"
		color="secondary"
		clearable
		item-title="name"
		return-object
	>
		<template v-slot:selection="{ props, item }">
			<span
				v-bind="props"
			>
				{{ toUpperCase(item.raw.name) }}
			</span>
		</template>
	</v-autocomplete>
</template>

<script>
import { toUpperCase } from "@/scripts/extensions"
import { useDataStore } from "@/stores/data";
import { useFiltersStore } from "@/stores/filters";

export default {
	setup() {
		const dataStore = useDataStore();
		const filtersStore = useFiltersStore();

		return {
			toUpperCase,
			dataStore,
			filtersStore
		}
	}
}
</script>

<style>

</style>