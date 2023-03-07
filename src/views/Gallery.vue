<template>
	<Sidebar />

	<ImageUpload />

	<MapPopup :open="popupOpen" @update:open="setPopupOpen" :map="popupMap" />

	<v-container style="min-height: 100%;">

		<v-row class="justify-center align-center d-flex" ref="scroller">
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

		<v-col class="justify-center align-center d-flex" style="width: 100%; text-align: center; height: 100px;">
			<v-progress-circular indeterminate size="small" v-if="moreMapsExist" />
			{{ moreMapsExist ? '&nbsp;Loading More...' : 'All maps loaded!' }}
		</v-col>
	</v-container>
</template>

<script>
import { ref } from 'vue';
import { useInfiniteScroll } from '@vueuse/core'

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
		moreMapsExist() { return this.dataStore.moreMapsExist; }
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
	},

	mounted() {
		console.log("mounting!");
		this.dataStore.initialLoad();
	},

	setup() {
		const dataStore = useDataStore();
		const filtersStore = useFiltersStore();

		const popupOpen = ref(false);
		const popupMap = ref(null);

		const scroller = ref(null);

		const test = ref(true);

		useInfiniteScroll(
			scroller,
			() => {
				console.log("Scrolled");
			},
			{ distance: 10 }
		)

		return {
			dataStore,
			filtersStore,

			popupOpen,
			popupMap,
			
			scroller,

			test
		}
	}
}
</script>

<style>
</style>