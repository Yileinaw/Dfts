import { get, post, del } from '@/utils/request';
import type {
    ApiResponse,
    GetCollectionsResponse,
    CollectionPayload,
} from '@/types/api';

// 定义获取收藏列表的参数类型
interface GetCollectionsParams {
    page?: number;
    pageSize?: number;
    // folderId?: number | string; // 按收藏夹筛选
}

/**
 * 获取我的收藏列表
 * @param params 分页等参数
 */
export function getMyCollections(params?: GetCollectionsParams): Promise<ApiResponse<GetCollectionsResponse>> {
    return get<GetCollectionsResponse>('/collections', params); // URL 根据后端实际接口调整
}

/**
 * 添加餐厅到收藏
 * @param data 包含 restaurantId
 */
export function addCollection(data: CollectionPayload): Promise<ApiResponse<null>> {
    return post<null>('/collections', data); // URL 根据后端实际接口调整
}

/**
 * 从收藏中移除餐厅
 * @param data 包含 restaurantId
 */
export function removeCollection(data: CollectionPayload): Promise<ApiResponse<null>> {
    // 通常使用 DELETE 方法，并将 restaurantId 作为路径参数或查询参数
    return del<null>(`/collections/${data.restaurantId}`); // URL 根据后端实际接口调整
    // 或者 return del<null>('/collections', { params: data });
}

// 如果支持收藏夹，可以添加创建/编辑/删除收藏夹的 API
// export function createCollectionFolder(name: string): Promise<ApiResponse<...>> { ... }
// export function deleteCollectionFolder(folderId: number): Promise<ApiResponse<null>> { ... }
// export function moveRestaurantToFolder(restaurantId: number, folderId: number): Promise<ApiResponse<null>> { ... } 