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
				<v-btn variant="text" href="https://twitter.com/jasper_raynolds" target="_blank">
					<v-icon>mdi-twitter</v-icon>Twitter
				</v-btn>
				at @jasper_raynolds to get your account set up.
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	props: [ "open" ],

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