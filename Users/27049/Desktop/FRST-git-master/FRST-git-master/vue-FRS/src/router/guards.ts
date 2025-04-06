// src/router/guards.ts
import type { Router, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';
// import { useUserStore } from '@/store/modules/user'; // 如果需要根据用户信息判断权限
import NProgress from 'nprogress'; // 引入 nprogress
import 'nprogress/nprogress.css'; // 引入 nprogress 样式

NProgress.configure({ showSpinner: false }); // 配置 NProgress 不显示加载圈

// 不需要登录就能访问的页面路径白名单
const whiteList = ['/auth/login', '/auth/register']; // 根据实际情况调整

export default function setupGuards(router: Router) {
    // 全局前置守卫
    router.beforeEach(async (to, from, next) => {
        NProgress.start(); // 开始进度条

        const authStore = useAuthStore();
        const isLoggedIn = authStore.isLoggedIn; // 使用 store 中的登录状态

        if (isLoggedIn) {
            if (whiteList.includes(to.path)) {
                // 如果已登录，访问登录/注册页则重定向到首页
                next({ path: '/' });
            } else {
                // 如果已登录且访问其他页面
                // 可以在这里添加获取用户信息的逻辑 (如果 store 中没有的话)
                // const userStore = useUserStore();
                // if (!userStore.userInfo) {
                //   try {
                //     await userStore.fetchUserInfo(); // 假设 store 中有 fetchUserInfo action
                //     next();
                //   } catch (error) {
                //     // 获取用户信息失败，可能 token 失效
                //     console.error('Failed to fetch user info:', error);
                //     authStore.clearAuth();
                //     next(`/auth/login?redirect=${to.path}`); // 重定向到登录页
                //   }
                // } else {
                //   next(); // store 中有用户信息，直接放行
                // }
                next(); // 暂时直接放行
            }
        } else {
            // 未登录
            if (whiteList.includes(to.path)) {
                // 如果访问的是白名单页面，直接放行
                next();
            } else {
                // 如果访问的是需要权限的页面，重定向到登录页
                console.log(`Redirecting to login from ${to.path}`);
                next(`/auth/login?redirect=${to.path}`); // 携带重定向地址
            }
        }
    });

    // 全局解析守卫
    router.beforeResolve(async to => {
        // 例如，在导航确认之前加载数据
    });

    // 全局后置钩子
    router.afterEach((to, from) => {
        NProgress.done(); // 结束进度条

        // 设置页面标题
        const title = to.meta.title as string;
        if (title) {
            document.title = `${title} - 美食推荐平台`; // 设置页面标题，可以从 .env 读取应用名称
        } else {
            document.title = '美食推荐平台'; // 默认标题
        }
    });
} 