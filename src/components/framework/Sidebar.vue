<template>
	<v-navigation-drawer
		v-model="searchDrawer"
		:rail="!drawerExpanded"
		temporary
		:scrim="false"
		rail-width="38"
		width="700"
		location="left"
		:class="searchDrawer ? 'overflowVisible expand' : 'overflowVisible' "
		floating
	>
	
		<v-row class="my-0 mt-1" style="height: 100%; overflow: visible; flex-wrap: nowrap;">
			<SearchSidebar v-if="route.name == 'Gallery'" @searchFinished="drawerExpanded = false" />
			
			<UserCard v-else-if="route.name == 'Account'" @updateFinished="drawerExpanded = false" />

			<v-col 
				class="d-flex align-center pa-0 ma-0 fill-height" 
				style="width: 50px; min-width: 50px; max-width: 50px; overflow: visible;"
			>
				<v-btn 
					fab 
					size="x-large" 
					icon 
					color="primary" 
					@click="drawerExpanded = !drawerExpanded"
					style="min-width: 65px;"
				>
					<v-icon size="x-large">
						{{ drawerExpanded ? popoutIcons[1] : popoutIcons[0] }}
					</v-icon>
				</v-btn>
			</v-col>
		</v-row>

	</v-navigation-drawer>
</template>

<script>
import { ref } from 'vue';
import { useFiltersStore } from '@/stores/filters'
import { useDataStore } from '@/stores/data'
import { useRouter, useRoute } from "vue-router";

import SearchSidebar from '@/components/images/SearchSidebar.vue';
import UserCard from '@/components/account/UserCard.vue';



export default {
	props: [ "popoutIcons" ],

  components: { SearchSidebar, UserCard },

	computed: {
		width() {
			return window.innerWidth * .25;
		},
		stars: {
			get() { return this.filtersStore.getMinRating; },
			set(val) {
				console.log(val);
				console.log(this.filtersStore.getMinRating);
				if (val == this.filtersStore.getMinRating) this.filtersStore.setMinRating(0);
				else this.filtersStore.setMinRating(val);
			}
		}
	},

	methods: {
		async search() {
			this.searching = true;
			await this.dataStore.newMapQuery();
			this.drawerExpanded = false;
			this.searching = false;
		}
	},

	setup() {
		const filtersStore = useFiltersStore();
		const dataStore = useDataStore();
		const router = useRouter();
		const route = useRoute();

		const searchDrawer = ref(true);
		const drawerExpanded = ref(false);
		
		const searching = ref(false);

		return {
			searchDrawer,
			drawerExpanded,

			filtersStore,
			dataStore,
			router,
			route,

			searching
		}
	}
}
</script>

<style>
.v-navigation-drawer.overflowVisible > .v-navigation-drawer__content {
	overflow: visible;
	height: 100%;
}
</style>