import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RestaurantInfo } from '@/types/api'; // 复用餐厅信息类型
// import { getMyCollections, addCollection, removeCollection } from '@/api/collection'; // 假设 API 已定义

// 可以定义收藏夹类型 (如果需要)
// interface CollectionFolder {
//   id: number | string;
//   name: string;
//   count: number;
// }

export const useCollectionStore = defineStore('collection', () => {
    const collectedRestaurants = ref<RestaurantInfo[]>([]); // 收藏的餐厅列表
    const loadingCollections = ref(false);
    // const folders = ref<CollectionFolder[]>([]); // 收藏夹列表

    // Action: 获取收藏列表
    async function fetchCollections() {
        loadingCollections.value = true;
        try {
            // const res = await getMyCollections(); // 调用 API
            // if (res.code === 0 && res.data) {
            //   collectedRestaurants.value = res.data.list; // 假设 API 返回列表
            //   // folders.value = res.data.folders; // 如果有收藏夹
            // }
            // 暂存假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            collectedRestaurants.value = [
                { id: 101, name: '收藏的餐厅A', rating: 4.8, avgPrice: 150, cuisine: '特色菜' },
                { id: 102, name: '收藏的餐厅B', rating: 4.2, avgPrice: 80, cuisine: '家常菜' },
            ];
            console.log('Fetched fake collections', collectedRestaurants.value);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
        } finally {
            loadingCollections.value = false;
        }
    }

    // Action: 添加收藏 (通常在餐厅详情页或列表项中触发)
    async function addRestaurantToCollection(restaurantId: number) {
        try {
            // await addCollection({ restaurantId });
            console.log(`Added restaurant ${restaurantId} to collection`);
            // 添加成功后可能需要刷新列表或更新状态
            // fetchCollections(); // 或乐观更新
            // 假设添加成功
            const exists = collectedRestaurants.value.some(r => r.id === restaurantId);
            if (!exists) {
                // 为了演示，临时添加一个假数据（实际应从 API 获取完整信息）
                collectedRestaurants.value.push({ id: restaurantId, name: `新收藏 ${restaurantId}`, rating: 4.0 });
            }
            return true;
        } catch (error) {
            console.error(`Failed to add restaurant ${restaurantId} to collection:`, error);
            return false;
        }
    }

    // Action: 移除收藏
    async function removeRestaurantFromCollection(restaurantId: number) {
        try {
            // await removeCollection({ restaurantId });
            console.log(`Removed restaurant ${restaurantId} from collection`);
            // 移除成功后更新列表
            collectedRestaurants.value = collectedRestaurants.value.filter(r => r.id !== restaurantId);
            return true;
        } catch (error) {
            console.error(`Failed to remove restaurant ${restaurantId} from collection:`, error);
            return false;
        }
    }

    // Getter: 检查某个餐厅是否已收藏
    const isCollected = (restaurantId: number): boolean => {
        return collectedRestaurants.value.some(r => r.id === restaurantId);
    };

    return {
        collectedRestaurants,
        loadingCollections,
        fetchCollections,
        addRestaurantToCollection,
        removeRestaurantFromCollection,
        isCollected,
    };
}); 