import { defineStore } from 'pinia'
import { useFiltersStore } from './filters';
import supabase from '@/plugins/supabase';
import DEBUGS from '@/plugins/debug';

const MAP_SELECT_QUERY = `
id,
uploader (
	id,
	author
),
author,
security_level (
	name,
	description,
	icon
),
src,
thumb_src,
purchase_link,
maps_tags!inner (
	id,
	tag (
		id,
		name,
		description,
		type:tagtypes (
			name,
			description,
			icon
		)
	)
)
`;

export const useDataStore = defineStore({
	id: 'data',
	state: () => ({
		tags: [],
		authors: [],
		maps: [],
		loading: false,
		uploading: false,
	}),
	getters: {
		getTags: (state) => state.tags,
		getAuthors: (state) => state.authors,
		getMaps: (state) => state.maps,
		isLoading: (state) => state.loading,
		isUploading: (state) => state.uploading,
	},
	actions: {
		async initialLoad() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Performing initial load.");
			this.loading = true;
			const promises = [
				this.loadTags(),
				this.loadAuthors(),
				this.loadMaps()
			]
			await Promise.all(promises);
			this.loading = false;
		},
		async loadTags() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Getting tags.");
			const { data, error } = await supabase
				.from('tags')
				.select(`
					id,
					name,
					description,
					type:tagtypes (
						name,
						description,
						icon
					),
					num_maps
				`);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(error);

			if (data?.length > 0) this.tags = data;
		},
		async loadAuthors() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Getting authors.");
			const { data, error } = await supabase
				.from('authors')
				.select(`
					id,
					name,
					website,
					default_security_level (
						name,
						description,
						icon
					)
				`);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(error);

			if (data?.length > 0) this.authors = data;
		},
		async loadMaps() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Getting maps.");
			const { data, error } = await supabase
				.from('maps')
				.select(MAP_SELECT_QUERY);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(error);

			if (data?.length > 0) 
			{
				for (let i=0; i<data.length; i++) {
					data[i].tags = data[i].maps_tags;
					delete data[i].maps_tags;
				}
				this.maps = data;
			}
		},
		async loadFilteredMaps() {
			this.loading = true;
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Getting filtered maps.");
			const filtersStore = useFiltersStore();
			const includedTags = filtersStore.getIncludedTags;
			const excludedTags = filtersStore.getExcludedTags;
			const author = filtersStore.getAuthor;
			if (includedTags?.length == 0 && excludedTags.length == 0 && !author) return this.loadMaps();

			let query = supabase
				.from('maps_tags_grouped_by_map')
				.select(`
					map(
						${MAP_SELECT_QUERY}
					)
				`)
			if (includedTags?.length > 0) query = query.contains('tags', includedTags.map(t => t.id));
			if (excludedTags?.length > 0) {
				const excludedTagObject = `{${(excludedTags.map(t => `"${t.id}"`)).join("','")}}`;
				query = query.not('tags', 'cs', excludedTagObject);
			}
			if (author) query = query.eq('author', author.id);
			
			const { data, error } = await query;
			
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(error);

			if (data.length > 0) {
				const newMaps = [];
				for (let m of data) newMaps.push(m.map);
				this.maps = newMaps;
			} else {
				this.maps = [];
			}

			this.loading = false;
		},
		async loadThumbURL(mapID) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading a thumb URL for map ${mapID}`);
			const map = this.maps.find(m => m.id === mapID);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(map);
			if (!map) return;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading image at URL ${map.thumb_src}`);

			const { data, error } = await supabase
				.storage
				.from('thumbs')
				.createSignedUrl(map.thumb_src, 600);
			
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(error);

			if (data?.signedUrl) map.thumb_url = data.signedUrl;
		},
		async loadURL(mapID) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading a URL for map ${mapID}`);
			const map = this.maps.find(m => m.id === mapID);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(map);
			if (!map) return;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading image at URL ${map.src}`);

			const { data, error } = await supabase
				.storage
				.from('maps')
				.createSignedUrl(map.src, 600);
			
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(error);

			if (data?.signedUrl) map.url = data.signedUrl;
		},
		async uploadMap(file, author, tags) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Uploading a new map:");
			if (DEBUGS.pinia || DEBUGS.backend) console.log(file);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(author);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(tags);

			// todo
		}
	}
})