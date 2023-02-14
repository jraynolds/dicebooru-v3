<template>
	<v-chip 
		:prepend-icon="tag.type.icon" 
		:text="tag.name" 
		:closable="closable"
		@click="click"
	/>
</template>

<script>
export default {
	props: [ "tag", "closable" ],

	methods: {
		click() {
		}
	}
}
</script>

<style>

</style>