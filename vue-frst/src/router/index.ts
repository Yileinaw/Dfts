import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import LoginView from '@/views/auth/LoginView.vue' 
import { useUserStore } from '@/stores/modules/user'

// Import the new layout and view
import PersonalCenterLayout from '@/views/PersonalCenter/PersonalCenterLayout.vue';
import MyFavoritesView from '@/views/PersonalCenter/MyFavoritesView.vue';

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
          component: () => import('@/views/AboutView.vue'), 
        },
        {
          path: '/discover',
          name: 'Discover',
          component: () => import('@/views/DiscoverView.vue')
        },
        {
          path: '/community',
          name: 'Community',
          component: () => import('@/views/CommunityView.vue')
        },
        // --- Personal Center Routes - Refactored ---
        {
          path: '/personal-center',
          component: PersonalCenterLayout, // Use the new layout
          meta: { requiresAuth: true },
          redirect: '/personal-center/profile', // Redirect base path to profile
          children: [
                {
                  path: 'profile',
                  name: 'ProfileSettings', // Rename for clarity
                  component: () => import('@/views/PersonalCenter/ProfileSettingsView.vue') // Point to the new settings view
                },
                {
                  path: 'posts', // Simpler path
                  name: 'MyPosts',
                  component: () => import('@/views/PersonalCenter/MyPostsView.vue'),
                },
                 {
                  path: 'favorites', // Simpler path
                  name: 'MyFavorites',
                  component: MyFavoritesView,
                },
                {
                  path: 'notifications', // Simpler path
                  name: 'Notifications',
                  component: () => import('@/views/PersonalCenter/NotificationsView.vue'),
                }
                // Remove the old nested Index.vue and its children if they are no longer needed
              ]
        },
        // --- End Personal Center Routes ---
      ]
    },
    {
      path: '/posts/:id',
      component: MainLayout,
      children: [
          {
              path: '',
              name: 'PostDetail',
              component: () => import('@/views/post/PostDetailView.vue'),
          }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
     {
       path: '/register',
       name: 'Register',
       component: () => import('@/views/auth/RegisterView.vue'),
       meta: { requiresGuest: true }
     }
  ]
})

// Keep the beforeEach guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = userStore.isLoggedIn;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // --- Remove specific log for MyFavorites ---
  // if (to.name === 'MyFavorites') {
  //     console.log(`[RouterGuard] Navigating to MyFavorites. requiresAuth: ${requiresAuth}, isLoggedIn: ${isLoggedIn}`);
  // }
  // --- End remove specific log ---

  if (requiresAuth && !isLoggedIn) {
    // console.log(`[RouterGuard] Auth required but not logged in. Redirecting from ${to.fullPath} to Login.`); // Remove log
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn) {
    // console.log(`[RouterGuard] Already logged in. Redirecting from ${to.name} to Home.`); // Remove log
    next('/');
  } else {
    // console.log(`[RouterGuard] Allowing navigation to ${to.fullPath}`); // Remove log
    next();
  }
})

export default router
