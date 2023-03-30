<template>
	<v-btn 
		variant="text" 
		:color="color" 
		href="https://twitter.com/jasper_raynolds" 
		target="_blank"
	>
		<v-icon>mdi-twitter</v-icon>Twitter
	</v-btn>
</template>

<script>
export default {
	props: [ "color" ]
}
</script>

<style>
</style>