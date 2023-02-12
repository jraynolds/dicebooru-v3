import { defineStore } from 'pinia'

export const useAuthStore = defineStore({
	id: 'auth',
	state: () => ({
		user: null,
		loginPanelOpen: false
	}),
	getters: {
		getUser: (state) => state.user,
		getLoginPanelOpen: (state) => state.loginPanelOpen
	},
	actions: {
		setLoginPanelOpen(open) {
			this.loginPanelOpen = open;
		}
		// async fetchPosts() {
		//   this.posts = []
		//   this.loading = true
		//   try {
		//     this.posts = await fetch('https://jsonplaceholder.typicode.com/posts')
		//     .then((response) => response.json()) 
		//   } catch (error) {
		//     this.error = error
		//   } finally {
		//     this.loading = false
		//   }
		// },
	}
})