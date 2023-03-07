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
					@update:selections="$emit('update:selections', $event)"
					:displayCount="true"
					:label="title"
				/>

				<v-row v-else class="flex-wrap ma-0">
					<v-col cols="12" class="align-center justify-center d-flex mb-n4">
						<v-card-title><v-icon>{{ icon }}</v-icon>{{ title }}</v-card-title>
					</v-col>

					<v-col cols="6" v-for="i of 4" :key="i" class="mb-n8 px-1">
						<SearchBar 
							:prepend-inner-icon="icons[i-1]" 
							:items="items.filter(item => item.type.id === i)"
							:selections="selections.filter(s => s.type.id == i)"
							@update:selections="$emit('update:selections', this.selections.concat($event));"
							:displayCount="true"
							:simpleDisplay="true"
							:label="labels[i-1]"
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
	props: [ "color", "icon", "title", "items", "selections" ],

	computed: {

		sceneSelections: {
			get() { return this.selections.filter(s => s.type.id == 1); },
			set(val) { this.$emit('update:selections', this.selections.concat(val)); }
		},
		metaSelections: {
			get() { return this.selections.filter(s => s.type.id == 2); },
			set(val) { this.$emit('update:selections', this.selections.concat(val)); }
		},
		featureSelections: {
			get() { return this.selections.filter(s => s.type.id == 3); },
			set(val) { this.$emit('update:selections', this.selections.concat(val)); }
		},
		styleSelections: {
			get() { return this.selections.filter(s => s.type.id == 4); },
			set(val) { this.$emit('update:selections', this.selections.concat(val)); }
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