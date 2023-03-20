<template>
	<Sidebar />
	
	<v-container style="min-height: 100%;" class="justify-center align-center d-flex flex-wrap">
		<v-row class="justify-center align-center d-flex flex-column">
			
		</v-row>
	</v-container>
</template>

<script>
import { ref } from 'vue';

import Sidebar from '@/components/framework/Sidebar.vue';
import MapCard from '@/components/images/MapCard.vue';
import ImageUpload from '@/components/images/ImageUpload.vue';
import MapPopup from '@/components/images/MapPopup.vue';
import FoldableSearchBars from '@/components/search/FoldableSearchBars.vue';

import { useDataStore } from '@/stores/data';
import { useFiltersStore } from '@/stores/filters';

export default {
	components: { Sidebar, MapCard, ImageUpload, MapPopup, FoldableSearchBars },

	computed: {
		moreMapsExist() { return this.dataStore.moreMapsExist; },
		loadingMoreMaps() { return this.dataStore.isLoading; },
	},

	methods: {
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
		},
		loadMoreMaps() {
			if (this.loadingMoreMaps) return;
			this.dataStore.loadMoreMaps();
		}
	},

	mounted() {
		console.log("mounting!");
		this.dataStore.initialLoad();

		this.$nextTick(() => {
			const el = this.scrollStop.$el;
			document.addEventListener('scroll', function (e) {
				var rect = el.getBoundingClientRect();
				const isVisible = (rect.top >= 0) && (rect.bottom <= window.innerHeight);
				if (isVisible) this.loadMoreMaps();
			}.bind(this));
		})
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

			scrollStop
		}
	}
}
</script>

<style>
</style>