import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import HomeView from '@/views/home/HomeView.vue';
import LoginView from '@/views/auth/LoginView.vue';
import RegisterView from '@/views/auth/RegisterView.vue';
import CommunityView from '@/views/CommunityView.vue';
import DiscoveryView from '@/views/discover/DiscoverView.vue';
import ProfileView from '@/views/profile/Index.vue';
import RestaurantDetail from '@/views/restaurant/DetailView.vue';
import PostDetail from '@/views/PostDetail.vue';
import SettingsView from '@/views/profile/Settings.vue';
import FoodDetailView from '@/views/food/FoodDetailView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: DefaultLayout,
        children: [
            {
                path: '', // 首页
                name: 'Home',
                component: HomeView,
                meta: { title: '首页', requiresAuth: false },
            },
            {
                path: 'discover', // 发现页
                name: 'Discover',
                component: DiscoveryView,
                meta: { title: '发现' },
            },
            {
                path: 'community', // 社区页
                name: 'Community',
                component: CommunityView,
                meta: { title: '社区', requiresAuth: false },
            },
            {
                path: 'profile', // 用户中心
                name: 'Profile',
                component: ProfileView,
                meta: { title: '用户中心', requiresAuth: true },
            },
            {
                path: '/profile/settings',
                name: 'ProfileSettings',
                component: SettingsView,
                meta: { title: '账户设置', requiresAuth: true },
            },
            {
                path: 'restaurant/:id', // 餐厅详情页
                name: 'RestaurantDetail',
                component: RestaurantDetail,
                props: true, // 传递路由参数 id 作为 prop
                meta: { title: '餐厅详情' },
            },
            {
                path: 'post/:id', // 帖子详情页
                name: 'PostDetail',
                component: PostDetail,
                meta: { title: '帖子详情', requiresAuth: false },
            },
            {
                path: 'collections', // 我的收藏
                name: 'Collections',
                component: () => import('@/views/collection/Index.vue'),
                meta: { title: '我的收藏', requiresAuth: true },
            },
            // ... 其他需要默认布局的页面
            // {
            //   path: 'collections', // 我的收藏
            //   name: 'Collections',
            //   component: () => import('@/views/collection/Index.vue'),
            //   meta: { title: '我的收藏', requiresAuth: true },
            // },
        ],
    },
    {
        path: '/food/:id',
        component: DefaultLayout,
        children: [
            {
                path: '',
                name: 'FoodDetailView',
                component: FoodDetailView,
                props: true,
                meta: { title: '食品详情' }
            }
        ]
    },
    {
        path: '/auth',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                name: 'Login',
                component: LoginView,
                meta: { title: '登录', requiresGuest: true },
            },
            {
                path: 'register',
                name: 'Register',
                component: RegisterView,
                meta: { title: '注册', requiresGuest: true },
            },
            // ... 其他认证相关页面 (例如忘记密码)
        ],
    },
    // 404 页面 - 放在最后
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/errors/404.vue'),
        meta: { title: '页面未找到' },
    },
];

export default routes;