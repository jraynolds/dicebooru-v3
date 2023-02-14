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
		maps: []
	}),
	getters: {
		getTags: (state) => state.tags,
		getAuthors: (state) => state.authors,
		getMaps: (state) => state.maps,
	},
	actions: {
		async initialLoad() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Performing initial load.");
			this.loadTags();
			this.loadAuthors();
			this.loadMaps();
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
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Getting filtered maps.");
			const filtersStore = useFiltersStore();
			const includedTags = filtersStore.getIncludedTags;
			const excludedTags = filtersStore.getExcludedTags;
			if (includedTags?.length == 0 && excludedTags.length == 0) return this.loadMaps();

			let query = supabase
				.from('maps_tags_grouped_by_map')
				.select(`
					map(
						${MAP_SELECT_QUERY}
					)
				`)
			console.log(query);
			if (includedTags?.length > 0) query = query.contains('tags', includedTags.map(t => t.id));
			// const excludedTagTuple = `(${(excludedTags.map(t => t.id)).join("','")})`;
			const excludedTagObject = `{${(excludedTags.map(t => `"${t.id}"`)).join("','")}}`;
			console.log(excludedTagObject);
			if (excludedTags?.length > 0) query = query.not('tags', 'cs', excludedTagObject);
			
			// console.log(query);
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
		},
		async loadThumbURL(mapID) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading a thumb URL for map ${mapID}`);
			const map = this.maps.find(m => m.id === mapID);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(map);
			if (!map) return;

			const { data, error } = await supabase
				.storage
				.from('thumbs')
				.createSignedUrl(map.thumb_src, 600);
			
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(error);

			if (data?.signedUrl) map.thumb_url = data.signedUrl;
		},
		// async loadMapTags(mapID) {
			// if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading tags for map ${mapID}`);
			// const map = this.maps.find(m => m.id === mapID);
			// if (DEBUGS.pinia || DEBUGS.backend) console.log(map);
			// if (!map) return;

			// const { data, error } = await supabase
			// 	.from('maps_tags')
			// 	.select(`
			// 		id,
			// 		tag (
			// 			id,
			// 			name,
			// 			description,
			// 			type:tagtypes (
			// 				name,
			// 				description,
			// 				icon
			// 			)
			// 		)
			// 	`)
			// 	.eq('map', mapID);
			
			// if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			// if (DEBUGS.pinia || DEBUGS.backend) console.log(error);

			// if (data?.length > 0) map.tags = data;
		// }
	}
})