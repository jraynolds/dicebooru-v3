<template>
	<v-card>
		<v-card-title class="bg-primary" style="height: 90px;">
			<v-row class="align-center">
				<v-col class="mb-2">
					{{ toUpperCase(userTitle) }}
				</v-col>
				<v-col class="flex-grow-0 text-body-2">
					<v-row class="flex-column py-2">
						<v-col class="mb-0 pb-0 d-flex align-center">
							<v-icon class="mr-2">mdi-account</v-icon>
							You're registered as a normal user.
						</v-col>
						<v-col class="pt-0 mt-0">
							<v-btn variant="text">Register as a map creator</v-btn>
						</v-col>	
					</v-row>
				</v-col>
			</v-row>
		</v-card-title>

		<v-row class="mx-0 flex-column mb-0">
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
				
				<v-list-item v-if="dataStore.getUserAuthor">
					<template v-slot:prepend>
						<v-icon class="mr-4">mdi-brush</v-icon>
					</template>
					<v-row class="pa-0 ma-0">
						You've created {{ dataStore.getUserAuthor.num_maps_authored }} maps with an average rating of 
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
			</v-list>
		</v-row>
	</v-card>
</template>

<script>
import { useAuthStore } from "@/stores/auth"
import { useDataStore } from "@/stores/data"
import { toUpperCase } from "@/scripts/extensions"

import StarRating from "vue-star-rating"

export default {
	components: {
		StarRating
	},

	computed: {
		userTitle() { 
			return this.dataStore.getUserAuthor?.name || this.authStore.getUser.email;
		}
	},

	setup() {
		const authStore = useAuthStore();
		const dataStore = useDataStore();

		return {
			authStore,
			dataStore,
			toUpperCase
		}
	}
}
</script>

<style>
.v-list-item__content {
	width: 100%;
}
</style>