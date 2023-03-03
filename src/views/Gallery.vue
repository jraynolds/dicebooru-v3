<template>
	<ImageUpload />

	<MapPopup :open="popupOpen" @update:open="setPopupOpen" :map="popupMap" />

	<v-container style="min-height: 100%;">
		<v-row>
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
				<SearchBar 
					bg-color="success" 
					prepend-inner-icon="mdi-tag" 
					:items="availableIncludedTags" 
					:selections="filtersStore.getIncludedTags"
					@update:selections="filtersStore.setIncludedTags"
					label="Include these tags:"
					:displayCount="true"
				/>
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

		<v-row class="justify-center align-center d-flex">
			<v-col
				class="d-flex align-center justify-center"
				v-for="map in dataStore.getMaps" 
				:key="map.id"
			>
				<MapCard  
					:map="map"
					@click="selectMap(map)"
					@tagClick="toggleFilterTag"
					@headerClick="toggleFilterAuthor(map.author)"
					height="400" 
					width="300" 
				/>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { ref } from 'vue';

import SearchBar from '@/components/search/SearchBar.vue';
import MapCard from '@/components/images/MapCard.vue';
import ImageUpload from '@/components/images/ImageUpload.vue';
import MapPopup from '@/components/images/MapPopup.vue';
import AuthorFilterBar from '@/components/search/AuthorFilterBar.vue';

import { useDataStore } from '@/stores/data';
import { useAuthStore } from '@/stores/auth';
import { useFiltersStore } from '@/stores/filters';

export default {
	components: { SearchBar, MapCard, ImageUpload, MapPopup, AuthorFilterBar },

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
		toggleFilterTag(tag) {
			this.filtersStore.toggleIncludedTag(tag);
		},
		toggleFilterAuthor(author) {
			this.filtersStore.toggleAuthor(this.dataStore.authors.find(a => a.id === author));
		}
	},

	mounted() {
		console.log("mounting!");
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