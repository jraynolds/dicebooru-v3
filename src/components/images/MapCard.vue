<template>
	<v-card class="mapCard">
		<v-btn text :disabled="!map?.author?.name" style="width: 100%; height: 100%;">
			<v-card-title>
				{{ map?.author?.name || "Unknown Author" }}
			</v-card-title>

			<v-spacer />

			<v-icon width="20" class="align-end" size="x-large">
				{{ map?.security_level?.icon || 'mdi-lock-question' }}
			</v-icon>
		</v-btn>

		<v-img :src="large ? map.url : map.thumb_url" @click="$emit('imageClick')" class="clickable">
			<template v-slot:placeholder>
				<div class="d-flex align-center justify-center fill-height">
					<v-progress-circular
						color="grey-lighten-4"
						indeterminate
					/>
				</div>
			</template>
		</v-img>

		<v-row class="pl-2 ma-0 pb-1 mb-n3" style="overflow-y: auto; height: 80px;">
			<TagChip 
				v-for="mapTag of map.tags" 
				:key="mapTag.id" 
				:tag="mapTag.tag"
				style="min-width: 'fit-content;'"
				@click="toggleFilterTag(mapTag.tag)"
				class="mb-1 mr-1"
			/>
		</v-row>
	</v-card>
</template>

<script>
import { useDataStore } from '@/stores/data';
import { useFiltersStore } from '@/stores/filters';

import TagChip from '@/components/images/TagChip.vue'
export default {
	props: [ "map", "large" ],

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
.mapCard {
	overflow: hidden; 
	display: grid !important; 
	grid-template-rows: 50px 1fr 80px; 
	row-gap: 10px;
	height: 100%;
}

.clickable:hover {
	cursor: pointer;
}
</style>