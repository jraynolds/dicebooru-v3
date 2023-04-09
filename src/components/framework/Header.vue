<template>
	<v-app-bar
		app
		color="primary"
		dark
		style="font-size: larger;"
	>
		<v-row>
			<v-col class="flex-grow-0">
				<v-btn icon @click="toggleDarkMode">
					<v-icon>mdi-weather-night</v-icon>
				</v-btn>
			</v-col>
				
			<v-col class="text-center pl-8">
				<v-btn v-if="route.name == 'Gallery'" size="large" @click="reload">
					Dice<v-icon size="xx-large">mdi-dice-d20-outline</v-icon>Booru
				</v-btn>
			</v-col>
				
			<v-col class="text-right flex-grow-0">
				<v-btn icon v-if="route.name == 'Account'" @click="logout()">
					<v-icon>mdi-account-off-outline</v-icon>
				</v-btn>
				<LoginPanel v-model="authStore.loginPanelOpen" v-else-if="authStore.user == null" />
				<v-btn icon v-else-if="authStore.user != null" to="/account">
					<v-icon>mdi-account</v-icon>
				</v-btn>
			</v-col>
		</v-row>
	</v-app-bar>
</template>

<script>
import LoginPanel from "@/components/loginpanel/LoginPanel.vue";
import { useAuthStore } from '@/stores/auth';
import { useTheme } from 'vuetify';
import { useRouter, useRoute } from "vue-router";

export default {
	components: {
		LoginPanel
	},

	methods: {
		reload() {
			console.log(this.router);
			this.router.go();
		}
	},

	setup() {
		const authStore = useAuthStore();
		const vuetify = useTheme();
		const router = useRouter();
		const route = useRoute();

    return {
			authStore,
			router,
			route,
			toggleDarkMode: () => vuetify.global.name.value = vuetify.global.current.value.dark ? 'light' : 'dark'
    }
	}
}
</script>

<style>

</style>