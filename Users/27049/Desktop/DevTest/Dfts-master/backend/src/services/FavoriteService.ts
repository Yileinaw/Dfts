import prisma from '../db';
import { Favorite, Post, Prisma } from '@prisma/client';

// Define response type for paginated favorite posts
interface PaginatedFavoritePostsResponse {
    posts: (Post & { isLiked?: boolean; isFavorited?: boolean; author?: { id: number, name: string | null } })[];
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
                 console.log(`[Notification] FAVORITE notification created for post ${postId}, recipient ${post.authorId}`);
            } catch (error) {
                console.error(`[Notification Error] Failed to create FAVORITE notification for post ${postId}:`, error);
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
     * Get posts favorited by a specific user with pagination.
     */
    public static async getFavoritePostsByUserId(
        userId: number,
        options: { page?: number, limit?: number } = {}
    ): Promise<PaginatedFavoritePostsResponse> {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        // 1. Get the total count of favorited posts by the user
        const totalCount = await prisma.favorite.count({
            where: { userId: userId }
        });

        // 2. Get the paginated list of favorite records for the user
        const favoriteRecords = await prisma.favorite.findMany({
            where: { userId: userId },
            select: { postId: true },
            orderBy: { createdAt: 'desc' }, // Order by when it was favorited
            skip: skip,
            take: limit,
        });

        // Extract post IDs
        const postIds = favoriteRecords.map(fav => fav.postId);

        if (postIds.length === 0) {
            return { posts: [], totalCount: 0 };
        }

        // 3. Fetch the actual post details for the extracted IDs
        const postsData = await prisma.post.findMany({
            where: { id: { in: postIds } },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                authorId: true,
                author: { select: { id: true, name: true } },
                likesCount: true,
                commentsCount: true,
                favoritesCount: true,
                // Include relations needed to determine isLiked and isFavorited BY THE REQUESTING USER (userId)
                likedBy: {
                    where: { userId: userId },
                    select: { userId: true }
                },
                favoritedBy: {
                    where: { userId: userId },
                    select: { userId: true }
                }
            }
            // We might need to re-order based on favoriteRecords order if default ordering isn't sufficient
            // This is complex with Prisma select, might need post-processing or raw query if exact favorite order is critical.
            // For now, we accept the default ordering of findMany.
        });
        
        // 4. Process posts to add isLiked and isFavorited flags
        const posts = postsData.map(post => {
            const { likedBy, favoritedBy, ...restOfPost } = post as any;
            const isLiked = !!likedBy && likedBy.length > 0;
            // Since we are fetching favorites for this user, isFavorited should always be true
            // However, including the check based on favoritedBy is safer and consistent
            const isFavorited = !!favoritedBy && favoritedBy.length > 0;
            return { ...restOfPost, isLiked, isFavorited };
        });

        // Optional: Re-order posts based on the favoriteRecords order if needed
        const orderedPosts = postIds.map(id => posts.find(p => p.id === id)).filter(p => p !== undefined) as any[];

        return { posts: orderedPosts, totalCount };
    }
} 