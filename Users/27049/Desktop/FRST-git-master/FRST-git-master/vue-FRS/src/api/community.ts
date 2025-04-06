import { get, post } from '@/utils/request';
import type {
    ApiResponse,
    FeedResponse,
    FollowUserPayload,
} from '@/types/api';

// 定义获取动态流的参数类型
interface GetFeedParams {
    type: 'recommended' | 'following';
    page?: number;
    pageSize?: number;
    // 可以添加 lastId 或 timestamp 用于优化分页加载
}

/**
 * 获取动态信息流
 * @param params 查询参数 (类型, 分页等)
 */
export function getFeed(params: GetFeedParams): Promise<ApiResponse<FeedResponse>> {
    return get<FeedResponse>('/community/feed', params); // URL 根据后端实际接口调整
}

/**
 * 关注用户
 * @param userId 要关注的用户 ID
 */
export function followUser(userId: number): Promise<ApiResponse<null>> {
    const payload: FollowUserPayload = { userId, follow: true };
    return post<null>('/user/follow', payload); // URL 根据后端实际接口调整
}

/**
 * 取消关注用户
 * @param userId 要取消关注的用户 ID
 */
export function unfollowUser(userId: number): Promise<ApiResponse<null>> {
    const payload: FollowUserPayload = { userId, follow: false };
    return post<null>('/user/unfollow', payload); // URL 根据后端实际接口调整
}

// 可以添加获取关注列表、粉丝列表等 API 