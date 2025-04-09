import prisma from '../db';
import { Favorite, Post, Prisma, User } from '@prisma/client';

// console.log('[FavoriteService.ts] File loaded by Node.js process.'); // Remove log

// Define a more specific type for the Author including avatarUrl
interface AuthorInfo {
    id: number;
    name: string | null;
    avatarUrl?: string | null; // Ensure avatarUrl is here
}

// Define a type for Post that includes the AuthorInfo
// This helps ensure type safety throughout the process
interface PostWithAuthor extends Omit<Post, 'authorId'> { // Omit authorId if author object is present
    isLiked?: boolean;
    isFavorited?: boolean;
    author: AuthorInfo | null; // Use the AuthorInfo interface
}

// Define the Paginated response type using PostWithAuthor
interface PaginatedFavoritePostsResponse {
    posts: PostWithAuthor[];
    totalCount: number;
}

export class FavoriteService {

    /**
     * Add a post to user's favorites.
     */
    public static async favoritePost(userId: number, postId: number): Promise<Favorite> {
        // Check if already favorited
        const existingFavorite = await prisma.favorite.findUnique({
            where: { userId_postId: { userId, postId } }
        });
        if (existingFavorite) {
            return existingFavorite; 
        }

        // Use transaction to create favorite, increment count, and create notification
        const [newFavorite, post] = await prisma.$transaction(async (tx) => {
            const favorite = await tx.favorite.create({
                data: { userId, postId }
            });
            const updatedPost = await tx.post.update({
                where: { id: postId },
                data: { favoritesCount: { increment: 1 } },
                select: { authorId: true } // Select authorId for notification
            });
            return [favorite, updatedPost];
        });
        
        // --- Create Notification --- 
        if (post && post.authorId !== userId) { // Don't notify self
             try {
                await prisma.notification.create({
                    data: {
                        recipientId: post.authorId,
                        actorId: userId,
                        postId: postId,
                        type: 'FAVORITE' // Correct type
                    }
                });
                 // console.log(`[Notification] FAVORITE notification created for post ${postId}, recipient ${post.authorId}`);
            } catch (error) {
                // console.error(`[Notification Error] Failed to create FAVORITE notification for post ${postId}:`, error);
            }
        }
        // --- End Create Notification ---

        return newFavorite;
    }

    /**
     * Remove a post from user's favorites.
     */
    public static async unfavoritePost(userId: number, postId: number): Promise<Favorite | null> {
         // Check if it exists before trying to delete
        const favoriteToDelete = await prisma.favorite.findUnique({
            where: { userId_postId: { userId, postId } }
        });

        if (!favoriteToDelete) {
            return null; // Not favorited, nothing to delete
        }
        
        // Use transaction to delete favorite and decrement count
        const deletedFavorite = await prisma.$transaction(async (tx) => {
            const favorite = await tx.favorite.delete({
                where: { userId_postId: { userId, postId } }
            });

            await tx.post.update({
                where: { id: postId },
                // Prevent count from going below zero, though theoretically shouldn't happen with checks
                data: { favoritesCount: { decrement: 1 } }
            });

            return favorite;
        });

        return deletedFavorite;
    }

    /**
     * NEW method to get posts favorited by a specific user with pagination.
     */
    public static async fetchUserFavoritesPage(
        userId: number,
        options: { page?: number, limit?: number } = {}
    ): Promise<PaginatedFavoritePostsResponse> {
        // console.log(`[FavoriteService.fetchUserFavoritesPage] Fetching favorites for userId: ${userId}, options: ${JSON.stringify(options)}`); // Remove log
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        // 1. Get total count
        const totalCount = await prisma.favorite.count({ where: { userId } });

        // 2. Get paginated favorite records (just post IDs)
        const favoriteRecords = await prisma.favorite.findMany({
            where: { userId },
            select: { postId: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        const postIds = favoriteRecords.map(fav => fav.postId);
        if (postIds.length === 0) {
            // console.log(`[FavoriteService.fetchUserFavoritesPage] No favorite post IDs found for userId: ${userId}`); // Remove log
            return { posts: [], totalCount: 0 };
        }
        // console.log(`[FavoriteService.fetchUserFavoritesPage] Found favorite post IDs: ${postIds}`); // Remove log

        // 3. Fetch post details for these IDs
        const postsData = await prisma.post.findMany({
            where: { id: { in: postIds } },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                authorId: true, // Keep authorId for potential reference if needed
                author: { 
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                },
                likesCount: true,
                commentsCount: true,
                favoritesCount: true,
                // Need relations to determine isLiked/isFavorited for the *requesting user*
                likedBy: { where: { userId }, select: { userId: true } },
                favoritedBy: { where: { userId }, select: { userId: true } }
            }
        });
        
        // --- Remove Debug Log --- 
        // console.log('[FavoriteService.fetchUserFavoritesPage] Raw postsData fetched:', JSON.stringify(postsData, null, 2));
        // --- End Remove Debug Log ---
        
        // 4. Map data to the stricter PostWithAuthor type
        const processedPosts: PostWithAuthor[] = postsData.map(post => {
            const isLiked = !!post.likedBy?.length;
            // Since we are fetching *this user's* favorites, isFavorited should be true
            const isFavorited = true; // Simplification: posts fetched via this method are always favorited by the user
            // const isFavorited = !!post.favoritedBy?.length; // Original check retained for consistency if needed elsewhere
            
            // Create the author object explicitly matching AuthorInfo
            const authorInfo: AuthorInfo | null = post.author ? {
                id: post.author.id,
                name: post.author.name,
                avatarUrl: post.author.avatarUrl // Directly use the selected value
            } : null;

            return {
                id: post.id,
                title: post.title,
                content: post.content,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                author: authorInfo,
                likesCount: post.likesCount,
                commentsCount: post.commentsCount,
                favoritesCount: post.favoritesCount,
                isLiked,
                isFavorited
            };
        });

        // 5. Re-order based on favoriteRecords order
        const orderedPosts = postIds
            .map(id => processedPosts.find(p => p.id === id))
            .filter((p): p is PostWithAuthor => p !== undefined);

        // console.log(`[FavoriteService.fetchUserFavoritesPage] Returning ${orderedPosts.length} ordered posts.`); // Remove log
        return { posts: orderedPosts, totalCount };
    }

    /**
     * Get posts favorited by a specific user with pagination.
     */
   
} 