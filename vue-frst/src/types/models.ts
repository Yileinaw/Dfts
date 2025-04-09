// vue-frst/src/types/models.ts

// Consistent User model based on common properties and Prisma schema
export interface User {
    id: number;
    email: string; // Using email as the primary identifier field shown
    name: string | null; // Prisma String? maps to string | null
    avatarUrl: string | null; // Prisma String? maps to string | null
    createdAt: string; // Prisma DateTime maps to string
    updatedAt: string;
    // posts?: Post[]; // Keep optional, only include if an API endpoint actually populates this
}

// Consistent Post model, aligning with Prisma and common usage
export interface Post {
    id: number;
    title: string;
    content: string | null; // Prisma String? maps to string | null
    createdAt: string;
    updatedAt: string;
    authorId: number;
    // Use Pick for consistency, selecting fields commonly needed for display
    author?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
    likesCount?: number; // Optional count fields
    commentsCount?: number;
    favoritesCount?: number;
    isLiked?: boolean;   // Optional status flags based on current user context
    isFavorited?: boolean;
}

// Consistent Comment model, including author details and parent ID
export interface Comment {
    id: number;
    text: string;
    createdAt: string;
    updatedAt: string;
    authorId: number;
    postId: number;
    // Use Pick for author details needed in the UI
    author?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
    parentId?: number | null; // For identifying replies
}

// Consistent Notification model
export interface Notification {
    id: number;
    recipientId: number;
    actorId: number;
    postId?: number | null;
    commentId?: number | null;
    type: 'LIKE' | 'COMMENT' | 'FAVORITE' | 'FOLLOW';
    read: boolean;
    createdAt: string;
    actor?: { id: number; name: string | null; avatarUrl: string | null };
    post?: { id: number; title: string };
    comment?: { id: number; text: string };
}

// Structure for the response when fetching comments for a post.
// Note: This might need adjustment if PostService.getCommentsByPostId
// is updated to return only the Comment[] array.
export interface GetCommentsResponse {
    comments: Comment[];
    totalCount: number;
}