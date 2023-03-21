<template>
		<v-row class="justify-center align-center d-flex flex-column">
			<v-col v-if="showCount" class="align-center justify-center d-flex">
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
              :clickableHeader="clickableHeader"
              :clickableTags="clickableTags"
							@click="$emit('mapClick', map)"
							@tagClick="$emit('tagClick', $event)"
							@headerClick="$emit('headerClick', map.author)"
							height="400" 
							width="300" 
						/>
					</v-col>
				</v-row>
			</v-col>
			<v-col 
        v-if="infiniteScroll"
				class="justify-center align-center d-flex" 
				style="width: 100%; text-align: center; height: 100px;"
				ref="scrollStop"
			>
				<v-progress-circular indeterminate size="small" v-if="dataStore.isLoading" />
				<span v-if="dataStore.isLoading">'&nbsp;Loading more...'</span>
				<span v-else-if="dataStore.moreMapsExist">Scroll down to load more maps!</span>
				<span v-else>All maps loaded!</span>
			</v-col>
		</v-row>
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
  props: [
    "showCount",
    "clickableHeader",
    "clickableTags",
    "infiniteScroll",
    "inactive"
  ],

	components: { Sidebar, MapCard, ImageUpload, MapPopup, FoldableSearchBars },

	computed: {
		moreMapsExist() { return this.dataStore.moreMapsExist; }
	},

	methods: {
		loadMoreMaps() {
      if (this.inactive) return;
			if (this.dataStore.isLoading) return;
      if (!this.dataStore.moreMapsExist) return;
			this.dataStore.loadMoreMaps();
		}
	},

	mounted() {
		console.log("mounting!");

		this.$nextTick(() => {
			const el = this.scrollStop.$el;
      if (this.infiniteScroll) {
        document.addEventListener('scroll', function (e) {
          var rect = el.getBoundingClientRect();
          console.log(rect);
          console.log(window.innerHeight);
          const isVisible = (rect.top >= 0) && (rect.bottom <= window.innerHeight);
          if (isVisible) this.loadMoreMaps();
        }.bind(this));
      }
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