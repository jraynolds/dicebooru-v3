<template>
	<ImageUpload />

	<MapPopup :open="popupOpen" @update:open="setPopupOpen" :map="popupMap" />

	<v-container style="min-height: 100%;">
		<v-row>
			<v-col>
				<v-select
					class="px-4"
					bg-color="primary"
					prepend-inner-icon="mdi-account"
					:items="dataStore.getAuthors"
					v-model="author"
					label="Filter by an author:"
				/>
			</v-col>
			<v-col>
				<SearchBar 
					bg-color="success" 
					prepend-inner-icon="mdi-tag" 
					:items="availableIncludedTags" 
					:selections="selectedIncludedTags"
					@update:selections="setSelectedIncludedTags"
					label="Include these tags:"
					:displayCount="true"
				/>
			</v-col>
			<v-col>
				<SearchBar 
					bg-color="error" 
					prepend-inner-icon="mdi-tag-off" 
					:items="availableExcludedTags" 
					:selections="selectedExcludedTags"
					@update:selections="setSelectedExcludedTags"
					label="Exclude these tags:"
					:displayCount="true"
				/>
			</v-col>
		</v-row>

		<v-row class="mx-8 mt-n6 mb-8">
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

		<v-row>
			<MapCard 
				v-for="map in dataStore.getMaps" 
				:key="map.id" 
				:map="map"
				@click="selectMap(map)" 
				height="400" 
				width="300" 
			/>
		</v-row>
	</v-container>
</template>

<script>
import { ref } from 'vue';

import SearchBar from '@/components/search/SearchBar.vue';
import MapCard from '@/components/images/MapCard.vue';
import ImageUpload from '@/components/images/ImageUpload.vue';

import { useDataStore } from '@/stores/data';
import { useAuthStore } from '@/stores/auth';
import { useFiltersStore } from '@/stores/filters';
import MapPopup from '@/components/images/MapPopup.vue';

export default {
	components: { SearchBar, MapCard, ImageUpload, MapPopup },

	computed: {
		availableIncludedTags() { return this.dataStore.getTags.filter(t => !this.filtersStore.getExcludedTags.includes(t)); },
		selectedIncludedTags() { return this.filtersStore.getIncludedTags; },
		availableExcludedTags() { return this.dataStore.getTags.filter(t => !this.filtersStore.getIncludedTags.includes(t)); },
		selectedExcludedTags() { return this.filtersStore.getExcludedTags; },
		author: {
			get() { return this.filtersStore.getAuthor; },
			set(val) { return this.filtersStore.setAuthor(val); },
		}
	},

	methods: {
		async search() {
			this.searching = true;
			await this.dataStore.loadFilteredMaps();
			this.searching = false;
		},
		selectMap(map) {
			this.popupMap = map;
			this.popupOpen = true;
		},
		setPopupOpen(val) {
			this.popupOpen = val;
		},
		setSelectedIncludedTags(val) { this.filtersStore.setIncludedTags(val); },
		setSelectedExcludedTags(val) { this.filtersStore.setExcludedTags(val); },
	},

	mounted() {
		this.dataStore.initialLoad();
	},

	setup() {
		const dataStore = useDataStore();
		const filtersStore = useFiltersStore();
		const authStore = useAuthStore();

		const searching = ref(false);

		const popupOpen = ref(false);
		const popupMap = ref(null);

		return {
			dataStore,
			filtersStore,
			authStore,

			searching,

			popupOpen,
			popupMap
		}
	}
}
</script>

<style>

</style>