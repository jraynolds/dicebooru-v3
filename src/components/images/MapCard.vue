<template>
	<v-card height="430" width="300" style="overflow: hidden;">
		<v-btn text height="50" :disabled="!map?.author?.name" style="width: 100%;">
			<v-card-title>
				{{ map?.author?.name || "Unknown Author" }}
			</v-card-title>

			<v-spacer />

			<v-icon width="20" class="align-end" size="x-large">
				{{ map?.security_level?.icon || 'mdi-lock-question' }}
			</v-icon>
		</v-btn>

		<v-img :src="map.thumb_url" style="height: 300px;">
			<template v-slot:placeholder>
				<div class="d-flex align-center justify-center fill-height">
					<v-progress-circular
						color="grey-lighten-4"
						indeterminate
					/>
				</div>
			</template>
		</v-img>

		<v-row class="pl-2 ma-0 pb-1" style="height: 80px; overflow-y: auto;">
			<TagChip 
				v-for="mapTag of map.tags" 
				:key="mapTag.id" 
				:tag="mapTag.tag"
				style="min-width: 'fit-content;'"
				class="mt-1 mr-1"
				@click="toggleFilterTag(mapTag.tag)"
			/>
		</v-row>
	</v-card>
</template>

<script>
import { useDataStore } from '@/stores/data';
import { useFiltersStore } from '@/stores/filters';

import TagChip from './TagChip.vue'
export default {
	props: [ "map" ],

	components: { TagChip },

	methods: {
		toggleFilterTag(tag) {
			this.filtersStore.toggleIncludedTag(tag);
		}
	},

	watch: {
		map() {
			if (!this.map.thumb_url) this.dataStore.loadThumbURL(this.map.id);
		}
	},

	mounted() {
		if (!this.map.thumb_url) this.dataStore.loadThumbURL(this.map.id);
	},

	setup() {
		const dataStore = useDataStore();
		const filtersStore = useFiltersStore();

		return {
			dataStore,
			filtersStore
		}
	}
}
</script>

<style>

</style>