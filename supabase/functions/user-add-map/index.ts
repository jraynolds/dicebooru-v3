// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// import {serve} from "https://deno.land/std/http/server.ts";
// import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
// import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
// import { corsHeaders } from '../_shared/cors.ts'

// const MB = 1024 * 1024

// serve(async (req: Request) => {
//   // This is needed if you're planning to invoke your function from a browser.
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders });
//   }

//   const body = req.request.body({ type: 'form-data' });
//   const formData = await body.value.read({
//     // Need to set the maxSize so files will be stored in memory.
//     // This is necessary as Edge Functions don't have disk write access.
//     // We are setting the max size as 10MB (an Edge Function has a max memory limit of 150MB)
//     // For more config options, check: https://deno.land/x/oak@v11.1.0/mod.ts?s=FormDataReadOptions
//     maxSize: 20 * MB,
//   });
//   // if (!formData.files || !formData.files.length) {
//   //   ctx.response.status = 400
//   //   ctx.response.body = 'missing file'
//   //   return
//   // }

// 	try {
// 		// Create a Supabase client with the Auth context of the logged in user.
// 		const supabaseClient = createClient(
// 			// Supabase API URL - env var exported by default.
// 			Deno.env.get('SUPABASE_URL') ?? '',
// 			// Supabase API ANON KEY - env var exported by default.
// 			Deno.env.get('SUPABASE_ANON_KEY') ?? '',
// 			// Create client with Auth context of the user that called the function.
// 			// This way your row-level-security (RLS) policies are applied.
// 			{ global: { headers: { Authorization: req.headers.get('Authorization')! } } }
// 		);
// 		// Now we can get the session or user object
// 		const {
// 			data: { user },
// 		} = await supabaseClient.auth.getUser();

// 		const image: FormFile = form.files.image as FormFile;
// 		const thumb: FormFile = form.files.thumb as FormFile;
// 		const author: string = form.fields.author as string;

// 		//upload image to Storage
// 		const imageName: string = uuidv4() + image.filename.split('.').pop();
// 		if (!imageName) throw error;

// 		const { data, error } = await supabaseClient.storage
// 			.from('maps')
// 			.upload(imageName, image.content!.buffer, {
// 				contentType: image.contentType,
// 				cacheControl: '3600',
// 				upsert: false
// 		});
// 		console.log(data);
// 		if (error) console.error(error);

// 		return new Response(JSON.stringify({ user, data }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 200,
//     })
//   } catch (error) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 400,
//     })
//   }
// })


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
import {multiParser, FormFile} from 'https://deno.land/x/multiparser@0.114.0/mod.ts'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

serve(async (req) => {

	if (req.method === 'OPTIONS') {
		return new Response('ok', {headers: corsHeaders})
	}

	try {

		const supabaseClient = createClient(
				Deno.env.get('SUPABASE_URL') ?? '',
				Deno.env.get('SUPABASE_ANON_KEY') ?? '',
				{global: {headers: {Authorization: req.headers.get('Authorization')!}}}
		);

		const form = await multiParser(req);
		if (!form) {
			return new Response(JSON.stringify({success: false, error: 'no file found'}), {
				headers: {...corsHeaders, 'Content-Type': 'application/json'},
				status: 400
			});
		}

		const image: FormFile = form.files.image as FormFile;
		const thumb: FormFile = form.files.thumb as FormFile;
		const author: string = form.fields.author as string;
		const tags: string = form.fields.tags as string;

		const {
			data: {user},
		} = await supabaseClient.auth.getUser();

		// let {data: profile} = await supabaseClient
		// 		.from('profiles')
		// 		.select('avatar_url')
		// 		.eq('id', user.id)
		// 		.limit(1)
		// 		.single();

		// if (profile && profile.avatar_url) {
		// 	const {error} = await supabaseClient.storage.from('avatars').remove([profile.avatar_url]);
		// 	if (error) {
		// 		return new Response(JSON.stringify({success: false, error: error.message}), {
		// 			headers: {...corsHeaders, 'Content-Type': 'application/json'},
		// 			status: 400
		// 		});
		// 	}
		// }

		const uuid: string = uuidv4();

		const imageName: string = `${uuid}.${image.filename.split('.').pop()}`;
		if (!imageName) throw error;

		const { data: imageData, error: imageError } = await supabaseClient.storage
			.from('maps')
			.upload(imageName, image.content!.buffer, {
				contentType: image.contentType,
				cacheControl: '3600',
				upsert: false
		});
		console.log(imageData);
		if (imageError) {
			console.error(imageError);
			throw(imageError);
		}

		const thumbName: string = `${uuid}.${thumb.filename.split('.').pop()}`;
		if (!thumbName) throw error;

		const { data: thumbData, error: thumbError } = await supabaseClient.storage
			.from('thumbs')
			.upload(thumbName, thumb.content!.buffer, {
				contentType: thumb.contentType,
				cacheControl: '3600',
				upsert: false
		});
		console.log(thumbData);
		if (thumbError) {
			console.error(thumbError);
			throw(thumbError);
		}

		const { data: mapData, error: mapError } = await supabaseClient
			.from('maps')
			.insert([{
				uploader: user.id,
				src: imageName,
				thumb_src: thumbName
		}]);
		console.log(mapData);
		if (mapError) {
			console.error(mapError);
			throw(mapError);
		}

		const split_tags = tags.split(',');
		if (split_tags.length > 0) {
			const map_tags = [];
			for (const split_tag of split_tags) map_tags.push({ map: mapData.id, tag: split_tag });
			const { data: mapTagsData, error: mapTagsError } = await supabaseClient
				.from('maps_tags')
				.insert(map_tags);
			console.log(mapTagsData);
			if (mapTagsError) {
				console.error(mapTagsError);
				throw(mapTagsError);
			}
		}

		return new Response(JSON.stringify({ mapIDsuccess: true, error: null}), {
			headers: {...corsHeaders, 'Content-Type': 'application/json'},
			status: 200
		});

	} catch (error) {
		return new Response(JSON.stringify({success: false, error: error.message}), {
			headers: {...corsHeaders, 'Content-Type': 'application/json'},
			status: 400
		});
	}
});


// console.log("Hello from Functions!")

// serve(async (req) => {
// 	// This is needed if you're planning to invoke your function from a browser.
// 	if (req.method === 'OPTIONS') {
// 		return new Response('ok', { headers: corsHeaders })
// 	}

// 	try {
// 		const { 
// 			image,
// 			thumb,
// 			author,
// 			tags
// 		} = await req.formData();

// 		const data = {
// 			message: "Map successfully received!"
// 		}

// 		return new Response(JSON.stringify(data), {
// 			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 			status: 200,
// 		})
// 	} catch (error) {
// 		return new Response(JSON.stringify({ error: error.message }), {
// 			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 			status: 400,
// 		})
// 	}
// })

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'

// Access token: sbp_9d2a931bc861afe99973240da2a91c68cf461fe2

// This example shows how to use Edge Functions to read incoming multipart/form-data request,
// and write files to Supabase Storage and other fields to a database table.

// import { Application } from 'oak'
// import { createClient } from '@supabase/supabase-js'

// const MB = 1024 * 1024

// const app = new Application()

// app.use(async (ctx) => {
//   const body = ctx.request.body({ type: 'form-data' })
//   const formData = await body.value.read({
//     // Need to set the maxSize so files will be stored in memory.
//     // This is necessary as Edge Functions don't have disk write access.
//     // We are setting the max size as 10MB (an Edge Function has a max memory limit of 150MB)
//     // For more config options, check: https://deno.land/x/oak@v11.1.0/mod.ts?s=FormDataReadOptions
//     maxSize: 10 * MB,
//   })
//   if (!formData.files || !formData.files.length) {
//     ctx.response.status = 400
//     ctx.response.body = 'missing file'
//     return
//   }

//   const supabaseClient = createClient(
//     // Supabase API URL - env var exported by default.
//     Deno.env.get('SUPABASE_URL')!,
//     // Supabase API ANON KEY - env var exported by default.
//     Deno.env.get('SUPABASE_ANON_KEY')!
//   )

//   //upload image to Storage
//   const file = formData.files[0]
//   const timestamp = +new Date()
//   const uploadName = `${file.name}-${timestamp}`
//   const { data: upload, error: uploadError } = await supabaseClient.storage
//     .from('images')
//     .upload(uploadName, file.content!.buffer, {
//       contentType: file.contentType,
//       cacheControl: '3600',
//       upsert: false,
//     })
//   if (uploadError) {
//     console.error(uploadError)
//     ctx.response.status = 500
//     ctx.response.body = 'Failed to upload the file'
//     return
//   }

//   // insert record to messages table
//   const { error } = await supabaseClient
//     .from('comments')
//     .insert({ message: formData.fields!.message || '', image_path: upload.path })
//   if (error) {
//     console.error(error)
//     ctx.response.status = 500
//     ctx.response.body = 'Fail to add the record'
//     return
//   }

//   ctx.response.status = 201
//   ctx.response.body = 'Success!'
// })

// await app.listen({ port: 8000 })

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// import { serve } from 'std/server'
// import { createClient, SupabaseClient } from '@supabase/supabase-js'
// import { corsHeaders } from "../_shared/cors"

// interface Task {
//   name: string
//   status: number
// }

// async function getTask(supabaseClient: SupabaseClient, id: string) {
//   const { data: task, error } = await supabaseClient.from('tasks').select('*').eq('id', id)
//   if (error) throw error

//   return new Response(JSON.stringify({ task }), {
//     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//     status: 200,
//   })
// }

// async function getAllTasks(supabaseClient: SupabaseClient) {
//   const { data: tasks, error } = await supabaseClient.from('tasks').select('*')
//   if (error) throw error

//   return new Response(JSON.stringify({ tasks }), {
//     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//     status: 200,
//   })
// }

// async function deleteTask(supabaseClient: SupabaseClient, id: string) {
//   const { error } = await supabaseClient.from('tasks').delete().eq('id', id)
//   if (error) throw error

//   return new Response(JSON.stringify({}), {
//     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//     status: 200,
//   })
// }

// async function updateTask(supabaseClient: SupabaseClient, id: string, task: Task) {
//   const { error } = await supabaseClient.from('tasks').update(task).eq('id', id)
//   if (error) throw error

//   return new Response(JSON.stringify({ task }), {
//     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//     status: 200,
//   })
// }

// async function createTask(supabaseClient: SupabaseClient, task: Task) {
//   const { error } = await supabaseClient.from('tasks').insert(task)
//   if (error) throw error

//   return new Response(JSON.stringify({ task }), {
//     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//     status: 200,
//   })
// }

// serve(async (req) => {
//   const { url, method } = req

//   // This is needed if you're planning to invoke your function from a browser.
//   if (method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }

//   try {
//     // Create a Supabase client with the Auth context of the logged in user.
//     const supabaseClient = createClient(
//       // Supabase API URL - env var exported by default.
//       Deno.env.get('SUPABASE_URL') ?? '',
//       // Supabase API ANON KEY - env var exported by default.
//       Deno.env.get('SUPABASE_ANON_KEY') ?? '',
//       // Create client with Auth context of the user that called the function.
//       // This way your row-level-security (RLS) policies are applied.
//       { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
//     )

//     // For more details on URLPattern, check https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
//     const taskPattern = new URLPattern({ pathname: '/restful-tasks/:id' })
//     const matchingPath = taskPattern.exec(url)
//     const id = matchingPath ? matchingPath.pathname.groups.id : null

//     let task = null
//     if (method === 'POST' || method === 'PUT') {
//       const body = await req.json()
//       task = body.task
//     }

//     // call relevant method based on method and id
//     switch (true) {
//       case id && method === 'GET':
//         return getTask(supabaseClient, id as string)
//       case id && method === 'PUT':
//         return updateTask(supabaseClient, id as string, task)
//       case id && method === 'DELETE':
//         return deleteTask(supabaseClient, id as string)
//       case method === 'POST':
//         return createTask(supabaseClient, task)
//       case method === 'GET':
//         return getAllTasks(supabaseClient)
//       default:
//         return getAllTasks(supabaseClient)
//     }
//   } catch (error) {
//     console.error(error)

//     return new Response(JSON.stringify({ error: error.message }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 400,
//     })
//   }
// })