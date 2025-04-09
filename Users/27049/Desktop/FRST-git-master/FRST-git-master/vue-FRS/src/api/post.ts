import { get, post, del } from '@/utils/request'; // 假设 request.ts 导出了 del
import type {
    ApiResponse,
    PostInfo,
    CreatePostPayload,
    CommentsResponse,
    CreateCommentPayload,
    LikePostPayload,
} from '@/types/api';

// 定义获取评论列表的参数类型
interface GetCommentsParams {
    postId: number | string;
    page?: number;
    pageSize?: number;
}

/**
 * 创建新帖子/动态
 * @param data 帖子内容
 */
export function createPost(data: CreatePostPayload): Promise<ApiResponse<PostInfo>> { // 成功后通常返回新帖子的信息
    return post<PostInfo>('/posts', data); // URL 根据后端实际接口调整
}

/**
 * 获取单个帖子详情
 * @param postId 帖子 ID
 */
export function getPostDetail(postId: number | string): Promise<ApiResponse<PostInfo>> {
    return get<PostInfo>(`/posts/${postId}`); // URL 根据后端实际接口调整
}

/**
 * 获取帖子的评论列表
 * @param params postId 和分页参数
 */
export function getComments(params: GetCommentsParams): Promise<ApiResponse<CommentsResponse>> {
    return get<CommentsResponse>(`/posts/${params.postId}/comments`, { page: params.page, pageSize: params.pageSize }); // URL 根据后端实际接口调整
}

/**
 * 发表评论
 * @param data 评论内容
 */
export function postComment(data: CreateCommentPayload): Promise<ApiResponse<CommentInfo>> { // 成功后通常返回新评论信息
    return post<CommentInfo>(`/posts/${data.postId}/comments`, data); // URL 根据后端实际接口调整
}

/**
 * 点赞或取消点赞帖子
 * @param postId 帖子 ID
 * @param like true 为点赞, false 为取消
 */
export function likePost(postId: number | string, like: boolean): Promise<ApiResponse<null>> {
    const payload: LikePostPayload = { postId, like };
    // API 设计可以是 POST /posts/{postId}/like 或 DELETE /posts/{postId}/like
    // 或者统一用 POST，通过 payload 区分
    if (like) {
        return post<null>(`/posts/${postId}/like`, {}); // URL 根据后端实际接口调整
    } else {
        return del<null>(`/posts/${postId}/like`, {}); // URL 根据后端实际接口调整
        // 或者 return post<null>(`/posts/like/cancel`, { postId });
    }
}

/**
 * 删除帖子 (如果允许)
 * @param postId 帖子 ID
 */
export function deletePost(postId: number | string): Promise<ApiResponse<null>> {
    return del<null>(`/posts/${postId}`); // URL 根据后端实际接口调整
}

/**
 * 删除评论 (如果允许)
 * @param commentId 评论 ID
 */
export function deleteComment(commentId: number | string): Promise<ApiResponse<null>> {
    return del<null>(`/comments/${commentId}`); // URL 根据后端实际接口调整
}

// 可以添加上传图片/视频到服务器的 API (如果发布动态需要先上传)
// export function uploadMedia(file: File): Promise<ApiResponse<{ mediaUrl: string }>> { ... }
