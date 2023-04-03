<template>
	<v-autocomplete 
		v-model="model"
		:items="items"
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
		<template v-slot:item="{ props, item }">
			<v-list-item
				v-if="simpleDisplay"
				v-bind="props"
			>
				<template v-slot:title>
					{{ item.title.substring(0, 1).toUpperCase() + item.title.substring(1) }}
					<em style="font-size: x-small; color: gray;">
						<span v-if="displayCount">{{ `${item.value.tagged_maps} image${item.value.tagged_maps > 1 ? 's' : ''}` }}</span>
					</em>
				</template>
			</v-list-item>
			<v-list-item
				v-else
				v-bind="props"
				:prepend-icon="item?.raw?.type?.icon"
				:subtitle="item?.raw?.type?.name"
			>
				<template v-slot:title>
					{{ item.title.substring(0, 1).toUpperCase() + item.title.substring(1) }}
					<em style="font-size: x-small; color: gray;">
						<span v-if="displayCount">{{ `${item.value.tagged_maps} image${item.value.tagged_maps > 1 ? 's' : ''}` }}</span>
					</em>
				</template>
			</v-list-item>
		</template>
	</v-autocomplete>
</template>

<script>
export default {
	props: [ 
		"selections", 
		"color", 
		"label", 
		"icon", 
		"items", 
		"displayCount", 
		"simpleDisplay",
		"single" 
	],
	computed: {
		model: {
			get() { return this.selections; },
			set(v) {
				console.log(v);
				this.$emit("update:selections", v);
			}
		}
	}
}
</script>

<style>

</style>