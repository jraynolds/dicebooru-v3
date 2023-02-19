<template>
	<v-dialog
		v-model="open"
		width="600"
	>
		<template v-slot:activator="{ props }">
			<v-fab-transition>
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

		<v-card class="uploadCard">
			<v-card-title class="header bg-primary">
				Image Upload
			</v-card-title>

			<v-img style="height: 100%; width: 100%;" :src="url" class="centered">
				<template v-slot:placeholder>
					<v-icon style="font-size: 10em; color: grey !important;">
						mdi-image-search-outline
					</v-icon>
				</template>
			</v-img>

			<v-file-input
				class="px-4"
				accept="image/*"
				label="Map image"
				v-model="imageArr"
				variant="underlined"
			/>
			
			<v-select
				class="px-4"
				bg-color="primary"
				prepend-inner-icon="mdi-account"
				:items="dataStore.getAuthors"
				v-model="uploadAuthor"
				label="Made by this author:"
			/>
			
			<SearchBar
				class="px-4"
				bg-color="primary"
				prepend-inner-icon="mdi-tag" 
				:items="dataStore.getTags"
				:selections="uploadTags"
				label="Map displays these tags:"
			/>

			<v-card-actions>
				<v-spacer />

				<v-btn color="success" variant="flat" :disabled="!uploadable">
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

import SearchBar from "@/components/search/SearchBar.vue"

export default {

	components: {
		SearchBar
	},

	computed: {
		uploadable() {
			return this.image != null;
		},
	},

	methods: {
		createURLFromFile(file) {
			return URL.createObjectURL(file);
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
			url
		}
	}

}
</script>

<style>
.uploadCard {
	display: grid !important;
	grid-template-rows: 50px 300px 80px 80px 80px;
	row-gap: 5px;
}

.v-img.centered .v-img__placeholder {
	display: flex; 
	align-items: center; 
	justify-content: center;
}
</style>