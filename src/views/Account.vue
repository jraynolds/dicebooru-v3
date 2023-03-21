<template>
	<ImageUpload />

	<MapPopup :open="popupOpen" @update:open="popupOpen = $event" :map="popupMap" />
	
	<v-container style="min-height: 100%;" class="justify-center align-center d-flex flex-wrap">

		<v-row class="justify-center align-center d-flex flex-column">
			<v-col class="px-12">
				<UserCard />
			</v-col>

			<v-col class="px-12">
				<v-card>
					<v-tabs 
						v-model="rollTab" 
						bg-color="primary" 
						class="d-flex justify-space-between"
						:disabled="dataStore.isLoading"
					>
						<v-tab :value="tabs[0].value">{{ tabs[0].title }}</v-tab>
						<v-tab :value="tabs[1].value">{{ tabs[1].title }}</v-tab>
						<v-tab :value="tabs[2].value" disabled>{{ tabs[2].title }}</v-tab>
					</v-tabs>
				</v-card>

				<v-card-text>
					<v-window v-model="rollTab">
						<v-window-item v-for="tab in tabs" :key="tab.title" :value="tab.value">
							<MapRoll
								:showCount="true"
								:infiniteScroll="true"
								:inactive="rollTab != tab.value"
								@mapClick="selectMap($event)"
							/>
						</v-window-item>
					</v-window>
				</v-card-text>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { ref } from 'vue';

import ImageUpload from '@/components/images/ImageUpload.vue';
import MapPopup from '@/components/images/MapPopup.vue';
import UserCard from '@/components/account/UserCard.vue';
import MapRoll from '@/components/images/MapRoll.vue';

import { useAuthStore } from '@/stores/auth';
import { useDataStore } from '@/stores/data';
import { useFiltersStore } from '@/stores/filters';

const tabs = [
	{
		title: "Uploaded",
		value: "uploaded"
	},
	{
		title: "Rated maps",
		value: "rated",
	},
	{
		title: "Your maps",
		value: "authored"
	}
];

export default {
	components: { ImageUpload, MapPopup, UserCard, MapRoll },

	watch: {
		rollTab(val) {
			this.filtersStore.clearFilters();
			if (val == 'uploaded') this.filtersStore.setUploader(this.dataStore.getUserProfile.id);
			else if (val == 'rated') this.filtersStore.setRatedBy(this.dataStore.getUserProfile.id);
			else if (val == 'authored') this.filtersStore.setAuthor(this.dataStore.getUserProfile.author.id);
			this.dataStore.newMapQuery();
		}
	},

	methods: {
		selectMap(map) {
			this.popupMap = map;
			this.popupOpen = true;
		}
	},

	mounted() {
		this.$nextTick(() => {
			this.filtersStore.setUploader(this.dataStore.getUserProfile.id);
			console.log(this.dataStore.getUserProfile.id);
			console.log(this.filtersStore.uploader);
			this.dataStore.newMapQuery();
		});
	},

	setup() {
		const authStore = useAuthStore();
		const dataStore = useDataStore();
		const filtersStore = useFiltersStore();

		const popupOpen = ref(false);
		const popupMap = ref(null);

		const scrollStop = ref(null);

		const rollTab = ref("uploaded");

		return {
			authStore,
			dataStore,
			filtersStore,

			popupOpen,
			popupMap,

			scrollStop,
			
			rollTab,
			tabs
		}
	}
}
</script>

<style>
.v-slide-group__content {
	display: flex;
	justify-content: space-evenly;
}
</style>