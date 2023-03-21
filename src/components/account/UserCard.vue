<template>
	<v-col class="pa-0 ma-0 pr-4" style="overflow: hidden;">
		<v-row class="px-4 pl-6 ma-0 flex-column" style="height: 100%;">
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
		</v-row>
	</v-col>

		
</template>

<script>
import { ref } from "vue"

import { useAuthStore } from "@/stores/auth"
import { useDataStore } from "@/stores/data"
import { toUpperCase } from "@/scripts/extensions"

import StarRating from "vue-star-rating"

const lockStates = [
	{
		title: "free",
		icon: "mdi-lock-open",
		description: "Free for non-commercial use.",
		value: 1,
	},
	{
		title: "locked",
		icon: "mdi-lock",
		description: "Maps can be bought on an external site.",
		value: 2,
	},
	{
		title: "forbidden",
		icon: "mdi-lock-off",
		description: "Maps can't be bought or used.",
		value: 3,
	},
];

export default {
	components: {
		StarRating
	},

	computed: {
		userTitle() { 
			return this.dataStore.getUserAuthor?.name || this.authStore.getUser.email;
		},
		lockState() {
			return this.lockStates[this.lockStateIndex];
		}
	},

	methods: {
		selectLockStateIndex(index) {
			this.lockStateIndex = index;
			this.lockStateDropdown.$el.focus();
			this.lockStateDropdown.blur();
		}
	},

	mounted() {
		if (this.dataStore.getUserAuthor) {
			this.$nextTick(() => {
				this.website = this.dataStore.getUserAuthor.website || '';
			});
		}
	},

	setup() {
		const authStore = useAuthStore();
		const dataStore = useDataStore();

		const website = ref('');

		const lockStateDropdown = ref(null);
		const lockStateIndex = ref(1);

		const updatingAuthorSettings = ref(false);

		return {
			authStore,
			dataStore,
			toUpperCase,

			website,

			lockStates,
			lockStateDropdown,
			lockStateIndex,

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