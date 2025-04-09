// vue-frst/src/types/models.ts

// 用户模型 (与后端 Prisma 模型对应，但不包含 password)
export interface User {
    id: number;
    email: string;
    password?: string; // 通常不在前端使用，但可以定义
    name: string | null; // Prisma 中 String? 对应 string | null
    createdAt: string; // Prisma DateTime 对应 string (ISO 8601)
    updatedAt: string;
    posts?: Post[]; // 关联的帖子 (可选，根据 API 返回情况)
}

// 帖子模型 (与后端 Prisma 模型对应)
export interface Post {
    id: number;
    title: string;
    content: string | null;
    createdAt: string;
    updatedAt: string;
    authorId: number;
    author?: Pick<User, 'id' | 'name' | 'email'>; // 关联的作者信息 (部分字段)
    likesCount?: number; // Add likes count (optional for safety)
    isLiked?: boolean;   // Add isLiked status (optional)
    commentsCount?: number; // Add comments count
    favoritesCount?: number; // Add favorites count (optional)
    isFavorited?: boolean;  // Add isFavorited status (optional)
}

// Add Comment interface
export interface Comment {
    id: number;
    text: string;
    createdAt: string;
    updatedAt: string;
    authorId: number;
    postId: number;
    author?: Pick<User, 'id' | 'name'>; // Include author info for display
}

// --- Add Notification Interface --- 
export interface Notification {
    id: number;
    recipientId: number;
    actorId: number;
    type: string; // Use string here, enum defined in service
    postId: number;
    commentId: number | null;
    read: boolean;
    createdAt: string;
    // Optional: Include related data directly if the API always provides it
    actor?: { id: number; name: string | null };
    post?: { id: number; title: string };
    comment?: { id: number; text: string };
}
// --- End Notification Interface --- 