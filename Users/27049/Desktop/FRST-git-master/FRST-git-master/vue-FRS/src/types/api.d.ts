// src/types/api.d.ts
// API 相关类型定义

export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

// 示例：用户信息的类型
export interface UserInfo {
    id: number;
    username: string;
    avatar?: string;
    email?: string; // 补充邮箱字段
    phone?: string; // 补充手机号字段
}

// 示例：登录接口响应数据类型
export interface LoginResponse {
    token: string;
    userInfo: UserInfo;
}

// 更新用户资料的请求体类型 (允许部分更新)
export type UpdateProfilePayload = Partial<Omit<UserInfo, 'id'> & { nickname?: string; gender?: number; bio?: string }>;

// 修改密码的请求体类型
export interface ChangePasswordPayload {
    oldPassword?: string; // 旧密码 (如果需要验证)
    newPassword?: string;
    confirmPassword?: string; // 确认新密码 (前端校验用)
    smsCode?: string; // 或者通过短信验证码修改
}

// 绑定/解绑邮箱/手机的请求类型
export interface BindPayload {
    email?: string;
    phone?: string;
    smsCode: string; // 通常需要验证码
}

// 餐厅基本信息类型 (复用 store 中的定义可能更好，或者在这里独立定义)
export interface RestaurantInfo {
    id: number;
    name: string;
    address?: string;
    rating?: number;
    avgPrice?: number;
    cuisine?: string;
    coverImage?: string;
    distance?: number; // 距离 (如果需要)
    tags?: string[]; // 标签
}

// 餐厅详情类型
export interface RestaurantDetailInfo extends RestaurantInfo {
    description?: string;
    phone?: string;
    openingHours?: string;
    images?: string[];
    // ... 其他详情
}

// 分页列表响应类型
export interface PaginatedList<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
}

// 搜索餐厅 API 的响应类型
export type SearchRestaurantsResponse = PaginatedList<RestaurantInfo>;

// 首页数据类型 (示例)
export interface HomeDataResponse {
    recommendedRestaurants: RestaurantInfo[];
    popularCategories: { id: number; name: string; icon?: string }[];
    nearbyHotspots: RestaurantInfo[]; // 附近热门
    // ... 其他首页数据
}

// 获取筛选选项的 API 响应类型 (示例)
export interface FilterOptionsResponse {
    cuisines: { value: string; label: string }[];
    priceRanges: { value: string; label: string }[];
    scenes: { value: string; label: string }[]; // 场景
}

// --- 社区相关类型 --- //

// 帖子作者简要信息
export interface PostAuthorInfo {
    id: number;
    username: string;
    avatar?: string;
}

// 帖子信息类型
export interface PostInfo {
    id: number | string;
    author: PostAuthorInfo;
    content: string;
    images?: string[];
    location?: string;
    tags?: string[];
    likes: number;
    isLiked: boolean;
    commentsCount: number;
    createdAt: string; // ISO 8601 格式字符串
}

// 评论信息类型
export interface CommentInfo {
    id: number | string;
    postId: number | string;
    author: PostAuthorInfo;
    content: string;
    replyTo?: PostAuthorInfo; // 回复的用户信息
    createdAt: string;
}

// 获取动态流 API 响应类型
export type FeedResponse = PaginatedList<PostInfo>;

// 获取评论列表 API 响应类型
export type CommentsResponse = PaginatedList<CommentInfo>;

// 发布动态请求体类型
export interface CreatePostPayload {
    content: string;
    images?: string[]; // 图片 URL 列表 (假设已上传)
    location?: string;
    tags?: string[];
}

// 发表评论请求体类型
export interface CreateCommentPayload {
    postId: number | string;
    content: string;
    replyToUserId?: number; // 回复给哪个用户的 ID
}

// 点赞/取消点赞请求体 (可能只需要 post ID)
export interface LikePostPayload {
    postId: number | string;
    like: boolean; // true 点赞, false 取消点赞
}

// 关注/取关用户请求体
export interface FollowUserPayload {
    userId: number;
    follow: boolean; // true 关注, false 取消关注
}

// --- 收藏相关类型 --- //

// 获取收藏列表 API 响应类型 (假设直接返回餐厅列表)
export type GetCollectionsResponse = PaginatedList<RestaurantInfo>;

// 添加/移除收藏请求体类型
export interface CollectionPayload {
    restaurantId: number;
    // folderId?: number | string; // 如果支持收藏夹
} 