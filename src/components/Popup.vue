<template>
	<v-dialog width="500" v-model="show">
		<v-card>
			<v-card-text>
				{{ store.getDialogText }}
			</v-card-text>

			<v-card-actions>
				<v-spacer />
				
				<v-btn color="primary" @click="store.setDialogVisible(false)">
					Close
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import { useVisualsStore } from "@/stores/visuals"

export default {
	computed: {
		show: {
			get() { return this.store.isDialogVisible; },
			set(v) { this.store.setDialogVisible(v); }
		}
	},

	setup() {
		const store = useVisualsStore();

		return {
			store
		}
	}
}
</script>

<style>

</style>