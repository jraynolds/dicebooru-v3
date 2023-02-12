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
							v-model:valid="loginValid" 
							v-model:email="loginEmail" 
							v-model:password="loginPassword" 
						/>
					</v-window-item>

					<v-window-item value="signup" :disabled="processing">
						<SignupTab
							v-model:valid="signupValid" 
							v-model:email="signupEmail" 
							v-model:password="signupPassword" 
						/>
					</v-window-item>
				</v-window>

				<v-card-actions>
					<v-card-text class="text-red" v-if="errorReadout">{{ errorReadout }}</v-card-text>

					<v-spacer />

					<v-btn 
						color="primary" 
						variant="flat" 
						:disabled="!submitReady || processing" 
						@click="submit"
					>
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
import { useVisualsStore } from '@/stores/visuals';
import supabase from "@/plugins/supabase"
import { ref } from 'vue'
import LoginTab from '@/components/loginpanel/LoginTab.vue';
import SignupTab from '@/components/loginpanel/SignupTab.vue';
import DEBUGS from '@/plugins/debug';

export default {
	data: () => ({
		errorReadouts: {
			"Email not confirmed": "Please confirm your account by following the instructions sent to this account's email address."
		}
	}),

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
		},
		errorReadout() {
			if (!this.error || !this.error.message) return null;
			if (Object.keys(this.errorReadouts).includes(this.error.message)) { 
				return this.errorReadouts[this.error.message];
			}
			else return "Unspecified error."
		}
	},

	watch: {
		tab() { this.error = null; }
	},

	methods: {
		submit() {
			if (this.tab == "login") this.login();
			else if (this.tab == "signup") this.signup();
		},
		async login() {
			if (DEBUGS.auth) console.log(`Attempting to log in with email ${this.loginEmail} and password ${this.loginPassword}.`);
			this.processing = true;
			const { data, error } = await supabase.auth.signInWithPassword({
				email: this.loginEmail,
				password: this.loginPassword
			});
			if (DEBUGS.auth) {
				if (data?.user) {
					console.log("Successfully logged in!");
					console.log(data);
				}
				if (error) {
					console.log("Couldn't log in. The error:");
					console.log(error);
					this.error = error;
				}
			}
			if (data.user) {
				this.open = false;
				this.visualsStore.showDialog("Successfully logged in!");
			}
			if (error) {
				this.error = error;
			}
			this.processing = false;

			this.authStore.loadCurrentSession();
		},
		async signup() {
			if (DEBUGS.auth) console.log(`Attempting to sign up with email ${this.signupEmail} and password ${this.signupPassword}.`);
			this.processing = true;
			const { data, error } = await supabase.auth.signUp({
				email: this.signupEmail,
				password: this.signupPassword
			});
			if (DEBUGS.auth) {
				if (data?.user) {
					console.log("Successfully signed up!");
					console.log(data);
				}
				if (error) {
					console.log("Couldn't sign up. The error:");
					console.log(error);
				}
			}
			if (data.user) {
				this.open = false;
				this.visualsStore.showDialog("Successfully signed up! Please activate your account by following the instructions sent to your email account.");
			}
			if (error) {
				this.error = error;
			}
			this.processing = false;

			this.authStore.loadCurrentSession();
		}
	},

	setup() {
		const authStore = useAuthStore();
		const visualsStore = useVisualsStore();
		
		const tab = ref("login");
		const processing = ref(false);
		const error = ref("");
		
		const loginValid = ref(false);
		const loginEmail = ref("");
		const loginPassword = ref("");

		const signupValid = ref(false);
		const signupEmail = ref("");
		const signupPassword = ref("");

		const overrideText = ref("");

		return {
			authStore,
			visualsStore,

			tab,
			processing,
			error,
			loginValid,
			loginEmail,
			loginPassword,
			signupValid,
			signupEmail,
			signupPassword,
			overrideText
		}
	}
}
</script>

<style>

</style>