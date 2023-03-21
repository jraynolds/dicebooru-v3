// import Vue from 'vue'
// import VueRouter from 'vue-router'
// import Gallery from '../views/Gallery.vue'
// import { createRouter, createWebHistory } from 'vue-router'
// // import store from "@/store/index.js"

// Vue.use(VueRouter)

// const routes = [
//   {
//     path: '/',
//     name: 'Gallery',
//     component: Gallery,
// 		meta: {
// 			title: "Gallery View"
// 		}
//   },
//   // {
//   //   path: '/account',
//   //   name: 'Account',
//   //   component: () => import('../views/Account.vue'),
// 	// 	meta: {
// 	// 		requiresAuth: true,
// 	// 		title: "Account"
// 	// 	}
//   // }
//   // {
//   //   path: '/image/:imgCategory/:imgString',
//   //   name: 'About',
//   //   // route level code-splitting
//   //   // this generates a separate chunk (about.[hash].js) for this route
//   //   // which is lazy-loaded when the route is visited.
//   //   component: () => import('../views/Image.vue'),
// 	// 	props: true,
// 	// 	meta: {
// 	// 		requiresAuth: true,
// 	// 		title: "Image Viewer"
// 	// 	}
//   // }
// ]

// // const router = VueRouter.createRouter({
// //   // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
// //   history: VueRouter.createWebHashHistory(),
// //   routes, // short for `routes: routes`
// // })

// const router = createRouter({
// 	history: createWebHistory(),
// 	routes
// })

// // router.beforeEach((to, from, next) => {
// // 	let requiresAuth = to.matched.some(x => x.meta.requiresAuth);
// // 	if (requiresAuth && !store.getters["userAndAuth/getAuth"]) {
// // 		next('/');
// // 		store.commit("visuals/setLoginPanelOpen", true);
// // 		document.title = to.meta.title;
// // 	} else {
// // 		next();
// // 		document.title = to.meta.title;
// // 	}
// // })

// export default router

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from "@/stores/auth"
import Gallery from '@/views/Gallery.vue'

export default createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			component: Gallery,
			name: 'Gallery'
		},
		{
			path: '/account',
			name: 'Account',
			component: () => import('../views/Account.vue'),
			meta: {
				requiresAuth: true,
				title: "Account"
			},
			beforeEnter: (to, from, next) => {
				console.log("Checking if we can enter the account page.");
				console.log(useAuthStore());
				console.log(useAuthStore().getUser);
				if (!useAuthStore().getUser) {
					console.log("Navigation to 'account' page canceled: not logged in.");
					next({ name: "Gallery" });
				}
				next();
			}
		}
	],
});
