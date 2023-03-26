<template>
	<v-snackbar v-model="successSnackbar">
		The map was successfully uploaded!
		<template v-slot:actions>
				<v-btn
					color="primary"
					variant="text"
					@click="successSnackbar = false"
				>
					Close
				</v-btn>
			</template>
	</v-snackbar>
	<v-snackbar v-model="errorSnackbar">
		{{ errorMessage }}
		<template v-slot:actions>
				<v-btn
					color="primary"
					variant="text"
					@click="errorSnackbar = false"
				>
					Close
				</v-btn>
			</template>
	</v-snackbar>

	<v-dialog
		v-model="open"
		width="600"
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
					style="position: fixed; right: 20px; bottom: 20px;"
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
					style="position: fixed; right: 20px; bottom: 20px;"
					@click.stop="authStore.setLoginPanelOpen(true)"
					v-else
				>
					<v-icon>mdi-image-plus</v-icon>
				</v-btn>
			</v-fab-transition>
		</template>

		<v-card class="uploadCard px-4">
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
					/>
				</v-col>

				<v-col class="flex-0 ma-0 pa-0">
					<v-autocomplete
						class="px-4"
						bg-color="primary"
						prepend-inner-icon="mdi-account"
						:items="dataStore.getAuthors"
						v-model="uploadAuthor"
						label="Made by this author:"
						item-title="name"
						return-object
					/>
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
					/>
				</v-col>
			</v-row>

			<v-card-actions>
				<v-spacer />

				<v-btn color="success" variant="flat" :disabled="!uploadable" @click="upload">
					<template v-slot:append v-if="uploadingMap">
						<v-progress-circular indeterminate size="small" />
					</template>
					Upload
				</v-btn>
			</v-card-actions>

		</v-card>
	</v-dialog>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useDataStore } from '@/stores/data';
import { ref } from 'vue';

import FoldableSearchBars from "@/components/search/FoldableSearchBars.vue"

export default {

	components: {
		FoldableSearchBars
	},

	computed: {
		uploadable() {
			if (this.uploadingMap) return false;
			return this.image != null;
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

			this.reset();
			this.dataStore.loadFilteredMaps();
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
		}
		// test(selections) {
		// 	this.uploadTags = selections;
		// }
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
		}
	},

	setup() {
		const authStore = useAuthStore();
		const dataStore = useDataStore();

		const open = ref(false);
		const uploadTags = ref([]);
		const uploadAuthor = ref(null);
		const storingImage = ref(false);
		const uploadingMap = ref(false);
		const imageArr = ref([]);
		const image = ref(null);
		const url = ref(null);

		const successSnackbar = ref(false);
		const errorSnackbar = ref(false);

		return {
			authStore,
			dataStore,

			open,
			uploadTags,
			uploadAuthor,
			storingImage,
			uploadingMap,
			imageArr,
			image,
			url,

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