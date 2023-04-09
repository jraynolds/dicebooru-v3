import { defineStore } from 'pinia'
import DEBUGS from '@/plugins/debug';

export const useVisualsStore = defineStore({
	id: 'visuals',
	state: () => ({
		dialogVisible: false,
		dialogText: "",

		snackbarVisible: false,
		snackbarMessage: "",
		snackbarButtonMessage: "",
		snackbarColor: ""
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
		},
		showSnackbar(message, closeButtonMessage="Close", color="primary") {
			if (DEBUGS.pinia) console.log(`Showing a snackbar with message "${message}"`);

			this.snackbarMessage = message;
			this.snackbarButtonMessage = closeButtonMessage;
			this.snackbarColor = color;
			this.snackbarVisible = true;
		}
	}
})