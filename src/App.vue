<template>
  <v-app>
		<Header />
    <v-main>
      <Popup />
      <router-view></router-view>
    </v-main>
		<Footer />
  </v-app>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

import Header from '@/components/framework/Header.vue'
import Popup from '@/components/Popup.vue'
import Footer from '@/components/framework/Footer.vue'

export default {
  name: 'App',

  components: {
		Header,
    Popup,
		Footer
  },

	setup() {

    return {
    }
	},

  mounted() {
    console.log(useAuthStore);
    useAuthStore().loadCurrentSession();
  },
}
</script>
