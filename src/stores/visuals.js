import { defineStore } from 'pinia'
import DEBUGS from '@/plugins/debug';

export const useVisualsStore = defineStore({
	id: 'visuals',
	state: () => ({
		dialogVisible: false,
		dialogText: "",
	}),
	getters: {
		isDarkMode: (state) => state.darkMode,
		isDialogVisible: (state) => state.dialogVisible,
		getDialogText: (state) => state.dialogText,
	}, 
	actions: {
		showDialog(text) {
			if (DEBUGS.pinia) console.log(`Showing our dialog with the message "${text}".`);
			this.dialogVisible = true;
			this.dialogText = text;
		},
		setDialogVisible(visible) {
			if (DEBUGS.pinia) console.log(`Setting our dialog visible: ${visible}.`);
			this.dialogVisible = visible;
		}
	}
})