import { defineStore } from 'pinia'
import { useStorage } from "@vueuse/core"
import supabase from '@/plugins/supabase';
import DEBUGS from '@/plugins/debug';
import { useDataStore } from '@/stores/data';

export const useAuthStore = defineStore({
	id: 'auth',
	state: () => ({
		user: null,
		session: null,
		loginPanelOpen: false
	}),
  persist: true,
	getters: {
		getUser: (state) => state.user,
		getSession: (state) => state.session,
		getLoginPanelOpen: (state) => state.loginPanelOpen
	},
	actions: {
		setLoginPanelOpen(open=true) {
			this.loginPanelOpen = open;
			if (DEBUGS.pinia) console.log(`Changing login panel open status to ${open}.`);
		},
		async loadCurrentSession() {
			const { data, error } = await supabase.auth.getSession();
			if (DEBUGS.pinia || DEBUGS.auth) 
			{
				console.log(`Attempted to get the current session.`);
				if (data) {
					console.log("We got a session:");
					console.log(data);
					if (data.session) console.log("It's an actual session.");
					else console.log("It's an empty session.");
				}
				else console.log("We couldn't get a session.");
				if (error) {
					console.log("we got an error:");
					console.log(error);
				}
			}

			if (data != null) this.session = data.session;
			if (data?.session?.user != null) {
				this.user = data.session.user;
				useDataStore().loadUserProfile();
			}
		},
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