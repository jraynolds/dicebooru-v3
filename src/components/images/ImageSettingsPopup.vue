<template>
	<v-dialog 
		v-model="isOpen"
		width="auto"
		:persistent="updatingImageSettings"
	>
		<v-card>
			<v-card-title class="bg-primary">
				Change settings for this map
			</v-card-title>
			<v-card-text>
				These settings will override the settings you've chosen on your 
				<v-btn variant="text" to="/account"><v-icon>mdi-account</v-icon>Account</v-btn> page.
			</v-card-text>

			<v-list>
				<v-list-item>
					<template v-slot:prepend>
						<v-icon class="mr-4">mdi-earth</v-icon>
					</template>
					<v-list-item-title>
						The web address this map redirects to is: 
						<v-text-field 
							class="mt-2"
							:label="`enter a URL.`"
							v-model="websiteURL" 
							variant="outlined"
							density="compact"
						/>
					</v-list-item-title>
					<v-row class="pa-0 ma-0 align-center">
					</v-row>
					<v-list-item-subtitle>
						A map only redirects on click if it's not available for free.
					</v-list-item-subtitle>
				</v-list-item>				
				
				<v-list-item>
					<template v-slot:prepend>
						<v-icon class="mr-4">mdi-lock</v-icon>
					</template>
					<v-list-item-title>
						The specific restriction level for this map is:
						<SecurityLevelDropdown v-model:selection="securityLevelIndex" />
					</v-list-item-title>
					<v-row class="pa-0 ma-0 align-center">
					</v-row>
					<v-list-item-subtitle style="height: 35px;">
						This is the default restriction setting for your maps. Per-map settings override this. Non-free maps can't be seen at full resolution.
					</v-list-item-subtitle>
				</v-list-item>
			</v-list>

			<v-card-actions>
				<v-spacer />
				<v-btn 
					color="primary" 
					@click="updateSettings" 
					:disabled="(!websiteURL && !securityLevelIndex) || updatingImageSettings"
					size="large"
				>
					Update
					<v-progress-circular v-if="updatingImageSettings" indeterminate size="small" />
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import { ref } from 'vue'
import { useDataStore } from '@/stores/data';

import SecurityLevelDropdown from "@/components/account/SecurityLevelDropdown.vue"

export default {
	props: [ "open", "map" ],

	components: { SecurityLevelDropdown },

	computed: {
		isOpen: {
			get() { return this.open; },
			set(val) { this.$emit('update:open', val); }
		}
	},

	methods: {
		async updateSettings() {
			if (this.updatingImageSettings) return;
			this.updatingImageSettings = true;

			const { data, error } = await this.dataStore.updateMap(this.map, this.websiteURL, this.securityLevelIndex);
			this.updatingImageSettings = false;
			this.isOpen = false;
			
			if (data) this.$emit('settingsUpdated');
			if (error) this.$emit('error');
		}
	},

	mounted() {
		this.$nextTick(() => {
			this.websiteURL = this.map.purchase_link || this.dataStore.getUserAuthor.website;
			this.securityLevelIndex = this.map.security_level || this.dataStore.getUserAuthor.default_security_level || 1;
		});
	},
	
	setup() {
		const websiteURL = ref(null);
		const securityLevelIndex = ref(null);

		const dataStore = useDataStore();

		const updatingImageSettings = ref(false);

		return {
			websiteURL,
			securityLevelIndex,

			dataStore,

			updatingImageSettings
		}
	}
}
</script>

<style>

</style>