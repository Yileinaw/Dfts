import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
// import type { ApiResponse } from '@/types/api';
// import { searchRestaurants, getRestaurantDetail } from '@/api/restaurant'; // 假设 API 已定义

// 定义餐厅基本信息类型 (可以更详细)
export interface Restaurant {
    id: number;
    name: string;
    address?: string;
    rating?: number;
    avgPrice?: number;
    cuisine?: string;
    coverImage?: string;
}

// 定义餐厅详情类型 (继承基本信息并扩展)
export interface RestaurantDetail extends Restaurant {
    description?: string;
    phone?: string;
    openingHours?: string;
    images?: string[];
    reviews?: any[]; // 评论类型待定
    // ... 其他详情字段
}

// 定义搜索/筛选参数类型
interface SearchParams {
    keyword?: string;
    city?: string;
    cuisine?: string;
    priceRange?: string; // e.g., "0-50", "50-100"
    sortBy?: 'rating' | 'distance' | 'price';
    page?: number;
    pageSize?: number;
}

export const useRestaurantStore = defineStore('restaurant', () => {
    const restaurants = ref<Restaurant[]>([]); // 餐厅列表
    const totalRestaurants = ref(0); // 总数，用于分页
    const currentRestaurant = ref<RestaurantDetail | null>(null); // 当前查看的餐厅详情
    const loadingList = ref(false); // 列表加载状态
    const loadingDetail = ref(false); // 详情加载状态
    const searchParams = reactive<SearchParams>({ // 搜索条件
        page: 1,
        pageSize: 10,
    });

    // Action: 搜索/筛选餐厅列表
    async function fetchRestaurants(params: Partial<SearchParams> = {}, append = false) {
        loadingList.value = true;
        // 合并新的搜索参数
        Object.assign(searchParams, params);
        // 如果不是追加模式，重置页码为 1
        if (!append) {
            searchParams.page = 1;
        }

        try {
            // const res = await searchRestaurants(searchParams);
            // if (res.code === 0 && res.data) {
            //   if (append && searchParams.page && searchParams.page > 1) {
            //     restaurants.value = [...restaurants.value, ...res.data.list];
            //   } else {
            //     restaurants.value = res.data.list;
            //   }
            //   totalRestaurants.value = res.data.total;
            // }
            // 暂存假数据
            await new Promise(resolve => setTimeout(resolve, 800));
            const fetchedList = Array.from({ length: searchParams.pageSize || 10 }).map((_, i) => ({
                id: ((searchParams.page || 1) - 1) * (searchParams.pageSize || 10) + i + 1,
                name: `餐厅 ${(searchParams.page || 1)}-${i + 1} (${searchParams.keyword || '全部'})`,
                rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
                avgPrice: Math.floor(Math.random() * 200) + 30,
                cuisine: '测试菜系',
            }));
            if (append && searchParams.page && searchParams.page > 1) {
                restaurants.value = [...restaurants.value, ...fetchedList];
            } else {
                restaurants.value = fetchedList;
            }
            totalRestaurants.value = 100; // 假定总数
            console.log('Fetched fake restaurants', restaurants.value);
        } catch (error) {
            console.error('Failed to fetch restaurants:', error);
        } finally {
            loadingList.value = false;
        }
    }

    // Action: 获取餐厅详情
    async function fetchRestaurantDetail(id: number) {
        loadingDetail.value = true;
        currentRestaurant.value = null; // 先清空
        try {
            // const res = await getRestaurantDetail(id);
            // if (res.code === 0 && res.data) {
            //   currentRestaurant.value = res.data;
            // }
            // 暂存假数据
            await new Promise(resolve => setTimeout(resolve, 600));
            currentRestaurant.value = {
                id,
                name: `餐厅 ${id} 的详情`,
                address: '示例地址 123 号',
                rating: 4.5,
                avgPrice: 120,
                cuisine: '示例菜系',
                coverImage: 'https://via.placeholder.com/400x200?text=Restaurant+Image',
                description: '这是一个很棒的餐厅的详细描述。',
                phone: '123-4567890',
                openingHours: '10:00 - 22:00',
                images: [
                    'https://via.placeholder.com/600x400?text=Detail+1',
                    'https://via.placeholder.com/600x400?text=Detail+2',
                ],
                reviews: [{ id: 1, user: '用户A', comment: '味道不错！' }],
            };
            console.log('Fetched fake restaurant detail', currentRestaurant.value);
        } catch (error) {
            console.error(`Failed to fetch restaurant detail for id ${id}:`, error);
        } finally {
            loadingDetail.value = false;
        }
    }

    // Action: 加载更多餐厅 (用于无限滚动)
    async function loadMoreRestaurants() {
        if (restaurants.value.length >= totalRestaurants.value) return; // 没有更多数据了
        if (loadingList.value) return; // 正在加载中

        const nextPage = (searchParams.page || 1) + 1;
        await fetchRestaurants({ page: nextPage }, true); // 追加模式
    }

    return {
        restaurants,
        totalRestaurants,
        currentRestaurant,
        loadingList,
        loadingDetail,
        searchParams,
        fetchRestaurants,
        fetchRestaurantDetail,
        loadMoreRestaurants,
    };
}); 