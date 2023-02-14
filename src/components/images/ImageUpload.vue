<template>
	<v-dialog
		v-model="open"
		width="600"
	>
		<template v-slot:activator="{ on, attrs }">
			<v-fab-transition>
				<v-btn
					color="warning"
					fixed
					size="x-large"
					fab
					icon
					style="position: fixed; right: 20px; bottom: 20px;"
					v-bind="attrs"
					v-on="on"
					v-if="authStore.getUser"
				>
					<v-icon>mdi-image-plus</v-icon>
				</v-btn>
				<v-btn 
					color="grey"
					fixed
					size="x-large"
					fab
					icon
					style="position: fixed; right: 20px; bottom: 20px;"
					@click.stop="authStore.setLoginPanelOpen(true)"
					v-else
				>
					<v-icon>mdi-image-plus</v-icon>
				</v-btn>
			</v-fab-transition>
		</template>

		<v-card>
			<v-card-title class="text-h5 warning mb-2">
				Image Upload
			</v-card-title>
		</v-card>
	</v-dialog>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';

export default {

	setup() {
		const authStore = useAuthStore();
		const open = ref(false);

		return {
			authStore,

			open
		}
	}

}
</script>

<style>

</style>