<template>
	<v-select
		density="compact"
		variant="outlined"
		:items="selectableSecurityLevels"
		item-title="title"
		item-value="value"
		v-model="securityLevelSelection"
		ref="securityLevelDropdown"
	>
		<template v-slot:selection="{ item }">
			<v-icon size="small" class="mr-1">{{ item.raw.icon }}</v-icon>
			{{  toUpperCase(item.raw.title) }}
		</template>
		<template v-slot:item="{ item, index }">
			<v-list-item @click="selectSecurityLevelIndex(index)">
				<v-list-item-title>
					<v-icon size="small" class="mr-1">{{ item.raw.icon }}</v-icon>
					{{ toUpperCase(item.raw.title) }}
				</v-list-item-title>
				<v-list-item-subtitle class="text-subtitle-2 text-grey-darken-2" style="font-style: italic;">
					{{ item.raw.description }}
				</v-list-item-subtitle>
			</v-list-item>
		</template>
	</v-select>
</template>

<script>
import { ref } from 'vue'
import { toUpperCase } from "@/scripts/extensions"
import { selectableSecurityLevels } from '@/scripts/security';

export default {
	props: [ "selection" ],

	computed: {
		securityLevelSelection: {
			get() { return this.selection; },
			set(val) { this.$emit('update:selection', val + 1); }
		}
	},

	methods: {
		selectSecurityLevelIndex(index) {
			console.log(index);
			this.securityLevelSelection = index;
			this.securityLevelDropdown.$el.focus();
			this.securityLevelDropdown.$el.blur();
		}
	},	

	setup() {
		const securityLevelDropdown = ref(null);

		return {
			toUpperCase,

			selectableSecurityLevels,
			securityLevelDropdown
		}
	}
}
</script>

<style>
</style>