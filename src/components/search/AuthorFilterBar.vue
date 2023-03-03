<template>
	<v-autocomplete 
		v-model="model"
		:items="items"
		:label="label" 
		:prepend-icon="icon"
		:color="color"
		clearable
		item-title="name"
		return-object
	>
		<template v-slot:selection="{ props, item }">
			<span
				v-bind="props"
			>
				{{ toUpperCase(item.raw.name) }}
			</span>
		</template>
	</v-autocomplete>
</template>

<script>
import { toUpperCase } from "@/scripts/extensions"

export default {
	props: [ "selection", "color", "label", "icon", "items", "displayCount" ],

	computed: {
		model: {
			get() { return this.selection; },
			set(v) {
				console.log(v);
				this.$emit("update:selection", v);
			}
		}
	},

	setup() {

		return {
			toUpperCase
		}
	}
}
</script>

<style>

</style>