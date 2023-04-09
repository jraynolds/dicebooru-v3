<template>
	<v-snackbar v-model="visible">
		{{ visualsStore.snackbarMessage }}
		<template v-slot:actions>
				<v-btn
					color="white"
					variant="text"
					@click="visible = false"
				>
					{{ visualsStore.snackbarButtonMessage }}
				</v-btn>
			</template>
	</v-snackbar>
</template>

<script>
import { useVisualsStore } from '@/stores/visuals';

export default {
	computed: {
		visible: {
			get() { return this.visualsStore.snackbarVisible; },
			set(val) { this.visualsStore.snackbarVisible = val; }
		}
	},
	setup() {
		const visualsStore = useVisualsStore();

		return {
			visualsStore
		}
	}

}
</script>

<style></style>