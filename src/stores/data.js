import { defineStore } from 'pinia'
import { useFiltersStore } from './filters';
import { useAuthStore } from './auth';
import { useStorage } from "@vueuse/core"
import supabase from '@/plugins/supabase';
import DEBUGS from '@/plugins/debug';
import Compressor from 'compressorjs'


/**
 * Adds elements to an array, updating elements with matching IDs instead.
 * @param {Array(Object)} array the existing array to be added to.
 * @param {Array(Object)} elements the new elements to be added or updated. 
 */
const addAndUpdate = (array, elements) => {
	let isPresent = false;
	const additions = [];
	for (let i=0; i<elements.length; i++) {
		isPresent = false;
		for (let j=0; j<array.length; j++) {
			if (elements[i].id == array[j].id) {
				Object.assign(array[j], elements[i]);
				isPresent = true;
				break;
			}
		}
		if (!isPresent) additions.push(elements[i]);
	}
	for (const element of additions) array.push(element);
};

const STATISTICS_SELECT_QUERY = `
id,
key,
text_value,
num_value,
bool_value,
date_value,
uuid_value
`

const TAG_SELECT_QUERY = `
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
`

const MAP_SELECT_QUERY = `
id,
uploader (
	id,
	author
),
author,
security_level,
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
),
avg_rating
`;

const AUTHOR_SELECT_QUERY = `
id,
name,
website,
default_security_level (
	id,
	name,
	description,
	icon
),
avg_rating,
num_maps_authored
`
const PROFILE_SELECT_QUERY = `
id,
avatar_url,
author,
avg_rating,
num_maps_uploaded
`

const CHUNK_SIZE = 5;
const IMAGE_PERSISTENCE_SECONDS = 3600;

export const useDataStore = defineStore({
	id: 'data',
	state: () => ({
		profile: null,
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
		getUserProfile: (state) => state.profile,
		getTags: (state) => state.tags,
		getAuthors: (state) => state.authors,
		getMaps: (state) => state.maps,
		isLoading: (state) => state.loading,
		isUploading: (state) => state.uploadStage != 0,
		getUploadStage: (state) => state.uploadStage,
		moreMapsExist: (state) => state.totalMapsAvailable > state.maps.length,
		getTotalMapsAvailable: (state) => state.totalMapsAvailable,
		getUserAuthor: (state) => {
			if (!state.getUserProfile?.author) return null;
			return state.authors.find(a => a.id == state.getUserProfile.author);
		},
	},
	actions: {
		/**
		 * Returns the author our logged in user is registered to represent, if any.
		 * @returns {Object} the author our user is registered to represent, if any.
		 */
		/**
		 * Loads the database profile for our authed user ID.
		 */
		async loadUserProfile() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Loading our user profile.");
			const authStore = useAuthStore();
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Our user ID is ${authStore.getUser.id}`);

			const { data, error } = await supabase
				.from('profiles_view')
				.select(PROFILE_SELECT_QUERY)
				.limit(1);
			
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };

			this.profile = data[0];
			return { data, error };
		},
		/**
		 * Create a new loading query for maps. Usually called by the "Search" button.
		 */
		async newMapQuery() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Making a new map query.");
			this.mapChunkStart = 0;
			const filtersStore = useFiltersStore();
			this.maps = [];

			const { data, error } = await this.loadFilteredMaps(
				0, 
				CHUNK_SIZE,
				filtersStore.getIncludedTags, 
				filtersStore.getExcludedTags, 
				filtersStore.author,
				filtersStore.getSecurityLevelIndex,
				filtersStore.getMinRating,
				filtersStore.getUploader,
				filtersStore.getRatedBy
			);
			if (data && !error) this.incrementMapChunk(); 
		},
		/**
		 * Increment the chunk of maps we're currently loading by adding the chunk size, stopping at the max maps available.
		 */
		incrementMapChunk() {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Incrementing our map loading chunk by ${CHUNK_SIZE}.`);
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
					filtersStore.author,
					filtersStore.getSecurityLevelIndex,
					filtersStore.getMinRating,
					filtersStore.getUploader,
					filtersStore.getRatedBy
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
				.select(STATISTICS_SELECT_QUERY);
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
				.select(TAG_SELECT_QUERY);
			if (this.lastTagsReadDate) query = query.gte('updated_at', this.lastTagsReadDate); 
			const { data, error } = await query;

			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };
			this.lastTagsReadDate = date;

			addAndUpdate(this.tags, data);

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
				.from('authors_view')
				.select(AUTHOR_SELECT_QUERY);
			if (this.lastAuthorsReadDate) query = query.gte('updated_at', this.lastAuthorsReadDate); 
			const { data, error } = await query;

			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };
			this.lastAuthorsReadDate = date;

			addAndUpdate(this.authors, data);

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
			this.loading = true;

			const date = new Date().toISOString();
			let query = supabase
				.from('maps_view')
				.select(MAP_SELECT_QUERY)
				.order('updated_at', { ascending: false })
				.range(rangeStart, rangeEnd);
			// if (this.lastMapsReadDate) query = query.gte('updated_at', this.lastMapsReadDate);
			const { data, error } = await query;

			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) {
				this.loading = false;
				return { data, error };
			}
			// this.lastMapsReadDate = date;
			
			addAndUpdate(this.maps, data);

			this.loading = false;
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
				.from('maps_view')
				.select(MAP_SELECT_QUERY)
				.eq('id', id);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);

			addAndUpdate(this.maps, data);

			return { data, error };
		},
		/**
		 * Load maps from the database, applying filters to the search.
		 * @param {int} rangeStart the map index to start at.
		 * @param {int} rangeEnd the map index to end at.
		 * @param {Array(Object)} includedTags the tags we're filtering positively by.
		 * @param {Array(Object)} excludedTags the tags we're filtering negatively by.
		 * @param {Object} author the author we're filtering positively by.
		 * @param {int} securityLevel the security level of the maps we're allowing; 0 for all, 1 for only unpaid, 2 for paid only.
		 * @param {float} minRating filters by whether the map has a greater than or equal to average rating than the given number.
		 * @param {String} uploader filters by whether the given profile ID has uploaded the map.
		 * @param {String} ratedBy filters by whether the given profile ID has rated the map.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
		async loadFilteredMaps(rangeStart, rangeEnd, includedTags, excludedTags, author, securityLevel, minRating, uploader, ratedBy) {
			if (this.isLoading) return;
			this.loading = true;
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Getting filtered maps between indices ${rangeStart} and ${rangeEnd}.`);
			if (DEBUGS.pinia || DEBUGS.backend) console.log("Our filters are:");
			if (DEBUGS.pinia || DEBUGS.backend) console.log(includedTags);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(excludedTags);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(author);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(securityLevel);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(minRating);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(uploader);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(ratedBy);

			let query = supabase
				.from('maps_view')
				.select(MAP_SELECT_QUERY, { count: 'exact' })
				.order('updated_at', { ascending: false })
				.range(rangeStart, rangeEnd);
			if (includedTags?.length > 0) query = query.contains('tags', includedTags.map(t => t.id));
			if (excludedTags?.length > 0) {
				const excludedTagObject = `{${(excludedTags.map(t => `"${t.id}"`)).join("','")}}`;
				query = query.not('tags', 'cs', excludedTagObject);
			}
			if (author) query = query.eq('author', author.id);
			if (securityLevel != 0) {
				if (securityLevel == 1) query = query.or('security_level.is.null','security_level.neq.3');
				else if (securityLevel == 2) query = query.eq('security_level', 2);
			}
			if (minRating) query = query.gte('avg_rating', minRating);
			if (uploader) query = query.eq('uploader', uploader);
			if (ratedBy) query = query.contains('rated_by', [ratedBy]);

			const { data, count, error } = await query;
			
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(count);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			
			if (error) {
				this.loading = false;
				return { data, count, error };
			}

			this.totalMapsAvailable = count;

			const newMaps = [];
			for (const map of data) newMaps.push(map);
			addAndUpdate(this.maps, newMaps);

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
			if (map.thumb_url && map.thumb_fetched && Date.now() - map.thumb_fetched < IMAGE_PERSISTENCE_SECONDS * 1000)
			{
				if (DEBUGS.pinia) console.log("Image already loaded.");
				return;
			} 
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
		},
		/**
		 * Uploads or updates this user's rating for this map in the database.
		 * @param {Object} map the map we're giving a rating to.
		 * @param {float} rating the rating from .5-5 we're giving.
		 */
		async rateMap(map, rating) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`Submitting a rating of ${rating} for this map:`);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(map);
			
			const authStore = useAuthStore();

			const { data, error } = await supabase
				.from('ratings')
				.upsert({ map: map.id, profile: authStore.getUser.id, rating: rating }, { onConflict: 'map, profile' });
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);

			map.avg_rating = rating;
			return { data, error };
		},
		/**
		 * Update an author's info in the database.
		 * @param {String} authorID the database ID of the author we're updating.
		 * @param {String} website the optional website URL a paid map redirects to if it's this author's.
		 * @param {int} restrictionLevel the optional default restriction level for this author's maps.
		 * @return {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
		async updateAuthorSettings(authorID, website, restrictionLevel) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`We're updating the author with ID ${authorID}, with website ${website} and restriction level ${restrictionLevel}.`);
			
			let updateObject = { };
			if (website) updateObject.website = website;
			if (restrictionLevel) updateObject.default_security_level = restrictionLevel;

			const { error } = await supabase
				.from('authors')
				.update(updateObject)
				.eq('id', authorID);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { error };
			
			const { data, error: authorError } = await supabase
				.from('authors_view')
				.select(MAP_SELECT_QUERY)
				.eq('id', authorID)
				.limit(1);
				
			if (DEBUGS.pinia || DEBUGS.backend) console.log(data);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (authorError) console.log(authorError);
			if (error) return { error };

			addAndUpdate(this.authors, data);

			return { data, authorError };
		},
		/**
		 * Updates a map in the database.
		 * @param {Object} map the map object with ID that we're updating.
		 * @param {String} purchase_link the optional overriding URL this map redirects to.
		 * @param {integer} security_level the optional level of security for this map.
		 * @param {String} uploaderID the optional profile ID for the uploader of the map.
		 * @param {String} authorID the optional author ID for the creator of the map.
		 * @param {String} src the optional filename for the large version of the map image.
		 * @param {String} thumb_src the optional filename for the small version of the map image.
		 * @returns {Object} a destructured object of keys "data," containing the database result data, and "error," containing optional error data.
		 */
		async updateMap(map, purchase_link, security_level, uploaderID, authorID, src, thumb_src) {
			if (DEBUGS.pinia || DEBUGS.backend) console.log(`We're updating this map:`);
			if (DEBUGS.pinia || DEBUGS.backend) console.log(map);
			if (DEBUGS.pinia || DEBUGS.backend) if (purchase_link) console.log(`Purchase link is ${purchase_link}...`);
			if (DEBUGS.pinia || DEBUGS.backend) if (security_level) console.log(`Security level is ${security_level}...`);
			if (DEBUGS.pinia || DEBUGS.backend) if (uploaderID) console.log(`Uploader is ${uploaderID}...`);
			if (DEBUGS.pinia || DEBUGS.backend) if (authorID) console.log(`Author is ${authorID}...`);
			if (DEBUGS.pinia || DEBUGS.backend) if (src) console.log(`Src is ${src}...`);
			if (DEBUGS.pinia || DEBUGS.backend) if (thumb_src) console.log(`Thumb src is ${thumb_src}...`);

			let updateObject = { };
			if (purchase_link) updateObject.purchase_link = purchase_link;
			if (security_level) updateObject.security_level = security_level;
			if (uploaderID) updateObject.uploader = uploaderID;
			if (authorID) updateObject.author = authorID;
			if (src) updateObject.src = src;
			if (thumb_src) updateObject.thumb_src = thumb_src;

			const { error } = await supabase
				.from('maps')
				.update(updateObject)
				.eq('id', map.id);
			if (DEBUGS.pinia || DEBUGS.backend || DEBUGS.error) if (error) console.log(error);
			if (error) return { data, error };

			return await this.loadMap(map.id);
		}
	}
})