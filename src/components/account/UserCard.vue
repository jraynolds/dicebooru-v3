<template>
	<v-col class="pa-0 ma-0 pr-4" style="overflow: hidden;">
		<v-row class="pa-0 pt-4 pl-6 ma-0 flex-column" style="height: 100%;">
			<v-card>
				<v-card-title class="bg-primary" style="height: 90px;">
					<v-row class="align-center justify-center">
						<v-col class="mb-2 d-flex align-center text-h4">
							{{ toUpperCase(userTitle) }}
						</v-col>
						<v-col class="flex-grow-0 text-body-2">
							<v-row class="flex-column py-2">
								<v-col class="mb-0 pb-0 d-flex align-center" v-if="!dataStore.getUserAuthor">
									<v-icon class="mr-2">mdi-account</v-icon>
									You're registered as a normal user.
								</v-col>
								<v-col class="mb-0 pb-0 d-flex align-center" v-else>
									<v-icon class="mr-2">mdi-account</v-icon>
									You're registered as an author.
								</v-col>
								<v-col class="pt-0 mt-0" v-if="!dataStore.getUserAuthor">
									<v-btn variant="text">Register as a map creator</v-btn>
								</v-col>	
							</v-row>
						</v-col>
					</v-row>
				</v-card-title>
			</v-card>

			<v-list style="width: 100%;">
				<v-list-item>
					<template v-slot:prepend>
						<v-icon class="mr-4">mdi-upload</v-icon>
					</template>
					<v-row class="pa-0 ma-0">
						You've uploaded {{ dataStore.getUserProfile.num_maps_uploaded }} maps with an average rating of 
						<StarRating
							class="ml-2" 
							:rating="dataStore.getUserProfile.avg_rating"
							:read-only="true"
							:star-size="20"
							:increment=".5"
							:show-rating="false"
						/>
						.
					</v-row>
				</v-list-item>
				
				<v-list-item v-if="dataStore.getUserAuthor" class="bg-grey-lighten-4">
					<template v-slot:prepend>
						<v-icon class="mr-4">mdi-brush</v-icon>
					</template>
					<v-row class="pa-0 ma-0">
						You've created {{ dataStore.getUserAuthor.num_maps_authored }} maps with an average rating of 
						<StarRating
							class="ml-2" 
							:rating="dataStore.getUserAuthor.avg_rating"
							:read-only="true"
							:star-size="20"
							:increment=".5"
							:show-rating="false"
						/>
						.
					</v-row>
				</v-list-item>
				
				<v-list-item v-if="dataStore.getUserAuthor">
					<template v-slot:prepend>
						<v-icon class="mr-4">mdi-earth</v-icon>
					</template>
					<v-list-item-title>
						Your website is: 
						<v-text-field 
							class="mt-2"
							:label="`enter a URL.`"
							v-model="website" 
							variant="outlined"
							density="compact"
						/>
					</v-list-item-title>
					<v-row class="pa-0 ma-0 align-center">
					</v-row>
					<v-list-item-subtitle style="height: 35px;">
						This is the default site users will be sent to when they click on one of your maps, if it's not available for free. Per-map settings override this.
					</v-list-item-subtitle>
				</v-list-item>				
				
				<v-list-item v-if="dataStore.getUserAuthor" class="bg-grey-lighten-4">
					<template v-slot:prepend>
						<v-icon class="mr-4">mdi-lock</v-icon>
					</template>
					<v-list-item-title>
						The default restriction level for maps you create is:
						<SecurityLevelDropdown v-model:selection="securityLevelIndex" />
					</v-list-item-title>
					<v-row class="pa-0 ma-0 align-center">
					</v-row>
					<v-list-item-subtitle style="height: 35px;">
						This is the default restriction setting for your maps. Per-map settings override this. Non-free maps can't be seen at full resolution.
					</v-list-item-subtitle>
				</v-list-item>
			</v-list>

			<v-spacer />

			<v-btn color="primary" size="large" :disabled="updatingAuthorSettings" class="mb-1" @click="updatePreferences">
				Update preferences
				<v-progress-circular 
					v-show="updatingAuthorSettings" 
					indeterminate 
					size="small" 
					class="ml-2" 
				/>
			</v-btn>

		</v-row>
	</v-col>
</template>

<script>
import { ref } from "vue"

import { useAuthStore } from "@/stores/auth"
import { useDataStore } from "@/stores/data"
import { toUpperCase } from "@/scripts/extensions"

import StarRating from "vue-star-rating"
import SecurityLevelDropdown from "@/components/account/SecurityLevelDropdown.vue"

export default {
	components: {
    StarRating,
    SecurityLevelDropdown
},

	computed: {
		userTitle() { 
			return this.dataStore.getUserAuthor?.name || this.authStore.getUser.email || 'unknown';
		},
	},

	methods: {
		async updatePreferences() {
			this.updatingAuthorSettings = true;

			await this.dataStore.updateAuthorSettings(this.dataStore.getUserAuthor.id, this.website, this.securityLevelIndex);
			this.$emit('updateFinished');

			this.updatingAuthorSettings = false;
		}
	},

	mounted() {
		if (this.dataStore.getUserAuthor) {
			this.$nextTick(() => {
				this.website = this.dataStore.getUserAuthor.website || '';
				this.securityLevelIndex = this.dataStore.getUserAuthor.default_security_level.id - 1 || 0;
			});
		}
	},

	setup() {
		const authStore = useAuthStore();
		const dataStore = useDataStore();

		const website = ref('');
		const securityLevelIndex = ref(1);

		const updatingAuthorSettings = ref(false);

		return {
			authStore,
			dataStore,
			toUpperCase,

			website,

			securityLevelIndex,

			updatingAuthorSettings
		}
	}
}
</script>

<style>
.v-list-item__content {
	width: 100%;
}

.v-list-item-subtitle {
	-webkit-line-clamp: unset !important;
}
</style>