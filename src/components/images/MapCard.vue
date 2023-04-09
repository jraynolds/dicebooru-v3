<template>
	<v-card class="mapCard" ref="card">
		<v-btn 
			text 
			:disabled="!author?.name" 
			style="width: 100%; height: 50px;" 
			class="mb-1"
			color="primary"
			@click.stop="clickableHeader ? $emit('headerClick') : ''"
		>
			<ReportDialog 
				@submitted="visualsStore.showSnackbar('Report submitted! Please allow some time for review.')" 
				v-show="large && authStore.getUser"
				:map="map"
			/>

			<v-card-title>
				{{ authorName }}
			</v-card-title>

			<v-spacer />

			<v-icon width="20" class="align-end" size="x-large">
				{{ security_level.icon }}
			</v-icon>

			<v-btn
				v-if="large && map.author && dataStore.getUserAuthor?.id == map.author" 
				variant="text"
				style="position: absolute; right: 0;" 
				@click.stop="settingsPopup = true"
			>
				<ImageSettingsPopup 
					:map="map"
					v-model:open="settingsPopup" 
					@settingsUpdated="visualsStore.showSnackbar('Map settings saved!')"
					@error="visualsStore.showSnackbar('Couldn\'t save map settings. Please try again later.')"
				/>
				<v-icon>mdi-cog</v-icon>
			</v-btn>
		</v-btn>

		<v-img 
			:src="!large || security_level.value > 1 ? map.thumb_url : map.url" 
			@click="$emit('imageClick')" 
			class="clickable mb-1 flex-grow-1"
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

			<div 
				style="position: absolute; right: 0; bottom: 0; margin-right: 0; margin-left: auto;"
				@click.stop="large ? '' : $emit('imageClick')"
			>
				<StarRating 
					v-show="map.avg_rating || (large && authStore.getUser)"
					:rating="map.avg_rating"
					:read-only="!authStore.getUser || !large"
					:show-rating="false"
					:star-size="large ? 50 : 20"
					:increment=".5"
					@update:rating="rateMap" 
				/>
			</div>
		</v-img>

		<v-row 
			class="px-1 ma-0" 
			style="overflow-y: auto; height: 80px; min-height: 80px; max-height: 80px;"
		>
			<TagChip 
				v-for="mapTag of tags" 
				:key="mapTag.tag.id" 
				:tag="mapTag.tag"
				style="min-width: 'fit-content'"
				@click.stop="clickableTags ? $emit('tagClick', mapTag.tag) : ''"
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
import { useAuthStore } from '@/stores/auth';
import { useVisualsStore } from '@/stores/visuals';
import { toUpperCase } from '@/scripts/extensions';
import { useElementVisibility } from '@vueuse/core';
import { securityLevels } from '@/scripts/security';

import { ref } from 'vue';
import StarRating from 'vue-star-rating';

import TagChip from '@/components/images/TagChip.vue';
import SearchBar from '@/components/search/SearchBar.vue';
import ImageSettingsPopup from '@/components/images/ImageSettingsPopup.vue';
import ReportDialog from "@/components/ReportDialog.vue"

export default {
	props: [ "map", "large", "clickableHeader", "clickableTags" ],

	components: { TagChip, SearchBar, StarRating, ImageSettingsPopup, ReportDialog },

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
				if (this.map.security_level) return this.securityLevels[this.map.security_level];
				return { icon: 'mdi-lock-question' };
			}
			else if (this.author) {
				if (this.map.security_level) return this.securityLevels[this.map.security_level];
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

			const { error } = await this.dataStore.addTags(this.map, this.addedTags);
			if (!error) this.visualsStore.showSnackbar("Tags successfully added!");
			else this.visualsStore.showSnackbar("Tags couldn't be added. Please try again later.");

			this.uploadingTags = false;
			this.addedTags = [];
			this.addTagDialog = false;
		},
		async rateMap(rating) {
			const { error } = await this.dataStore.rateMap(this.map, rating);
			if (error) this.visualsStore.showSnackbar("Unable to rate map. Please try again later.");
			else this.visualsStore.showSnackbar("Rating saved!");
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
		const authStore = useAuthStore();
		const visualsStore = useVisualsStore();

		const hasLoaded = ref(false);

		const addTagDialog = ref(false);
		const addedTags = ref([]);
		const uploadingTags = ref(false);

		const card = ref(null);
		const isVisible = useElementVisibility(card);
		
		const settingsPopup = ref(false);

		return {
			dataStore,
			filtersStore,
			authStore,
			visualsStore,
			securityLevels,

			toUpperCase,

			isVisible,
			hasLoaded,

			addTagDialog,
			addedTags,
			uploadingTags,

			card,

			settingsPopup
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