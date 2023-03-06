<template>
	<v-col>
		<AuthorFilterBar 
			bg-color="primary" 
			prepend-inner-icon="mdi-account" 
			:items="dataStore.getAuthors" 
			:selection="filtersStore.getAuthor"
			@update:selection="filtersStore.setAuthor"
			label="Filter by an author:"
		/>
	</v-col>
	<v-col>
		<v-card color="success">
			<v-card-title><v-icon>mdi-tag</v-icon> Include these tags:</v-card-title>
			<SearchBar  
				prepend-inner-icon="mdi-castle" 
				:items="availableIncludedTags" 
				:selections="filtersStore.getIncludedTags"
				@update:selections="filtersStore.setIncludedTags"
				label="This scene:"
				:displayCount="true"
				class="mb-n4"
			/>
			<SearchBar 
				prepend-inner-icon="mdi-grid" 
				:items="availableIncludedTags" 
				:selections="filtersStore.getIncludedTags"
				@update:selections="filtersStore.setIncludedTags"
				label="These meta items:"
				:displayCount="true"
				class="mb-n4"
			/>
			<SearchBar 
				prepend-inner-icon="mdi-pine-tree" 
				:items="availableIncludedTags" 
				:selections="filtersStore.getIncludedTags"
				@update:selections="filtersStore.setIncludedTags"
				label="These features:"
				:displayCount="true"
				class="mb-n4"
			/>
			<SearchBar 
				prepend-inner-icon="mdi-brush"
				:items="availableIncludedTags" 
				:selections="filtersStore.getIncludedTags"
				@update:selections="filtersStore.setIncludedTags"
				label="These stylistic touches:"
				:displayCount="true"
				class="mb-n4"
			/>
		</v-card>
	</v-col>
	<v-col>
		<SearchBar 
			bg-color="error" 
			prepend-inner-icon="mdi-tag-off" 
			:items="availableExcludedTags" 
			:selections="filtersStore.getExcludedTags"
			@update:selections="filtersStore.setExcludedTags"
			label="Exclude these tags:"
			:displayCount="true"
		/>
	</v-col>

	<v-row>
		<v-btn 
			color="primary" 
			class="fill-width" 
			style="width: 100%;"
			:disabled="searching"
			@click="search"
		>
			<v-progress-circular indeterminate v-show="searching" />
			Search
		</v-btn>
	</v-row>
</template>

<script>
import { ref } from 'vue';

import SearchBar from '@/components/search/SearchBar.vue';
import AuthorFilterBar from '@/components/search/AuthorFilterBar.vue';

import { useDataStore } from '@/stores/data';
import { useFiltersStore } from '@/stores/filters';

export default {
	components: { SearchBar, AuthorFilterBar },

	computed: {
		availableIncludedTags() { return this.dataStore.getTags.filter(t => !this.filtersStore.getExcludedTags.includes(t)); },
		availableExcludedTags() { return this.dataStore.getTags.filter(t => !this.filtersStore.getIncludedTags.includes(t)); },
		author: {
			get() { return this.filtersStore.getAuthor; },
			set(val) { return this.filtersStore.setAuthor(val); },
		}
	},

	methods: {
		async search() {
			this.searching = true;
			await this.dataStore.newQuery();
			this.searching = false;
		},
	},

	setup() {
		const dataStore = useDataStore();
		const filtersStore = useFiltersStore();

		const searching = ref(false);

		return {
			dataStore,
			filtersStore,

			searching
		}
	}
}
</script>

<style>

</style>