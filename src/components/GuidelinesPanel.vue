<template>
	<div class="text-center">
		<v-dialog
			v-model="dialog"
			width="500"
		>
			<template v-slot:activator="{ props }">
				<div class="d-flex align-center">
					<v-checkbox 
						color="primary"
						disabled
						density="compact"
						v-model="hasUnderstood"
						:hide-details="true"
					/>
					<v-btn
						color="primary"
						v-bind="props"
						variant="text"
					>
						Guidelines
					</v-btn>
				</div>
			</template>

			<v-card>
				<v-card-title class="header bg-primary">Guidelines</v-card-title>
				<v-card-text>
					Please tag and attribute maps appropriately.
				</v-card-text>
				<v-card-text>
          <b>Please only upload maps that have been released for public consumption.</b> This includes Twitter posts, Reddit and other social media releases, and content made available on Patreon or websites that don't require any payment to view in their entirety.
				</v-card-text>
				<v-card-text>
					If you upload maps without proper attribution, upload paid maps without being their author, or otherwise attempt to circumvent rules or common decency, your account may be restricted or even banned. 
				</v-card-text>
				<v-card-text>
					Maps containing NSFW content are not allowed.
				</v-card-text>
				<v-card-actions>
					<v-btn color="primary" block @click="hasUnderstood = true">Understood</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { ref } from 'vue';

export default {
	props: [ "understood" ],

  computed: {
    hasUnderstood: {
			get() { return this.understood; },
			set(val) { 
				this.dialog = false;
				this.$emit('update:understood', val);
			}
		}
  },

	setup () {
		const dialog = ref(false);

		return {
			dialog,
		}
	},
}
</script>

<style>

</style>