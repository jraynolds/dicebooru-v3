<template>
	<v-dialog 
		v-model="isOpen"
		width="auto"
	>
		<v-card>
			<v-card-title class="bg-primary">
				Register as a map creator
			</v-card-title>

			<v-card-text>
				Please contact me on 
				<TwitterButton color="primary" width="100" />
				at @jasper_raynolds to get your account set up.
			</v-card-text>

			<v-card-text>
				Alternatively, join the 
				<DiscordButton color="primary" width="90" />
				and contact me there!
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script>
import TwitterButton from "@/components/buttons/TwitterButton.vue"
import DiscordButton from "@/components/buttons/DiscordButton.vue"

export default {
	props: [ "open" ],

	components: {
		TwitterButton,
		DiscordButton
	},

	computed: {
		isOpen: {
			get() { return this.open; },
			set(val) { this.$emit('update:open', val); }
		}
	},
}
</script>

<style>

</style>