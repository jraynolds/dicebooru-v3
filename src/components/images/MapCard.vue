<template>
	<v-card class="mapCard">
		<v-btn 
			text 
			:disabled="!author?.name" 
			style="width: 100%; height: 50px;" 
			class="mb-1"
			color="primary"
			@click.stop="$emit('headerClick')"
		>
			<v-card-title>
				{{ authorName }}
			</v-card-title>

			<v-spacer />

			<v-icon width="20" class="align-end" size="x-large">
				{{ security_level.icon }}
			</v-icon>
		</v-btn>

		<v-img 
			:src="large ? map.url : map.thumb_url" 
			@click="$emit('imageClick')" 
			class="clickable mb-1"
			style="flex-shrink: 1"
		>
			<template v-slot:placeholder>
				<div class="d-flex align-center justify-center fill-height">
					<v-progress-circular
						color="grey-lighten-4"
						indeterminate
					/>
				</div>
			</template>
		</v-img>

		<v-row class="pl-2 ma-0" style="overflow-y: auto; height: 80px; min-height: 80px;">
			<TagChip 
				v-for="mapTag of tags" 
				:key="mapTag.id" 
				:tag="mapTag.tag"
				style="min-width: 'fit-content;'"
				@click.stop="$emit('tagClick', mapTag.tag)"
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

	computed: {
		author() {
			return this.dataStore.getMapAuthor(this.map);
		},
		authorName() {
			if (!this.author) return "Unknown Author";
			return this.toUpperCase(this.author.name);
		},
		security_level() {
			if (!this.author) {
				if (this.map.security_level) return this.map.security_level;
				return { icon: 'mdi-lock-question' };
			}
			else if (this.author) {
				if (this.map.security_level) return this.map.security_level;
				if (this.author.default_security_level) return this.author.default_security_level;
				return { icon: 'mdi-lock-open' };
			}
		},
		tags() {
			return this.map.tags.sort((t1, t2) => {
				return t1.tag.type.id - t2.tag.type.id; 
			});
		}
	},

	methods: {
		toUpperCase(str) {
			const upperStrings = [];
			for (const s of str.split(" ")) {
				upperStrings.push(s.charAt(0).toUpperCase() + s.slice(1));
			}
			return upperStrings.join(" ");
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
	display: flex;
	flex-direction: column;
}

.clickable:hover {
	cursor: pointer;
}
</style>