<template>
	<Sidebar />

	<ImageUpload />

	<MapPopup :open="popupOpen" @update:open="setPopupOpen" :map="popupMap" />
	
	<v-container style="min-height: 100%;" class="justify-center align-center d-flex flex-wrap">

		<v-row class="justify-center align-center d-flex flex-column">
			<v-col class="align-center justify-center d-flex">
				<v-card-title>Now showing {{ dataStore.getMaps.length }} of {{ dataStore.getTotalMapsAvailable }} maps!</v-card-title>
			</v-col>
			<v-col>
				<v-row>
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
			</v-col>
			<v-col 
				class="justify-center align-center d-flex" 
				style="width: 100%; text-align: center; height: 100px;"
				ref="scrollStop"
			>
				<v-progress-circular indeterminate size="small" v-if="loadingMoreMaps" />
				<span v-if="loadingMoreMaps">'&nbsp;Loading more...'</span>
				<span v-else-if="moreMapsExist">Scroll down to load more maps!</span>
				<span v-else>All maps loaded!</span>
			</v-col>
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