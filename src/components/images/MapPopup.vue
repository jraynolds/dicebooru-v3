<template>
	<v-dialog 
		v-model="open"
		width="auto"
	>
		<MapCard 
			:map="map" 
			width="80vw"
			height="80vh"
			@imageClick="imageClick"
			:large="true"
		/>
	</v-dialog>
</template>

<script>
import { useDataStore } from '@/stores/data';

import MapCard from "@/components/images/MapCard.vue";

export default {
	props: [ "isOpen", "map" ],

	components: { MapCard },

	computed: {
		open: {
			get() { return this.isOpen; },
			set(val) { this.$emit("update:isOpen", val); }
		}
	},

	methods: {
		imageClick() {
			if (this.map.purchase_link) this.openTab(this.map.purchase_link);
			else if (this.map.security_level > 1) this.openTab(this.map.author.website);
			else this.openTab(this.map.url);
		},
		openTab(url) {
			window.open(url, "_blank");
		}
	},

	watch: {
		map(val) {
			if (val) {
				if (!this.map.url) this.dataStore.loadURL(this.map.id);
			}
		}
	},
	
	setup() {
		const dataStore = useDataStore();

		return {
			dataStore
		}
	}
}
</script>

<style>

</style>