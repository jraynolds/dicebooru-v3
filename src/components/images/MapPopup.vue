<template>
	<v-dialog 
		v-model="isOpen"
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
	props: [ "open", "map" ],

	components: { MapCard },

	computed: {
		isOpen: {
			get() { return this.open; },
			set(val) { this.$emit("update:open", val); }
		},
		author() { 
			return this.dataStore.getMapAuthor(this.map);
		}
	},

	methods: {
		imageClick() {
			if (this.map.purchase_link) this.openTab(this.map.purchase_link);
			else if (this.map.security_level > 1) {
				if (this.author.website) this.openTab(this.author.website);
				else return;
			} 
			else if (this.map.url) this.openTab(this.map.url);
			return;
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