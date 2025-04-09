import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
// Remove synchronous import for HomeView
// import HomeView from '@/views/HomeView.vue' 
import LoginView from '@/views/auth/LoginView.vue' 
import { useUserStore } from '@/stores/modules/user'

// Remove log
// console.log('Router file being processed...'); 

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
          component: () => import('@/views/HomeView.vue') // Revert to lazy loading
        },
        {
          path: '/about',
          name: 'about',
          component: () => import('@/views/AboutView.vue'), // Keep About for now
        },
        // --- Add Discover Route ---
        {
          path: '/discover',
          name: 'Discover',
          component: () => import('@/views/DiscoverView.vue')
        },
        // --- Add Community Route ---
        {
          path: '/community',
          name: 'Community',
          component: () => import('@/views/CommunityView.vue')
        },
        {
          path: '/personal-center', // Keep Personal Center
          meta: { requiresAuth: true },
          redirect: '/personal-center/profile', // Keep redirect
          children: [
            // Add a nested child route to load Index.vue within MainLayout
            {
              path: '', // Matches /personal-center itself
              component: () => import('@/views/PersonalCenter/Index.vue'),
              // Move profile, settings, favorites here as children of Index.vue
              children: [
                {
                  path: 'profile',
                  name: 'UserProfile',
                  component: () => import('@/views/PersonalCenter/UserProfile.vue')
                },
                {
                  path: 'settings',
                  name: 'AccountSettings',
                  component: () => import('@/views/PersonalCenter/AccountSettings.vue')
                },
                {
                  path: 'favorites',
                  name: 'MyFavorites',
                  component: () => import('@/views/PersonalCenter/MyFavoritesView.vue'),
                  meta: { requiresAuth: true }
                },
                // Add route for My Posts
                {
                  path: 'my-posts',
                  name: 'MyPosts',
                  component: () => import('@/views/PersonalCenter/MyPostsView.vue'),
                  meta: { requiresAuth: true }
                },
                // Add route for Notifications
                {
                  path: 'notifications',
                  name: 'Notifications',
                  component: () => import('@/views/PersonalCenter/NotificationsView.vue'),
                  meta: { requiresAuth: true }
                }
              ]
            }
          ]
        },
        // REMOVED PostDetail from here
      ]
    },
    // ADD PostDetail Route at the top level, sibling to '/' and '/login'
    {
      path: '/posts/:id', // Temporarily remove regex for testing
      component: MainLayout, // Apply MainLayout to the detail page as well
      children: [
          {
              path: '', // Matches the /posts/:id path itself
              name: 'PostDetail', // Add name to the actual component route
              component: () => import('@/views/post/PostDetailView.vue'),
              meta: { requiresAuth: false } 
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
       path: '/register', // Keep Register route if needed
       name: 'Register',
       component: () => import('@/views/auth/RegisterView.vue'),
       meta: { requiresGuest: true }
     }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = userStore.isLoggedIn;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn) { // Adjusted condition
    next('/');
  } else {
    next();
  }
})

export default router
