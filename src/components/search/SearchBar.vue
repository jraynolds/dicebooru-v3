<template>
	<v-autocomplete 
		v-model="model"
		:items="items"
		:label="label" 
		:prepend-icon="icon"
		:color="color" 
		chips 
		multiple
		clearable
		hide-selected
		item-title="name"
		return-object
		name="includes"
	>
		<template v-slot:chip="{ props, item }">
			<v-chip
				v-bind="props"
				:prepend-icon="item.raw.type.icon"
				:text="item.raw.name"
				closable
			/>
		</template>
		<template v-slot:item="{ props, item }">
			<v-list-item
				v-bind="props"
				:prepend-icon="item?.raw?.type?.icon"
				:subtitle="item?.raw?.type?.name"
			>
				<template v-slot:title>
					{{ item.title.substring(0, 1).toUpperCase() + item.title.substring(1) }}
					<em style="font-size: x-small; color: gray;">
						{{ `${item.value.num_maps} image${item.value.num_maps > 1 ? 's' : ''}` }}
					</em>
				</template>
			</v-list-item>
		</template>
	</v-autocomplete>
</template>

<script>
import { ref } from 'vue';

export default {
	props: [ "selections", "color", "label", "icon", "items"],
	computed: {
		model: {
			get() { return this.selections; },
			set(v) { 
				console.log(`emitting ${v}`);
				console.log(v);
				this.$emit("changeSelections", v);
				console.log(this.selections);
			}
		}
	},
	setup() {
		const localSelections = ref([]);

		return {
			localSelections
		}
	}
}
</script>

<style>

</style>