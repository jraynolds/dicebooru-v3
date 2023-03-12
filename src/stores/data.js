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

const CHUNK_SIZE = 5;
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
		mapChunkStart: 0,
		totalMapsAvailable: 0,
	}),
  persist: true,
	getters: {
		getTags: (state) => state.tags,
		getAuthors: (state) => state.authors,
		getMaps: (state) => state.maps,
		isLoading: (state) => state.loading,
		isUploading: (state) => state.uploadStage != 0,
		getUploadStage: (state) => state.uploadStage,
		moreMapsExist: (state) => state.totalMapsAvailable > state.maps.length,
		getTotalMapsAvailable: (state) => state.totalMapsAvailable,
	},
	actions: {
		/**
		 * Create a new loading query for maps. Usually called by the "Search" button.
		 */
		async newMapQuery() {
			this.mapChunkStart = 0;
			const filtersStore = useFiltersStore();
			this.maps = [];
			
			const { data, error } = await this.loadFilteredMaps(
				0, 
				CHUNK_SIZE,
				filtersStore.getIncludedTags, 
				filtersStore.getExcludedTags, 
				filtersStore.author
			);
			if (data && !error) this.incrementMapChunk(); 
		},
		/**
		 * Increment the chunk of maps we're currently loading by adding the chunk size, stopping at the max maps available.
		 */
		incrementMapChunk() {
			this.mapChunkStart = Math.min(this.mapChunkStart + CHUNK_SIZE, this.totalMapsAvailable);
		},
		/**
		 * Load additional maps from the database. Usually by reaching the end of the infinite scroller.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
		async loadMoreMaps() {
			if (this.isLoading) return;
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Loading additional maps.");

			const filtersStore = useFiltersStore();
			const chunkRange = [this.mapChunkStart, this.mapChunkStart + CHUNK_SIZE];
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading from ${chunkRange[0]} to ${chunkRange[1]}.`);
			let data, error;

			if (filtersStore.areFiltersActive) {
				const filteredMapsResult = await this.loadFilteredMaps(
					chunkRange[0], 
					chunkRange[1], 
					filtersStore.getIncludedTags, 
					filtersStore.getExcludedTags, 
					filtersStore.author
				);
				data = filteredMapsResult.data;
				error = filteredMapsResult.error;
			} else {
				const mapsResult = await this.loadMaps(chunkRange[0], chunkRange[1]);
				data = mapsResult.data;
				error = mapsResult.error;
			}

			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };

			this.incrementMapChunk();

			return { data, error };
		},
		/**
		 * Get a map author for a given map object.
		 * @param {Object} map map object.
		 * @return {Object} the author.
		 */
		getMapAuthor(map) {
			if (!map?.author) return null;
			return this.getAuthors.find(a => a.id === map.author);
		},
		/**
		 * Order tags in the database by ID and then by the number of maps affiliated.
		 */
		orderTags() {
			this.tags = this.tags.sort((t1, t2) => {
				if (t1.type.id < t2.type.id) return -1;
				if (t1.type.id == t2.type.id) return t2.num_maps - t1.num_maps;
				if (t1.type.id > t2.type.id) return 1;
			});
		},
		/**
		 * Perform an initial load for the database when the page refreshes.
		 */
		async initialLoad() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Performing initial load.");
			this.loading = true;
			const promises = [
				this.loadStatistics(),
				this.loadTags(),
				this.loadAuthors(),
				this.loadMaps(0, CHUNK_SIZE)
			]
			await Promise.all(promises);

			this.mapChunkStart = CHUNK_SIZE;
			this.totalMapsAvailable = this.statistics.find(s => s.key == 'num_maps').num_value;

			this.loading = false;
		},
		/**
		 * Load from the statistics table in the database.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
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
		/**
		 * Load tags from the database.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
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
		/**
		 * Load authors from the database.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
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
		/**
		 * Load additional maps without filters applied to the search, in a given chunk.
		 * @param {int} rangeStart the map index to start at.
		 * @param {int} rangeEnd the map index to end at. 
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
		async loadMaps(rangeStart, rangeEnd) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Getting maps between indices ${rangeStart} and ${rangeEnd}.`);

			const date = new Date().toISOString();
			let query = supabase
				.from('maps')
				.select(MAP_SELECT_QUERY)
				.order('updated_at', { ascending: false })
				.range(rangeStart, rangeEnd);
			// if (this.lastMapsReadDate) query = query.gte('updated_at', this.lastMapsReadDate);
			const { data, error } = await query;

			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };
			// this.lastMapsReadDate = date;

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
		/**
		 * Load a map with a given id. Usually to refresh the state of the map.
		 * @param {String} id the ID of the map.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
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
		/**
		 * Load maps from the database, applying filters to the search.
		 * @param {int} rangeStart the map index to start at.
		 * @param {int} rangeEnd the map index to end at.
		 * @param {Array(Object)} includedTags the tags we're filtering positively by.
		 * @param {Array(Object)} excludedTags the tags we're filtering negatively by.
		 * @param {Object} author the author we're filtering positively by.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
		async loadFilteredMaps(rangeStart, rangeEnd, includedTags, excludedTags, author) {
			this.loading = true;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Getting filtered maps between indices ${rangeStart} and ${rangeEnd}.`);
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Our filters are:");
			if (DEBUGS.pinia || DEBUGS.backend) console.log(includedTags);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(excludedTags);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(author);

			let query = supabase
				.from('maps_tags_grouped')
				.select(`
					map(
						${MAP_SELECT_QUERY}
					)
				`)
				.range(rangeStart, rangeEnd);
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

			let num_query = supabase
			.from('maps_tags_grouped')
			.select('*', { count: 'exact' });		
			if (includedTags?.length > 0) num_query = num_query.contains('tags', includedTags.map(t => t.id));
			if (excludedTags?.length > 0) {
				const excludedTagObject = `{${(excludedTags.map(t => `"${t.id}"`)).join("','")}}`;
				num_query = num_query.not('tags', 'cs', excludedTagObject);
			}
			if (author) num_query = num_query.eq('author', author.id);
			
			const { count, num_error } = await num_query;
			console.log(count);

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
		/**
		 * Load the thumb-sized URL for a map with the given ID. Exits if we've got a valid one saved.
		 * @param {String} mapID the ID of the map we're searching by.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
		async loadThumbURL(mapID) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Potentially loading a thumb URL for map ${mapID}`);
			const map = this.maps.find(m => m.id === mapID);
			if (map.thumb_url && map.image_fetched &&  Date.now() - map.thumb_fetched < IMAGE_PERSISTENCE_SECONDS * 10) return;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(map);
			if (!map) return;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading image at URL ${map.thumb_src}`);

			const { data, error } = await supabase
				.storage
				.from('thumbs')
				.createSignedUrl(map.thumb_src, IMAGE_PERSISTENCE_SECONDS * 10);
			
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
		/**
		 * Loads the full-sized URL for a map with the given ID.
		 * @param {String} mapID the ID of the map we're searching by.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
		async loadURL(mapID) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading a URL for map ${mapID}`);
			const map = this.maps.find(m => m.id === mapID);
			if (map.url && map.image_fetched && Date.now() - map.image_fetched < IMAGE_PERSISTENCE_SECONDS * 10) return;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(map);
			if (!map) return;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Loading image at URL ${map.src}`);

			const { data, error } = await supabase
				.storage
				.from('maps')
				.createSignedUrl(map.src, IMAGE_PERSISTENCE_SECONDS * 10);
			
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
		/**
		 * Performs the resize and upload task for a given file, author, and array of tags.
		 * @param {File} file the map image file.
		 * @param {Object} author the author object.
		 * @param {Array(Object)} tags the list of tags that apply to this map.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
		async uploadMap(file, author, tags) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Uploading a new map:");
			if (DEBUGS.pinia || DEBUGS.backend) console.log(file);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(author);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(tags);

			this.uploadStage = 1;
			// Resize the image
			const thumbFile = await this.resizeImage(file);
			if (!thumbFile) return;

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
		/**
		 * Creates a smaller image from a given image.
		 * @param {File} image the given image.
		 * @param {int} [resizeWidth=500] the width of the resulting image.
		 * @param {int} [resizeHeight=500] the height of the resulting image.
		 * @return {File} the resized image.
		 */
		async resizeImage(image, resizeWidth=500, resizeHeight=500) {
			if (DEBUGS.pinia) console.log("Resizing this image:");
			if (DEBUGS.pinia) console.log(image);

			const compress = async (file) => await new Promise((resolve, reject) => {
				new Compressor(file, {
					width: resizeWidth,
					height: resizeHeight,
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
		/**
		 * Add tags to an existing map, then reload that map.
		 * @param {Object} map the given map.
		 * @param {Array(Object)} tags the tags being added.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
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