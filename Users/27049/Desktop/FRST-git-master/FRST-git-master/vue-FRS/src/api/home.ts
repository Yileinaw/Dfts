import { get } from '@/utils/request';
import type { ApiResponse, HomeDataResponse } from '@/types/api';

/**
 * 获取首页展示数据
 * 可能需要城市等参数
 * @param params 查询参数，例如 { city: string }
 */
export function getHomeData(params?: { city?: string }): Promise<ApiResponse<HomeDataResponse>> {
    return get<HomeDataResponse>('/home/data', params); // URL 根据后端实际接口调整
}

// 可以添加其他首页相关的 API，例如获取 banner、公告等 