import { defineStore } from 'pinia'

export const useVisualsStore = defineStore({
	id: 'visuals',
	state: () => ({
		darkMode: true
	}),
	getters: {
		isDarkMode: (state) => state.darkMode,
	}, 
	actions: {
		setDarkMode(enabled) {
			this.darkMode = enabled;
		},
		toggleDarkMode() {
			let darkModeOn = !this.darkMode;
      this.darkMode = darkModeOn;
    },
	}
})