<template>
	<div class="text-center">
		<v-dialog
			v-model="dialog"
			width="500"
		>
			<template v-slot:activator="{ props }">
				<v-btn
					color="primary"
					v-bind="props"
					size="20px"
					icon=""
					variant="flat"
				>
					<v-icon size="15px">mdi-help</v-icon>
				</v-btn>
			</template>

			<v-card>
				<v-card-title class="header bg-primary">Info</v-card-title>
				<v-card-text>
					Dicebooru uses maps sourced and tagged from user uploads. As a result, some maps may be improperly tagged or attributed.
				</v-card-text>
				<v-card-text>
					Try using the search bar on the left to look for specific maps that meet your needs!
				</v-card-text>
				<v-card-text>
					<i>Some of these maps represent artists' livelihoods. Artists can choose between levels of restriction for their images, including <v-icon>mdi-lock</v-icon><b>restricted</b>, which disallows viewing the high resolution for a map. Clicking a restricted map will instead send you to the artist's website, or to a specific page to purchase that map.</i>
				</v-card-text>
				<v-card-actions>
					<v-btn color="primary" block @click="dialog = false">Close Dialog</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { ref } from 'vue';

export default {
	setup () {
		const dialog = ref(false);

		return {
			dialog,
		}
	},
}
</script>

<style>

</style>