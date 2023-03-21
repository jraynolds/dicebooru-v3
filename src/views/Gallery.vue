<template>
	<Sidebar
		:popoutIcons="['mdi-magnify', 'mdi-magnify-remove-outline']"
	/>

	<ImageUpload />

	<MapPopup :open="popupOpen" @update:open="popupOpen = $event" :map="popupMap" />
	
	<v-container style="min-height: 100%;" class="justify-center align-center d-flex flex-wrap">
		<MapRoll 
			:showCount="true"
			:clickableHeader="true"
			:clickableTags="true"
			:infiniteScroll="true"
			@mapClick="selectMap($event)"
			@headerClick="filtersStore.toggleAuthor(dataStore.authors.find(a => a.id == $event))"
			@tagClick="filtersStore.toggleIncludedTag($event)"
		/>
	</v-container>
</template>

<script>
import { ref } from 'vue';

import Sidebar from '@/components/framework/Sidebar.vue';
import ImageUpload from '@/components/images/ImageUpload.vue';
import MapPopup from '@/components/images/MapPopup.vue';
import MapRoll from '@/components/images/MapRoll.vue';

import { useDataStore } from '@/stores/data';
import { useFiltersStore } from '@/stores/filters';

export default {
	components: { Sidebar, ImageUpload, MapPopup, MapRoll },

	computed: {
		moreMapsExist() { return this.dataStore.moreMapsExist; },
		loadingMoreMaps() { return this.dataStore.isLoading; },
	},

	methods: {
		selectMap(map) {
			this.popupMap = map;
			this.popupOpen = true;
		},
		loadMoreMaps() {
			if (this.dataStore.isLoading) return;
			this.dataStore.loadMoreMaps();
		}
	},

	mounted() {
		this.$nextTick(() => {
			this.filtersStore.clearFilters();
			this.dataStore.initialLoad();
		});
	},

	setup() {
		const dataStore = useDataStore();
		const filtersStore = useFiltersStore();

		const popupOpen = ref(false);
		const popupMap = ref(null);

		const scrollStop = ref(null);

		return {
			dataStore,
			filtersStore,

			popupOpen,
			popupMap,

			scrollStop,
		}
	}
}
</script>

<style>
</style>