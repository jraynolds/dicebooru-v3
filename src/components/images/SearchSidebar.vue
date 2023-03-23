<template>
	<v-col class="pa-0 ma-0 mr-4" style="overflow: hidden;">
		<v-row class="pa-0 ma-0 flex-column" style="height: 100%;">
			<v-col class="pl-6 ml-n2 flex-grow-0">
				<v-card color="secondary" class="pa-2 pb-1">
					<AuthorFilterBar />
				</v-card>
			</v-col>

			<v-col class="pl-6 ml-n2 flex-grow-0">
				<!-- <v-card color="highlight" class="pa-2 pb-1"> -->
					<v-row class="d-flex justify-center align-center">
						<v-col class="d-flex justify-center">
							<span 
								class="mr-4"
								style="max-width: 120px; text-align: right;"
							>
								Filter by a minimum rating:
							</span>
							<StarRating
								:increment=".5"
								:show-rating="false"
								:rating="filtersStore.getMinRating"
								@update:rating="stars = $event"
							/>
						</v-col>
						<v-col class="flex-grow-0">
							<v-row class="flex-nowrap">
								<v-col>
									<v-btn size="large" @click="filtersStore.incrementSecurityLevel">
										<v-icon size="large">
											{{ filtersStore.getSecurityLevel.icon }}
										</v-icon>
									</v-btn>
								</v-col>
								<v-col style="width: 100px;">
									{{ filtersStore.getSecurityLevel.description }}
								</v-col>
							</v-row>
						</v-col>
					</v-row>							
				<!-- </v-card> -->
			</v-col>

			<v-col class="pl-6 ml-n2">
				<FoldableSearchBars 
					class="pt-1"
					color="success"
					icon="mdi-tag"
					title="Include these tags:"
					:items="filtersStore.getIncludableTags"
					:selections="filtersStore.getIncludedTags"
					@update:selections="filtersStore.setIncludedTags"
				/>
			</v-col>
		
			<v-col class="pl-6 ml-n2">
				<FoldableSearchBars 
					class="pt-1"
					color="error"
					icon="mdi-tag-off"
					title="Exclude these tags:"
					:items="filtersStore.getExcludableTags"
					:selections="filtersStore.getExcludedTags"
					@update:selections="filtersStore.setExcludedTags"
				/>
			</v-col>

			<v-spacer />

			<v-col class="flex-grow-0 mb-n2 pl-4">
				<v-btn 
					color="primary" 
					style="width: 100%;" 
					height="50" 
					@click="search"
					:disabled="searching"
				>
					Search
					<v-icon v-if="!searching">mdi-magnify</v-icon>
					<v-progress-circular v-else indeterminate />
				</v-btn>
			</v-col>
		</v-row>
	</v-col>
</template>

<script>
import { ref } from 'vue';
import { useFiltersStore } from '@/stores/filters'
import { useDataStore } from '@/stores/data'

import StarRating from 'vue-star-rating'

import FoldableSearchBars from '@/components/search/FoldableSearchBars.vue';
import AuthorFilterBar from '@/components/search/AuthorFilterBar.vue';

export default {
  components: { FoldableSearchBars, AuthorFilterBar, StarRating },

	computed: {
		stars: {
			get() { return this.filtersStore.getMinRating; },
			set(val) {
				console.log(val);
				console.log(this.filtersStore.getMinRating);
				if (val == this.filtersStore.getMinRating) this.filtersStore.setMinRating(0);
				else this.filtersStore.setMinRating(val);
			}
		}
	},

	methods: {
		async search() {
			this.searching = true;
			await this.dataStore.newMapQuery();
			this.$emit('searchFinished');
			this.searching = false;
		}
	},

	setup() {
		const filtersStore = useFiltersStore();
		const dataStore = useDataStore();
		
		const searching = ref(false);

		return {
			filtersStore,
			dataStore,

			searching
		}
	}
}
</script>

<style>
</style>