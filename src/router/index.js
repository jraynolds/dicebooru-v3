import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from "@/stores/auth"
import Gallery from '@/views/Gallery.vue'
import { nextTick } from 'vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Gallery,
      name: 'Gallery',
      meta: {
        title: "Dicebooru - a tag-based TTRPG map search"
      }
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
				console.log(useAuthStore());
        if (!useAuthStore().getUser) {
          console.log("Navigation to 'account' page canceled: not logged in.");
          next({ name: "Gallery" });
        }
        next();
      }
    }
  ],
});

router.afterEach((to, from) => {
  nextTick(() => {
    document.title = to.meta.title || "Dicebooru";
  })
})

export default router;
