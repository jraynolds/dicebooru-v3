<template>
	<v-card flat>
		<v-form v-model="isValid" class="px-4">
			<v-col class="flex-grow-1" cols="12">
				<v-text-field 
					label="email" 
					:rules="emailRules" 
					v-model="localEmail" 
					required
					prepend-icon="mdi-email"
					:color="emailMatch ? 'success' : 'error'"
				/>
			</v-col>

			<v-col class="flex-grow-1" cols="12">
				<v-text-field 
					label="password" 
					:rules="passwordRules" 
					v-model="localPassword" 
					required
					prepend-icon="mdi-key"
					:color="passwordMatch ? 'success' : 'error'"
					:type="passwordVisible ? '' : 'password'"
				>
					<template v-slot:append>
						<v-btn 
							icon="mdi-eye"
							@click.stop="passwordVisible = !passwordVisible" 
							class="mt-n2"
							:style="passwordVisible ? { opacity: 1 } : { opacity: .5 }"
						/>
					</template>
				</v-text-field>
			</v-col>

			<v-col class="flex-grow-1" cols="12">
				<v-text-field 
					label="confirm password" 
					:rules="passwordConfirmRules" 
					v-model="passwordConfirm" 
					required
					prepend-icon="mdi-key-change"
					:color="passwordConfirmMatch ? 'success' : 'error'"
					:type="passwordConfirmVisible ? '' : 'password'"
				>
					<template v-slot:append>
						<v-btn 
							icon="mdi-eye"
							@click.stop="passwordConfirmVisible = !passwordConfirmVisible" 
							class="mt-n2"
							:style="passwordConfirmVisible ? { opacity: 1 } : { opacity: .5 }"
						/>
					</template>
				</v-text-field>
			</v-col>
		</v-form>
	</v-card>
</template>

<script>
import { ref } from 'vue';

export default {
	props: [ "valid", "email", "password" ],
	computed: {
		isValid: {
			get() { return this.valid; },
			set(val) { this.$emit('update:valid', val); }
		},
		localEmail: {
			get() { return this.email; },
			set(val) { this.$emit('update:email', val); }
		},
		localPassword: {
			get() { return this.password; },
			set(val) { this.$emit('update:password', val); }
		},

		emailMatch() {
			for (let rule of this.emailRules) if (!rule(this.localEmail)) return false;
			return true;
		},
		passwordMatch() {
			for (let rule of this.passwordRules) if (!rule(this.localPassword)) return false;
			return true;
		},
		passwordConfirmRules() {	
			return [
				v => !!v || 'Password confirmation required',
				v => v == this.localPassword || 'Must match password'
			]
		},
		passwordConfirmMatch() {
			for (let rule of this.passwordConfirmRules) {
				if (!rule(this.passwordConfirm)) return false;
			}
			return true;
		}
	},
	
	setup() {
		const emailRules = [
			v => !!v || 'email required',
			v => /.+@.+/.test(v) || 'email must be valid',
		];
		const passwordVisible = ref(false);
		const passwordRules = [
			v => !!v || 'Password required',
			v => v.length < 100 || 'Password must be fewer than 100 characters',
			v => v.length > 6 || 'Password must be longer than 6 characters',
		];
		const passwordConfirm = ref('');
		const passwordConfirmVisible = ref(false);
	
		return {
			emailRules,
			passwordVisible,
			passwordRules,
			passwordConfirm,
			passwordConfirmVisible
		}
	}
}
</script>

<style>

</style>