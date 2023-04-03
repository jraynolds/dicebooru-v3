<template>
	<v-card :color="color" class="px-3">
		<v-row>
			<v-col>
				<SearchBar 
					class="mb-n4"
					v-if="!expand"
					:prepend-inner-icon="icon" 
					:items="items"
					:selections="selections"
					@update:selections="emitSelections"
					:displayCount="true"
					:label="title"
				/>

				<v-row v-else class="flex-wrap ma-0">
					<v-col cols="12" class="align-center justify-center d-flex mb-n4">
						<v-card-title><v-icon>{{ icon }}</v-icon>{{ title }}</v-card-title>
					</v-col>

					<v-col cols="6" class="mb-n8 px-1">
						<SearchBar 
							:prepend-inner-icon="icons[0]" 
							:items="items.filter(item => item.type.id === 1)"
							v-model:selections="sceneSelection"
							:displayCount="true"
							:simpleDisplay="true"
							:label="labels[0]"
							:single="true"
						/>
					</v-col>
					<v-col cols="6" class="mb-n8 px-1">
						<SearchBar 
							:prepend-inner-icon="icons[1]" 
							:items="items.filter(item => item.type.id === 2)"
							v-model:selections="metaSelections"
							:displayCount="true"
							:simpleDisplay="true"
							:label="labels[1]"
							:clearable="false"
						/>
					</v-col>
					<v-col cols="6" class="mb-n8 px-1">
						<SearchBar 
							:prepend-inner-icon="icons[2]" 
							:items="items.filter(item => item.type.id === 3)"
							v-model:selections="featureSelections"
							:displayCount="true"
							:simpleDisplay="true"
							:label="labels[2]"
							:clearable="false"
						/>
					</v-col>
					<v-col cols="6" class="mb-n8 px-1">
						<SearchBar 
							:prepend-inner-icon="icons[3]" 
							:items="items.filter(item => item.type.id === 4)"
							v-model:selections="styleSelections"
							:displayCount="true"
							:simpleDisplay="true"
							:label="labels[3]"
							:clearable="false"
						/>
					</v-col>
				</v-row>
			</v-col>
		</v-row>

		<v-card-actions class="mt-n6 mb-n5">
			<v-btn height="40" style="width: 100%;" @click="expand = !expand">
				<v-icon>{{ expand ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
			</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script>
import { ref } from 'vue'
import SearchBar from '@/components/search/SearchBar.vue';

const labels = [
	"Overall scene",
	"Meta items",
	"Features",
	"Style choices",
]

const icons = [
	"mdi-castle",
	"mdi-grid",
	"mdi-pine-tree",
	"mdi-brush",
]

export default {
	components: { SearchBar },
	props: [ "color", "icon", "title", "items", "selections", "addGivens" ],

	computed: {

		// aggregateSelections: {
		// 	get() { return this.selections; },
		// 	set(val) { this.$emit('update:selections', val); }
		// },

		sceneSelection: {
			get() { return this.selections.find(s => s.type.id == 1); },
			set(val) {
				const selections = this.selections.filter(s => s.type.id != 1);
				if (val) {
					selections.push(val);

					if (this.addGivens && val.given_tags?.length > 0) {
						for (const given of val.given_tags) {
							if (!selections.find(s => s.id == given)) {
								const givenTag = this.items.find(i => i.id == given);
								if (givenTag) selections.push(givenTag);
							}
						}
					}
				}

				this.$emit(
					'update:selections', 
					selections
				); 
			}
		},
		metaSelections: {
			get() { return this.selections.filter(s => s.type.id == 2); },
			set(val) {
				const selections = [];
				let selection = null;
				for (selection of this.selections) {
					if (selection.type.id != 2 || val.includes(selection)) selections.push(selection);
				}
				for (selection of val) {
					if (!selections.includes(selection)) selections.push(selection);
				}

				this.$emit(
					'update:selections', 
					selections
				); 
			}
		},
		featureSelections: {
			get() { return this.selections.filter(s => s.type.id == 3); },
			set(val) {
				const selections = [];
				let selection = null;
				for (selection of this.selections) {
					if (selection.type.id != 3 || val.includes(selection)) selections.push(selection);
				}
				for (selection of val) {
					if (!selections.includes(selection)) selections.push(selection);
				}

				this.$emit(
					'update:selections', 
					selections
				); 
			}
		},
		styleSelections: {
			get() { return this.selections.filter(s => s.type.id == 4); },
			set(val) {
				const selections = [];
				let selection = null;
				for (selection of this.selections) {
					if (selection.type.id != 4 || val.includes(selection)) selections.push(selection);
				}
				for (selection of val) {
					if (!selections.includes(selection)) selections.push(selection);
				}

				this.$emit(
					'update:selections', 
					selections
				); 
			}
		}

	},

	methods: {
		emitSelections(selections) {
			// if (this.addGivens) {
			// 	const difference = selections.find(s => this.selections)
			// }

			this.$emit('update:selections', selections);
		}
	},

	setup() {
		const expand = ref(false);

		return {
			labels,
			icons,

			expand
		}
	}
}
</script>

<style>
.v-menu > * {
	background-color: white !important;
}
</style>