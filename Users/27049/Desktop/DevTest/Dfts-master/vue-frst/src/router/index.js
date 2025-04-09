import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue' // 引入 MainLayout

// 路由配置
const routes = [
    {
        path: '/',
        component: MainLayout, // 使用 MainLayout 作为这些路由的布局
        children: [
            {
                path: '', // 默认子路由，匹配 '/' 
                name: 'Home',
                component: () => import('@/views/HomeView.vue') // 懒加载主页
            },
            {
                path: 'discover',
                name: 'Discover',
                component: () => import('@/views/DiscoverView.vue') // 懒加载发现美食
            },
            {
                path: 'community',
                name: 'Community',
                component: () => import('@/views/CommunityView.vue') // 懒加载美食社区
            },
            {
                path: 'personal',
                // name: 'PersonalCenter', // 父路由通常不需要 name，除非需要直接导航到父级
                component: () => import('@/views/PersonalCenter/Index.vue'), // 个人中心的容器/导航页
                meta: { requiresAuth: true }, // 标记个人中心需要登录
                children: [
                    {
                        path: '', // 默认显示个人信息
                        name: 'UserProfile',
                        component: () => import('@/views/PersonalCenter/UserProfile.vue')
                    },
                    {
                        path: 'settings',
                        name: 'AccountSettings',
                        component: () => import('@/views/PersonalCenter/AccountSettings.vue')
                    }
                    // 可以根据需要添加更多个人中心子路由
                ]
            }
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue') // 懒加载登录页 (通常不需要 MainLayout)
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue') // 懒加载注册页 (通常不需要 MainLayout)
    },
    // TODO: 添加一个 404 页面
    // {
    //   path: '/:pathMatch(.*)*', 
    //   name: 'NotFound', 
    //   component: () => import('@/views/NotFoundView.vue')
    // }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// TODO: 添加导航守卫 (Navigation Guard) 来处理登录验证
// router.beforeEach((to, from, next) => {
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
//   // const isLoggedIn = store.getters['user/isLoggedIn'] // 假设你有 Vuex/Pinia store
//   const isLoggedIn = !!localStorage.getItem('token'); // 简单的本地存储检查示例

//   if (requiresAuth && !isLoggedIn) {
//     next('/login') // 如果需要登录但未登录，重定向到登录页
//   } else if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn) {
//     next('/') // 如果已登录，访问登录/注册页则重定向到首页
//   } else {
//     next() // 否则正常导航
//   }
// })

export default router 