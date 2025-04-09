import prisma from '../db';
import { Prisma } from '@prisma/client';

export class LikeService {
    /**
     * Like a post. Creates a Like record and increments likesCount.
     * Throws an error if the user has already liked the post.
     */
    public static async likePost(userId: number, postId: number): Promise<void> {
        try {
            await prisma.$transaction(async (tx) => {
                // 1. Create the Like record
                await tx.like.create({
                    data: {
                        userId: userId,
                        postId: postId,
                    },
                });

                // 2. Increment the likesCount on the Post
                await tx.post.update({
                    where: { id: postId },
                    data: {
                        likesCount: { increment: 1 },
                    },
                });
            });
        } catch (error: any) {
            // Handle potential errors, e.g., unique constraint violation if already liked (P2002)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                // This means the like already exists, which might be okay or indicate a client-side issue.
                // We could choose to do nothing or re-throw a specific error.
                console.warn(`User ${userId} already liked post ${postId}.`);
                // Or: throw new Error('Post already liked'); 
            } else {
                console.error(`Error liking post ${postId} by user ${userId}:`, error);
                throw new Error('Failed to like post');
            }
        }
    }

    /**
     * Unlike a post. Deletes the Like record and decrements likesCount.
     * Does nothing if the user hasn't liked the post.
     */
    public static async unlikePost(userId: number, postId: number): Promise<void> {
        try {
            await prisma.$transaction(async (tx) => {
                // 1. Attempt to delete the Like record
                const deletedLike = await tx.like.delete({
                    where: {
                        userId_postId: {
                            userId: userId,
                            postId: postId,
                        },
                    },
                }).catch((error: any) => {
                    // Handle case where the like doesn't exist (P2025)
                    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                        return null; // Indicate that no like was found/deleted
                    }
                    throw error; // Re-throw other errors
                });

                // 2. Only decrement if a like was actually deleted
                if (deletedLike) {
                    await tx.post.update({
                        where: { id: postId },
                        data: {
                            likesCount: { decrement: 1 },
                        },
                    });
                }
            });
        } catch (error: any) {
            console.error(`Error unliking post ${postId} by user ${userId}:`, error);
            throw new Error('Failed to unlike post');
        }
    }
} 