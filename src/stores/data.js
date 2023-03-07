import { defineStore } from 'pinia'
import { useFiltersStore } from './filters';
import { useStorage } from "@vueuse/core"
import supabase from '@/plugins/supabase';
import DEBUGS from '@/plugins/debug';
import Compressor from 'compressorjs'

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
tags:maps_tags (
	id,
	tag (
		id,
		name,
		description,
		type:tagtypes (
			id,
			name,
			description,
			icon
		)
	)
)
`;

const CHUNK_SIZE = 6;
const IMAGE_PERSISTENCE_SECONDS = 3600;

export const useDataStore = defineStore({
	id: 'data',
	state: () => ({
		statistics: [],
		tags: [],
		authors: [],
		maps: [],
		loading: false,
		uploadStage: 0,
		lastTagsReadDate: null,
		lastAuthorsReadDate: null,
		lastMapsReadDate: null,
		mapChunkStart: 0
	}),
  persist: true,
	getters: {
		getTags: (state) => state.tags,
		getAuthors: (state) => state.authors,
		getMaps: (state) => state.maps,
		isLoading: (state) => state.loading,
		isUploading: (state) => state.uploadStage != 0,
		getUploadStage: (state) => state.uploadStage,
		moreMapsExist: (state) => state?.statistics?.find(s => s.key == 'num_maps')?.num_value > state.mapChunkStart
	},
	actions: {
		newQuery() {
			this.resetMapChunk();
			this.maps = [];
			this.loadFilteredMaps();
		},
		resetMapChunk() {
			this.mapChunkStart = 0;
		},
		getMapAuthor(map) {
			if (!map?.author) return null;
			return this.getAuthors.find(a => a.id === map.author);
		},
		orderTags() {
			this.tags = this.tags.sort((t1, t2) => {
				if (t1.type.id < t2.type.id) return -1;
				if (t1.type.id == t2.type.id) return t2.num_maps - t1.num_maps;
				if (t1.type.id > t2.type.id) return 1;
			});
		},
		async initialLoad() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Performing initial load.");
			this.loading = true;
			const promises = [
				this.loadStatistics(),
				this.loadTags(),
				this.loadAuthors(),
				this.loadMaps()
			]
			await Promise.all(promises);
			this.loading = false;
		},
		async loadStatistics() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Getting statistics.");

			const date = new Date().toISOString();
			let query = supabase
				.from('statistics')
				.select(`
					id,
					key,
					text_value,
					num_value,
					bool_value,
					date_value,
					uuid_value
				`);
			const { data, error } = await query;

			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };
			
			this.statistics = data;
					
			return { data, error }
		},
		async loadTags() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Getting tags.");

			const date = new Date().toISOString();
			let query = supabase
				.from('tags')
				.select(`
					id,
					name,
					description,
					type:tagtypes (
						id,
						name,
						description,
						icon
					),
					num_maps
				`);
			if (this.lastTagsReadDate) query = query.gte('updated_at', this.lastTagsReadDate); 
			const { data, error } = await query;

			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };
			this.lastTagsReadDate = date;

			let isPresent = false;
			const additions = [];
			for (let i=0; i<data.length; i++) {
				isPresent = false;
				for (let j=0; j<this.tags.length; j++) {
					if (data[i].id == this.tags[j].id) {
						Object.assign(this.tags[j], data[i]);
						isPresent = true;
						break;
					}
				}
				if (!isPresent) additions.push(data[i]);
			}
			for (const tag of additions) this.tags.push(tag);

			this.orderTags();
					
			return { data, error }
		},
		async loadAuthors() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Getting authors.");

			const date = new Date().toISOString();
			let query = supabase
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
			if (this.lastAuthorsReadDate) query = query.gte('updated_at', this.lastAuthorsReadDate); 
			const { data, error } = await query;

			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };
			this.lastAuthorsReadDate = date;

			let isPresent = false;
			const additions = [];
			for (let i=0; i<data.length; i++) {
				isPresent = false;
				for (let j=0; j<this.authors.length; j++) {
					if (data[i].id == this.authors[j].id) {
						Object.assign(this.authors[j], data[i]);
						isPresent = true;
						break;
					}
				}
				if (!isPresent) additions.push(data[i]);
			}
			for (const author of additions) this.authors.push(author);

			return { data, error };
		},
		async loadMaps() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Getting maps.");

			const date = new Date().toISOString();
			let query = supabase
				.from('maps')
				.select(MAP_SELECT_QUERY)
				.order('updated_at', { ascending: false })
				.range(this.mapChunkStart, this.mapChunkStart + CHUNK_SIZE);
			if (this.lastMapsReadDate) query = query.gte('updated_at', this.lastMapsReadDate);
			const { data, error } = await query;

			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };
			this.lastMapsReadDate = date;

			this.mapChunkStart += CHUNK_SIZE;

			let isPresent = false;
			const additions = [];
			for (let i=0; i<data.length; i++) {
				isPresent = false;
				for (let j=0; j<this.maps.length; j++) {
					if (data[i].id == this.maps[j].id) {
						Object.assign(this.maps[j], data[i]);
						isPresent = true;
						break;
					}
				}
				if (!isPresent) additions.push(data[i]);
			}
			for (const map of additions) this.maps.push(map);

			return { data, error };
		},
		async loadMap(id) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading a single map with id ${id}.`);
			
			const { data, error } = await supabase
				.from('maps')
				.select(MAP_SELECT_QUERY)
				.eq('id', id);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);

			const i = this.maps.indexOf(this.maps.find(m => m.id === id));
			if (i >= 0) {
				Object.assign(this.maps[i], data[0]);
			}
			else this.maps.push(data[0]);

			return { data, error };
		},
		async loadFilteredMaps() {
			this.loading = true;
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Getting filtered maps.");
			const filtersStore = useFiltersStore();
			const includedTags = filtersStore.getIncludedTags;
			const excludedTags = filtersStore.getExcludedTags;
			const author = filtersStore.getAuthor;

			let query = supabase
				.from('maps_tags_grouped')
				.select(`
					map(
						${MAP_SELECT_QUERY}
					)
				`)
				.range(this.mapChunkStart, this.mapChunkStart + CHUNK_SIZE);
			if (includedTags?.length > 0) query = query.contains('tags', includedTags.map(t => t.id));
			if (excludedTags?.length > 0) {
				const excludedTagObject = `{${(excludedTags.map(t => `"${t.id}"`)).join("','")}}`;
				query = query.not('tags', 'cs', excludedTagObject);
			}
			if (author) query = query.eq('author', author.id);
			const { data, error } = await query;
			
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };

			this.mapChunkStart += CHUNK_SIZE;

			let isPresent = false;
			const additions = [];
			for (let i=0; i<data.length; i++) {
				isPresent = false;
				for (let j=0; j<this.maps.length; j++) {
					if (data[i].id == this.maps[j].id) {
						Object.assign(this.maps[j], data[i]);
						isPresent = true;
						break;
					}
				}
				if (!isPresent) additions.push(data[i]);
			}
			for (const map of additions) this.maps.push(map);

			this.loading = false;

			return { data, error };
		},
		async loadThumbURL(mapID) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Potentially loading a thumb URL for map ${mapID}`);
			const map = this.maps.find(m => m.id === mapID);
			if (map.thumb_url && Date.now() - map.thumb_fetched < IMAGE_PERSISTENCE_SECONDS * 10) return;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(map);
			if (!map) return;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading image at URL ${map.thumb_src}`);

			const { data, error } = await supabase
				.storage
				.from('thumbs')
				.createSignedUrl(map.thumb_src, 3600);
			
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };

			const now = Date.now();
			if (data?.signedUrl) {
				map.thumb_url = data.signedUrl;
				map.thumb_fetched = now;
			}

			return { data, error };
		},
		async loadURL(mapID) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading a URL for map ${mapID}`);
			const map = this.maps.find(m => m.id === mapID);
			if (map.url && Date.now() - map.image_fetched < IMAGE_PERSISTENCE_SECONDS * 10) return;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(map);
			if (!map) return;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading image at URL ${map.src}`);

			const { data, error } = await supabase
				.storage
				.from('maps')
				.createSignedUrl(map.src, 3600);
			
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };

			const now = Date.now();
			if (data?.signedUrl) {
				map.url = data.signedUrl;
				map.image_fetched = now;
			}

			return { data, error };
		},
		async uploadMap(file, author, tags) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Uploading a new map:");
			if (DEBUGS.pinia || DEBUGS.backend) console.log(file);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(author);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(tags);

			this.uploadStage = 1;
			// Resize the image
			const thumbFile = await this.resizeImage(file);
			if (!thumbFile) return;

			// if (DEBUGS.pinia || DEBUGS.backend) console.log("Converting file to array...");
			// const fileAsArray = await new Response(file).arrayBuffer();
			// if (DEBUGS.pinia || DEBUGS.backend) console.log(fileAsArray);

			if (DEBUGS.pinia || DEBUGS.backend) console.log("Attempting to contact server with this payload:");
			const payload = new FormData();
			payload.append('image', file);
			payload.append('thumb', thumbFile);
			if (author?.id) payload.append('author', author.id);
			payload.append('tags', tags.map(t => t.id).join(","));
			if (DEBUGS.pinia || DEBUGS.backend) console.log(...payload);
			const { data, error } = await supabase
				.functions
				.invoke(
					'user-add-map',
					{
						body: payload
					}
				)
			
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);

			return { data, error }
		},
		async resizeImage(image) {
			if (DEBUGS.pinia) console.log("Resizing this image:");
			if (DEBUGS.pinia) console.log(image);

			const compress = async (file) => await new Promise((resolve, reject) => {
				new Compressor(file, {
					width: 500,
					height: 500,
					success: resolve,
					error: reject
				});
			});

			let resized = null;

			await compress(image).then((result) => {
				if (DEBUGS.pinia) console.log("Successfully resized:");
				if (DEBUGS.pinia) console.log(result);
				resized = result;
			}).catch((err) => {
				if (DEBUGS.pinia || DEBUGS.error) console.log("Couldn't resize!");
				if (DEBUGS.pinia || DEBUGS.error) if (err) console.log(err);
			});

			if (DEBUGS.pinia) console.log(resized);

			return resized;
		},
		async addTags(map, tags) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Adding tags to an existing map.");
			if (DEBUGS.pinia || DEBUGS.backend) console.log(map);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(tags);

			const map_tags = [];
			for (const tag of tags) map_tags.push({ map: map.id, tag: tag.id });
			const { data, error } = await supabase
				.from('maps_tags')
				.insert(map_tags);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };

			return await this.loadMap(map.id);
		} 
	}
})