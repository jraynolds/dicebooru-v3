<template>
	<v-snackbar v-model="successSnackbar" dark>
		The map was successfully uploaded!
		<template v-slot:actions>
				<v-btn
					color="white"
					variant="text"
					@click="successSnackbar = false"
				>
					Close
				</v-btn>
			</template>
	</v-snackbar>
	<v-snackbar v-model="errorSnackbar" dark>
		{{ errorMessage }}
		<template v-slot:actions>
				<v-btn
					color="white"
					variant="text"
					@click="errorSnackbar = false"
				>
					Close
				</v-btn>
			</template>
	</v-snackbar>

	<v-dialog
		v-model="open"
		width="60vw"
		:persistent="uploadingMap"
	>
		<template v-slot:activator="{ props }">
			<v-fab-transition style="z-index: 100">
				<v-btn
					color="warning"
					fixed
					size="x-large"
					fab
					icon
					style="position: fixed; right: 20px; bottom: 40px;"
					v-bind="props"
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
					style="position: fixed; right: 20px; bottom: 40px;"
					@click.stop="authStore.setLoginPanelOpen(true)"
					v-else
				>
					<v-icon>mdi-image-plus</v-icon>
				</v-btn>
			</v-fab-transition>
		</template>

		<v-card class="uploadCard px-4">
			<v-form :disabled="uploadingMap">
				<v-card-title class="header bg-primary mx-n4">
					Map Upload
				</v-card-title>

				<v-row class="flex-column">
					<v-col class="flex-0" style="max-height: 40vh">
						<v-img :src="url" class="centered">
							<template v-slot:placeholder>
								<v-icon style="font-size: 10em; color: grey !important;">
									mdi-image-search-outline
								</v-icon>
							</template>
						</v-img>
					</v-col>

					<v-col class="flex-0 ma-0 pa-0">
						<v-file-input
							class="px-4"
							accept="image/*"
							label="Map image"
							v-model="imageArr"
							variant="underlined"
							:rules="imageRules"
						/>
					</v-col>

					<v-col class="flex-0 ma-0 pa-0">
						<v-combobox
							class="px-4"
							bg-color="primary"
							prepend-inner-icon="mdi-account"
							:items="dataStore.getAuthors"
							v-model="uploadAuthor"
							label="Made by this author:"
							item-title="name"
							return-object
							clearable
						>
							<template v-slot:selection="{ props, item }">
								<span v-bind="props">
									{{ toUpperCase(item?.raw?.name || item.raw) }}
								</span>
							</template>
							<template v-slot:item="{ props, item }">
								<v-list-item v-bind="props">
									<template v-slot:title>
										{{ toUpperCase(item.title) }}
									</template>
								</v-list-item>
							</template>
						</v-combobox>
					</v-col>
				
					<v-col class="flex-1 ma-0 pa-0">
						<FoldableSearchBars 
							class="pt-1 mx-4 mb-4"
							color="primary"
							icon="mdi-tag"
							title="Map displays these tags:"
							:items="dataStore.getTags.filter(t => !uploadTags.includes(t))"
							:selections="uploadTags"
							@update:selections="uploadTags = $event"
							:addGivens="true"
						/>
					</v-col>
				</v-row>

				<v-card-actions class="d-flex flex-row">
					<!-- <v-row> -->
						<!-- <v-col class="ma-0 pa-0 d-flex flex-row flex-grow-0 align-center justify-center">
							<v-checkbox 
								v-model="guidelinesRead" 
								:rules="[ value => value ]" 
								disabled 
							/> -->
						<!-- </v-col> -->
						<!-- <v-col class="flex-grow-0"> -->
							<GuidelinesPanel v-model:understood="guidelinesRead" />
						<!-- </v-col> -->
					<!-- </v-row> -->

					<v-spacer />

					<v-btn color="success" variant="flat" :disabled="!uploadable" @click="upload">
						<template v-slot:append v-if="uploadingMap">
							<v-progress-circular indeterminate size="small" />
						</template>
						Upload
					</v-btn>
				</v-card-actions>
			</v-form>

		</v-card>
	</v-dialog>
</template>

<script>
import { toUpperCase } from "@/scripts/extensions"
import { useAuthStore } from '@/stores/auth';
import { useFiltersStore } from '@/stores/filters';
import { useDataStore } from '@/stores/data';
import { ref } from 'vue';

import FoldableSearchBars from "@/components/search/FoldableSearchBars.vue"
import GuidelinesPanel from "@/components/GuidelinesPanel.vue"

const maxMapSize = 20 * 1000 * 1000; // 20 MB
const imageRules = [
	value => {
		if (!value || !value.length) return 'Must upload an image.';
		return true;
	},
	value => {
		if (value[0].size > maxMapSize) return 'Map must be less than 20 MB in size.'
		return true;
	},
]

export default {

	components: {
		FoldableSearchBars,
		GuidelinesPanel
	},

	computed: {
		uploadable() {
			if (!this.guidelinesRead) return false;
			if (this.uploadingMap) return false;
			return this.image != null && this.image.size < maxMapSize;
		},
		errorMessage() {
			return this.error;
		}
	},

	methods: {
		createURLFromFile(file) {
			return URL.createObjectURL(file);
		},
		async upload() {
			this.uploadingMap = true;
			const { data, error } = await this.dataStore.uploadMap(this.image, this.uploadAuthor, this.uploadTags);
			if (error) this.errorSnackbar = true;
			else this.successSnackbar = true;

			if (!error) {
				this.reset();
				this.filtersStore.clearFilters();
				this.dataStore.reloadMaps();
			}
		},
		reset() {
			this.open = false;
			this.uploadTags = [];
			this.uploadAuthor = null;
			this.storingImage = false;
			this.uploadingMap = false;
			this.imageArr = [];
			this.image = null;
			this.url = null;
			this.guidelinesRead = false;
		},
		leaveWarning(e) {
			const confirmationMessage = 'Uploading is in progress. Are you sure you want to leave?';
			e.returnValue = confirmationMessage;
			return confirmationMessage;
		}
	},

	watch: {
		imageArr(arr) {
			if (!arr[0]) 
			{
				this.url = null;
				this.image = null;
				return;
			}
			this.image = arr[0];
			this.url = this.createURLFromFile(arr[0]);
		},
		uploadingMap(uploading) {
			if (uploading) window.addEventListener('beforeunload', this.leaveWarning);
			else window.removeEventListener('beforeunload', this.leaveWarning);
		}
	},

	setup() {
		const authStore = useAuthStore();
		const filtersStore = useFiltersStore();
		const dataStore = useDataStore();

		const open = ref(false);
		const uploadTags = ref([]);
		const uploadAuthor = ref(null);
		const storingImage = ref(false);
		const uploadingMap = ref(false);
		const imageArr = ref([]);
		const image = ref(null);
		const url = ref(null);
		const guidelinesRead = ref(false);

		const successSnackbar = ref(false);
		const errorSnackbar = ref(false);

		return {
			toUpperCase,
			filtersStore,
			authStore,
			dataStore,

			imageRules,

			open,
			uploadTags,
			uploadAuthor,
			storingImage,
			uploadingMap,
			imageArr,
			image,
			url,
			guidelinesRead,

			successSnackbar,
			errorSnackbar
		}
	}

}
</script>

<style>
.v-img.centered .v-img__placeholder {
	display: flex; 
	align-items: center; 
	justify-content: center;
}
</style>