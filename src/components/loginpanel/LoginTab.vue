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
					v-model="localPassword" 
					required
					:rules="[ v => v.length > 0 ]"
					prepend-icon="mdi-key"
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
	},

	mounted() {
		this.isValid = false;
	},
	
	setup() {
		const emailRules = [
			v => !!v || 'email required',
			v => /.+@.+/.test(v) || 'email must be valid',
		];
		const passwordVisible = ref(false);
	
		return {
			emailRules,
			passwordVisible,
		}
	}
}
</script>

<style>

</style>