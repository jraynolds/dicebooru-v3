<template>
	<v-card class="mapCard" ref="card">
		<v-snackbar v-model="tagSuccessSnackbar" v-if="large">
			Tags successfully added!
			<template v-slot:actions>
					<v-btn
						color="primary"
						variant="text"
						@click="tagSuccessSnackbar = false"
					>
						Close
					</v-btn>
				</template>
		</v-snackbar>
		<v-snackbar v-model="tagErrorSnackbar" v-if="large">
			Unknown error.
			<template v-slot:actions>
					<v-btn
						color="primary"
						variant="text"
						@click="tagErrorSnackbar = false"
					>
						Close
					</v-btn>
				</template>
		</v-snackbar>

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
				:key="mapTag.tag.id" 
				:tag="mapTag.tag"
				style="min-width: 'fit-content'"
				@click.stop="$emit('tagClick', mapTag.tag)"
				class="mb-1 mr-1"
			/>
			<v-dialog
				v-model="addTagDialog"
				width="500"
				v-if="large"
				:persistent="uploadingTags"
			>
				<template v-slot:activator="{ props }">
					<v-chip 
						color="primary"
						v-bind="props"
					>
						+
					</v-chip>
				</template>

				<v-card>
					<v-card-title>Add additional tags:</v-card-title>
					<SearchBar
						class="px-4"
						bg-color="primary"
						prepend-inner-icon="mdi-tag" 
						:items="addableTags"
						:selections="addedTags"
						@update:selections="addedTags = $event"
						label="Map should have these tags:"
					/>
					<v-card-actions>
						<v-spacer />
						<v-btn variant="flat" color="primary" @click="addTags">
							<template v-slot:append v-if="uploadingTags">
								<v-progress-circular indeterminate size="small" />
							</template>
							Add tags
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-row>
	</v-card>
</template>

<script>
import { useDataStore } from '@/stores/data';
import { useFiltersStore } from '@/stores/filters';
import { toUpperCase } from '@/scripts/extensions'
import { useElementVisibility } from '@vueuse/core'

import { ref } from 'vue'

import TagChip from '@/components/images/TagChip.vue'
import SearchBar from '@/components/search/SearchBar.vue'

export default {
	props: [ "map", "large" ],

	components: { TagChip, SearchBar },

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
			return this.map?.tags?.sort((t1, t2) => {
				return t1.tag.type.id - t2.tag.type.id; 
			});
		},
		addableTags() {
			const tagIDs = this.tags.map(t => t.tag.id);
			return this.dataStore.tags.filter(t => !tagIDs.includes(t.id));
		}
	},

	methods: {
		async addTags() {
			this.uploadingTags = true;

			const { data, error } = await this.dataStore.addTags(this.map, this.addedTags);
			if (data) this.tagSuccessSnackbar = true;
			else this.tagErrorSnackbar = true;

			this.uploadingTags = false;
			this.addedTags = [];
			this.addTagDialog = false;
		},
		initialLoad() {
			this.dataStore.loadThumbURL(this.map.id);
		},
	},

	watch: {
		map(m) {
			this.initialLoad();
		},
		isVisible(val) {
			this.$nextTick(() => {
				this.initialLoad();
			});
		}
	},

	beforeUpdate() {
		console.log(this.map.id);
	},

	setup() {
		const dataStore = useDataStore();
		const filtersStore = useFiltersStore();

		const hasLoaded = ref(false);

		const addTagDialog = ref(false);
		const addedTags = ref([]);
		const uploadingTags = ref(false);

		const tagSuccessSnackbar = ref(false);
		const tagErrorSnackbar = ref(false);

		const card = ref(null);
		const isVisible = useElementVisibility(card);

		return {
			dataStore,
			filtersStore,
			toUpperCase,

			isVisible,
			hasLoaded,

			addTagDialog,
			addedTags,
			uploadingTags,

			tagSuccessSnackbar,
			tagErrorSnackbar,

			card
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