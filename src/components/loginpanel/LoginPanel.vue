<template>
	<div class="text-center">
		<v-dialog
			v-model="open"
			width="500"
			:persistent="processing"
		>
			<template v-slot:activator>
				<v-btn
					icon
					@click="open = true"
				>
					<v-icon>mdi-account-key-outline</v-icon>
				</v-btn>
			</template>

			<v-card>
				<v-tabs
					v-model="tab"
					fixed-tabs
					background-color="accent"
					color="primary"
				>
					<v-tab value="login" :disabled="processing">
						Login
					</v-tab>
					<v-tab value="signup" :disabled="processing">
						Sign Up
					</v-tab>
				</v-tabs>

				<v-window v-model="tab" class="pt-4" :disabled="processing">
					<v-window-item value="login" :disabled="processing">
						<LoginTab 
							@processing="setProcessing" 
							v-model:valid="loginValid" 
							v-model:email="loginEmail" 
							v-model:password="loginPassword" 
						/>
					</v-window-item>

					<v-window-item value="signup" :disabled="processing">
						<SignupTab 
							@processing="setProcessing" 
							v-model:valid="signupValid" 
							v-model:email="signupEmail" 
							v-model:password="signupPassword" 
						/>
					</v-window-item>
				</v-window>

				<v-card-actions>
					<v-card-text color="error" v-if="error">{{ error }}</v-card-text>

					<v-spacer />

					<v-btn color="primary" variant="flat" :disabled="!submitReady" @click="submit">
						<template v-slot:append v-if="processing">
							<v-progress-circular indeterminate size="small"/>
						</template>
						Submit
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue'
import LoginTab from '@/components/loginpanel/LoginTab.vue';
import SignupTab from '@/components/loginpanel/SignupTab.vue';

export default {
	components: { LoginTab, SignupTab },
	computed: {
		open: {
			get() { return this.authStore.loginPanelOpen; },
			set(val) { this.authStore.setLoginPanelOpen(val); }
		},
		submitReady() {
			if (this.tab == "login" && this.loginValid) return true;
			if (this.tab == "signup" && this.signupValid) return true;
			return false; 
		}
	},

	methods: {
		submit() {
			if (this.tab == "login") this.login();
			else if (this.tab == "signup") this.signup();
		},
		login() {
			this.processing = true;
			s
		}
	},

	setup() {
		const authStore = useAuthStore();
		const tab = ref("login");
		const processing = ref(false);
		const error = ref("");
		
		const loginValid = ref(false);
		const loginEmail = ref("");
		const loginPassword = ref("");

		const signupValid = ref(false);
		const signupEmail = ref("");
		const signupPassword = ref("");

		return {
			authStore,
			tab,
			processing,
			error,
			loginValid,
			loginEmail,
			loginPassword,
			signupValid,
			signupEmail,
			signupPassword,

			submit,
		}
	}
}
</script>

<style>

</style>