import { defineStore } from 'pinia'
import { useDataStore } from "@/stores/data"
import DEBUGS from '@/plugins/debug';
import { securityLevels } from "@/scripts/security"

export const useFiltersStore = defineStore({
	id: 'filters',
	state: () => ({
		includedTags: [],
		excludedTags: [],
		author: null,
		securityLevelIndex: 0,
		minRating: 0,
		uploader: null,
		ratedBy: null
	}),
	getters: {
		getIncludedTags: (state) => state.includedTags,
		getIncludableTags: (state) => useDataStore().getTags.filter(t => !state.excludedTags.includes(t)),
		getExcludedTags: (state) => state.excludedTags,
		getExcludableTags: (state) => useDataStore().getTags.filter(t => !state.includedTags.includes(t)),
		getAuthor: (state) => state.author,
		areFiltersActive: (state) => state.includedTags.length > 0 || state.excludedTags.length > 0 || state.author,
		getSecurityLevelIndex: (state) => state.securityLevelIndex,
		getSecurityLevel: (state) => securityLevels[state.securityLevelIndex],
		getMinRating: (state) => state.minRating,
		getUploader: (state) => state.uploader,
		getRatedBy: (state) => state.ratedBy
	},
	actions: {
		clearFilters() {
			this.includedTags = [];
			this.excludedTags = [];
			this.author = null;
			this.securityLevelIndex = 0;
			this.minRating = 0;
			this.uploader = null;
			this.ratedBy = null;
		},
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
		incrementSecurityLevel() {
			if (DEBUGS.pinia || DEBUGS.filters) console.log("Incrementing our filtering security level.");
			if (this.securityLevelIndex == 2) this.securityLevelIndex = 0;
			else this.securityLevelIndex++; 
		},
		setMinRating(rating) {
			if (DEBUGS.pinia || DEBUGS.filters) console.log(`Setting our minimum rating to ${rating}`);
			this.minRating = rating;
		},
		setUploader(uploaderID) {
			if (DEBUGS.pinia || DEBUGS.filters) console.log(`Setting our uploader ID to ${uploaderID}`);
			this.uploader = uploaderID;
		},
		setRatedBy(raterID) {
			if (DEBUGS.pinia || DEBUGS.filters) console.log(`Setting our rater ID to ${raterID}`);
			this.ratedBy = raterID;
		}
	}
})