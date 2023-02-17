<template>
	<v-dialog 
		v-model="open"
		width="auto"
	>
		<MapCard 
			:map="map" 
			width="80vw"
			height="80vh"
		/>
	</v-dialog>
</template>

<script>
import MapCard from "@/components/images/MapCard.vue";

export default {
	props: [ "isOpen", "map" ],

	components: { MapCard },

	computed: {
		open: {
			get() { return this.isOpen; },
			set(val) { this.$emit("update:isOpen", val); }
		}
	}
}
</script>

<style>

</style>