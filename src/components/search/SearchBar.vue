<template>
	<v-autocomplete 
		v-model="model"
		:items="sortedItems"
		:label="label" 
		:prepend-icon="icon"
		:color="color"
		:chips="!single"
		:closable-chips="!single"
		:multiple="!single"
		clearable
		hide-selected
		item-title="name"
		return-object
	>
		<template v-slot:chip="{ props, item }" v-if="!single">
			<v-chip
				v-if="simpleDisplay"
				v-bind="props"
				:text="item.raw.name"
			/>
			<v-chip
				v-else
				v-bind="props"
				:prepend-icon="item.raw.type.icon"
				:text="item.raw.name"
			/>
		</template>
		<template v-slot:item="{ item, props }">
			<v-list-item
				v-if="subcategories && item.value.header"
				:title="toUpperFirst(item.value.title)"
				:prepend-icon="item.value.icon"
				:subtitle="sentenced(item.value.description)"
			/>
			<v-list-item
				v-else-if="simpleDisplay"
				v-bind="props"
				class="pl-2"
				:title="toUpperFirst(item.title)"
				:prepend-icon="'mdi'"
				:subtitle="displayCount ? `${item.value.tagged_maps} image${item.value.tagged_maps > 1 ? 's' : ''}` : ''"
			/>
			<v-list-item
				v-else
				v-bind="props"
				class="pl-2"
				:title="toUpperFirst(item.title)"
				:prepend-icon="item?.value?.type?.icon"
			>
			</v-list-item>
		</template>
	</v-autocomplete>
</template>

<script>
import { toUpperFirst, sentenced } from '@/scripts/extensions.js'

export default {
	props: [ 
		"selections", 
		"color", 
		"label", 
		"icon", 
		"items", 
		"displayCount", 
		"simpleDisplay",
		"single",
		"subcategories"
	],
	computed: {
		sortedItems() {
			if (!this.subcategories) return this.items;
			const sortedItems = this.items;
			sortedItems.sort((i1, i2) => {
				if (!i1.category && !i2.category) return 0;
				if (i1.category && !i2.category) return -1;
				if (!i1.category && i2.category) return 1;
				if (i1.category.id != i2.category.id) return i1.category.id - i2.category.id;
				return i2.tagged_maps - i1.tagged_maps;
			});

			const dictionary = {};
			for (let i=0; i<sortedItems.length; i++) {
				if (dictionary[sortedItems[i]?.category?.name] == undefined) {
					let category = sortedItems[i]?.category;
					dictionary[category?.name] = { 
						id: category?.id,
						title: category?.name,
						icon: category?.icon,
						description: category?.description,
						items: []
					};
				}
				dictionary[sortedItems[i]?.category?.name].items.push(sortedItems[i]);
			}

			var joinedItems = [];
			for (const [ key, value ] of Object.entries(dictionary)) {
				joinedItems.push({
					id: value.id || 999,
					title: value.title || 'unsorted',
					header: value.title || 'unsorted',
					icon: value.icon || 'mdi-help',
					description: value.description || 'additional elements'
				})
				joinedItems = joinedItems.concat(value.items);
			}

			return joinedItems;
		},
		model: {
			get() { return this.selections; },
			set(v) {
				console.log(v);
				this.$emit("update:selections", v);
			}
		}
	},

	setup() {

		return {
			toUpperFirst,
			sentenced
		}
	}
}
</script>

<style>

</style>