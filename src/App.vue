<template>
  <v-app>
		<Header />
    <v-main>
      <Popup />
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import Header from '@/components/framework/Header.vue'
import { useAuthStore } from '@/stores/auth'
import Popup from '@/components/Popup.vue'

export default {
  name: 'App',

  components: {
		Header,
    Popup
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
