// src/services/PostService.ts
import http from '../http';
import type { Post, User, Comment } from '../types/models';

// 定义创建帖子请求的数据类型
interface CreatePostData {
    title: string;
    content?: string;
}

// 定义更新帖子请求的数据类型
interface UpdatePostData {
    title?: string;
    content?: string;
}

// 定义获取帖子列表的响应类型 (根据后端返回)
interface GetPostsResponse {
    posts: Post[];
    totalCount: number;
}

// 定义获取单个帖子的响应类型
interface GetPostResponse {
    post: Post;
}

// 定义创建/更新/删除帖子的通用响应类型 (根据后端返回)
interface PostMutationResponse {
    message: string;
    post: Post;
}

// Define type for getting comments (matches backend response)
interface GetCommentsResponse {
    comments: Comment[];
    totalCount: number;
}

// Define type for creating a comment response (matches backend response)
interface CreateCommentResponse {
    message: string;
    comment: Comment;
}

// Define type for paginated posts response
interface PaginatedPostsResponse {
    posts: Post[];
    totalCount: number;
}

export const PostService = {
    // 创建帖子 (需要认证)
    async createPost(data: CreatePostData): Promise<PostMutationResponse> {
        const response = await http.post<PostMutationResponse>('/posts', data);
        return response.data;
    },

    // 获取帖子列表 (公开，支持分页)
    async getAllPosts(params?: { page?: number; limit?: number; sortBy?: string }): Promise<GetPostsResponse> {
        const response = await http.get<GetPostsResponse>('/posts', { params });
        return response.data;
    },

    // 获取单个帖子 (公开)
    async getPostById(id: number): Promise<GetPostResponse> {
        const response = await http.get<GetPostResponse>(`/posts/${id}`);
        return response.data;
    },

    // 更新帖子 (需要认证)
    async updatePost(id: number, data: UpdatePostData): Promise<PostMutationResponse> {
        const response = await http.put<PostMutationResponse>(`/posts/${id}`, data);
        return response.data;
    },

    // 删除帖子 (需要认证)
    async deletePost(id: number): Promise<PostMutationResponse> {
        const response = await http.delete<PostMutationResponse>(`/posts/${id}`);
        return response.data; // 后端返回了被删除的帖子信息
    },

    // --- Like/Unlike functions ---
    async likePost(postId: number): Promise<void> { // Returns 204 No Content
        await http.post(`/posts/${postId}/like`);
    },

    async unlikePost(postId: number): Promise<void> { // Returns 204 No Content
        await http.delete(`/posts/${postId}/like`);
    },

    // --- Add Favorite/Unfavorite functions ---
    async favoritePost(postId: number): Promise<void> {
        await http.post(`/posts/${postId}/favorite`);
    },

    async unfavoritePost(postId: number): Promise<void> {
        await http.delete(`/posts/${postId}/favorite`);
    },
    // --- End Add Favorite/Unfavorite functions ---

    // --- Comment functions ---

    /**
     * Get comments for a specific post.
     * Returns an array of Comment objects.
     */
    async getCommentsByPostId(postId: number): Promise<Comment[]> {
        // Backend now returns the array directly
        const response = await http.get<Comment[]>(`/posts/${postId}/comments`);
        return response.data;
    },

    /**
     * Create a new comment or reply for a post.
     * Requires text and optionally parentId.
     */
    async createComment(postId: number, data: { text: string; parentId?: number | null }): Promise<CreateCommentResponse> {
        const response = await http.post<CreateCommentResponse>(`/posts/${postId}/comments`, data);
        return response.data;
    },

    /**
     * Delete a comment.
     */
    async deleteComment(commentId: number): Promise<void> { // Returns 204 No Content
        await http.delete(`/comments/${commentId}`);
    },

    // (如果需要) 创建用户个人资料更新服务
    // async updateUserProfile(data: { name?: string }): Promise<{message: string, user: Omit<User, 'password'>}> {
    //   const response = await http.put<{message: string, user: Omit<User, 'password'>}>('/users/profile', data);
    //   return response.data;
    // }

    // --- Add method to get current user's posts --- 
    async getMyPosts(params?: { page?: number; limit?: number }): Promise<PaginatedPostsResponse> {
        // Call GET /api/users/me/posts
        const response = await http.get<PaginatedPostsResponse>('/users/me/posts', { params });
        return response.data;
    }
    // --- End add method ---
};
