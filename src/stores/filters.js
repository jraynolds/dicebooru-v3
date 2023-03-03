import { defineStore } from 'pinia'
import DEBUGS from '@/plugins/debug';

export const useFiltersStore = defineStore({
	id: 'filters',
	state: () => ({
		includedTags: [],
		excludedTags: [],
		author: null,
	}),
	getters: {
		getIncludedTags: (state) => state.includedTags,
		getExcludedTags: (state) => state.excludedTags,
		getAuthor: (state) => state.author,
	},
	actions: {
		setIncludedTags(arr) {
			if (DEBUGS.pinia || DEBUGS.filters) console.log("Changing our array of included, filtering tags to:");
			if (DEBUGS.pinia || DEBUGS.filters) console.log(arr);
			this.includedTags = arr;
		},
		addIncludedTag(tag) {
			if (DEBUGS.pinia || DEBUGS.filters) console.log("Adding to our included, filtering tags:");
			if (DEBUGS.pinia || DEBUGS.filters) console.log(tag);
			if (!this.includedTags.includes(tag)) this.includedTags.push(tag);
			if (this.excludedTags.includes(tag)) this.excludedTags.splice(this.excludedTags.indexOf(tag), 1);
		},
		toggleIncludedTag(tag) {
			if (DEBUGS.pinia || DEBUGS.filters) console.log("Toggling this included filtering tag:");
			if (DEBUGS.pinia || DEBUGS.filters) console.log(tag);
			if (this.includedTags.includes(tag)) this.includedTags.splice(this.includedTags.indexOf(tag), 1);
			else this.addIncludedTag(tag);
		},
		setExcludedTags(arr) {
			if (DEBUGS.pinia || DEBUGS.filters) console.log("Changing our array of excluded, filtering tags to:");
			if (DEBUGS.pinia || DEBUGS.filters) console.log(arr);
			this.excludedTags = arr;
		},
		setAuthor(author) { 
			if (DEBUGS.pinia || DEBUGS.filters) console.log("Changing our filtering author to:");
			if (DEBUGS.pinia || DEBUGS.filters) console.log(author);
			this.author = author;
		},
		toggleAuthor(author) {
			if (DEBUGS.pinia || DEBUGS.filters) console.log("Toggling this filtering author:");
			if (DEBUGS.pinia || DEBUGS.filters) console.log(author);
			
			if (this.getAuthor && this.getAuthor == author) this.author = null;
			else this.author = author;
		},
	}
})