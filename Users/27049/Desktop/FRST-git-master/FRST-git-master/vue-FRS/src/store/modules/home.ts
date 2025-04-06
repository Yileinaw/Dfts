import { defineStore } from 'pinia';
import { ref } from 'vue';
// import type { Restaurant } from './restaurant'; // 假设 restaurant store 定义了类型

// 假设首页需要推荐餐厅列表和分类信息
interface HomeData {
    recommendedRestaurants: any[]; // 类型待定，可能来自 restaurant store 或单独定义
    categories: any[]; // 类型待定
}

export const useHomeStore = defineStore('home', () => {
    const homeData = ref<HomeData | null>(null);
    const loading = ref(false);

    // Action: 获取首页数据
    async function fetchHomeData() {
        if (homeData.value) return; // 如果已有数据，不再重复获取 (根据需要调整)

        loading.value = true;
        try {
            // 调用 API 获取首页数据 (需要先定义 api/home.ts)
            // const res = await getHomeData();
            // if (res.code === 0 && res.data) {
            //   homeData.value = res.data;
            // }
            // 暂存假数据
            await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
            homeData.value = {
                recommendedRestaurants: [{ id: 1, name: '示例推荐餐厅1' }, { id: 2, name: '示例推荐餐厅2' }],
                categories: [{ id: 1, name: '火锅' }, { id: 2, name: '烧烤' }],
            };
            console.log('Fetched fake home data', homeData.value);
        } catch (error) {
            console.error('Failed to fetch home data:', error);
        } finally {
            loading.value = false;
        }
    }

    return {
        homeData,
        loading,
        fetchHomeData,
    };
}); 