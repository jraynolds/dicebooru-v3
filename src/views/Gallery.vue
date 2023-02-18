<template>
	<ImageUpload />

	<MapPopup v-bind:isOpen="popupOpen" @update:isOpen="test" :map="popupMap" />

	<v-container style="min-height: 100%;">
		<v-row>
			<v-col>
				<SearchBar 
					bg-color="success" 
					prepend-inner-icon="mdi-tag" 
					:items="includedTags" 
					:selections="filtersStore.includedTags"
					@changeSelections="filtersStore.setIncludedTags"
					label="Include these tags:"
				/>
			</v-col>
			<v-col>
				<SearchBar 
					bg-color="error" 
					prepend-inner-icon="mdi-tag-off"
					:items="excludedTags" 
					:selections="filtersStore.excludedTags"
					@changeSelections="filtersStore.setExcludedTags"
					label="Exclude these tags:"
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
		includedTags() {
			return this.dataStore.getTags.filter(t => !this.filtersStore.getExcludedTags.includes(t));
		},
		excludedTags() {
			return this.dataStore.getTags.filter(t => !this.filtersStore.getIncludedTags.includes(t));
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
		test(val) {
			console.log(val);
			this.popupOpen = val;
		}
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