<template>
  <v-app>
		<Header />
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Header from './components/framework/Header.vue'

export default {
  name: 'App',

  components: {
    HelloWorld,
		Header
  },

	setup() {

    return {
    }
	}
}
</script>
