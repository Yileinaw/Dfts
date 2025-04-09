import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useUserStore } from '@/stores/modules/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/HomeView.vue')
        },
        {
          path: '/about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/AboutView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = userStore.isLoggedIn;

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !isLoggedIn) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
