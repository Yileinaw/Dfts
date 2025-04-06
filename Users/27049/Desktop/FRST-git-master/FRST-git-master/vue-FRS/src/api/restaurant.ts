import { get } from '@/utils/request';
import type {
    ApiResponse,
    SearchRestaurantsResponse,
    RestaurantDetailInfo,
    FilterOptionsResponse,
} from '@/types/api';

// 定义搜索参数类型 (复用 store 中的或单独定义)
interface SearchParamsDto {
    keyword?: string;
    city?: string;
    cuisine?: string;
    priceRange?: string;
    sortBy?: string;
    lat?: number; // 纬度 (用于距离排序)
    lng?: number; // 经度
    page?: number;
    pageSize?: number;
}

/**
 * 搜索/筛选餐厅列表
 * @param params 搜索条件
 */
export function searchRestaurants(params: SearchParamsDto): Promise<ApiResponse<SearchRestaurantsResponse>> {
    return get<SearchRestaurantsResponse>('/restaurants', params); // URL 根据后端实际接口调整
}

/**
 * 获取餐厅详情
 * @param id 餐厅 ID
 */
export function getRestaurantDetail(id: number | string): Promise<ApiResponse<RestaurantDetailInfo>> {
    return get<RestaurantDetailInfo>(`/restaurants/${id}`); // URL 根据后端实际接口调整
}

/**
 * 获取发现页的筛选选项
 * @param params 可能需要城市等参数
 */
export function getFilterOptions(params?: { city?: string }): Promise<ApiResponse<FilterOptionsResponse>> {
    return get<FilterOptionsResponse>('/restaurants/filters', params); // URL 根据后端实际接口调整
}

// 可以添加其他餐厅相关的 API，例如获取推荐菜品、提交评价等 