<template>
	<v-app-bar
		app
		height="25"
		color="primary"
		dark
		style="font-size: smaller;"
		location="bottom"
	>
		<span class="d-flex align-center justify-center" style="width: 100%;">
			This site is in active development. Join the 
			<DiscordButton width="90" />
			to be a part of it!
		</span>
	</v-app-bar>
</template>

<script>
import DiscordButton from "@/components/buttons/DiscordButton.vue"

export default {
	components: {
		DiscordButton
	}
}
</script>

<style>
</style>