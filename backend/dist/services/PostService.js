"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
// src/services/PostService.ts
const db_1 = __importDefault(require("../db"));
const client_1 = require("@prisma/client");
class PostService {
    // 创建帖子
    static createPost(postData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, content, authorId } = postData;
            const post = yield db_1.default.post.create({
                data: {
                    title,
                    content,
                    author: {
                        connect: { id: authorId },
                    },
                },
            });
            return post;
        });
    }
    // 获取所有帖子（可添加分页、过滤等）
    static getAllPosts() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const { page = 1, limit = 10, sortBy = 'latest', currentUserId, authorId } = options;
            const skip = (page - 1) * limit;
            let orderBy = { createdAt: 'desc' };
            if (sortBy === 'popular') {
                orderBy = { likesCount: 'desc' };
            }
            const whereClause = {};
            if (authorId) {
                whereClause.authorId = authorId;
            }
            const [postsData, totalCount] = yield db_1.default.$transaction([
                db_1.default.post.findMany({
                    where: whereClause,
                    skip: skip,
                    take: limit,
                    orderBy: orderBy,
                    select: Object.assign({ id: true, title: true, content: true, createdAt: true, updatedAt: true, author: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true // Ensure this is selected
                            }
                        }, likesCount: true, commentsCount: true, favoritesCount: true }, (currentUserId && {
                        likedBy: {
                            where: { userId: currentUserId },
                            select: { userId: true } // Select minimal field
                        },
                        favoritedBy: {
                            where: { userId: currentUserId },
                            select: { userId: true } // Select minimal field
                        }
                    }))
                }),
                db_1.default.post.count({ where: whereClause })
            ]);
            // Process posts to add flags and ensure correct type
            const posts = postsData.map(post => {
                var _a, _b;
                // Type assertion is needed because Prisma's select type doesn't perfectly match our desired structure with conditional fields
                const fullPost = post;
                const isLiked = !!((_a = fullPost.likedBy) === null || _a === void 0 ? void 0 : _a.length);
                const isFavorited = !!((_b = fullPost.favoritedBy) === null || _b === void 0 ? void 0 : _b.length);
                // Remove temporary fields if they exist
                delete fullPost.likedBy;
                delete fullPost.favoritedBy;
                // Ensure author has the correct shape (already selected by Prisma)
                const author = fullPost.author;
                return Object.assign(Object.assign({}, fullPost), { author, isLiked, isFavorited });
            });
            return { posts, totalCount };
        });
    }
    // 根据 ID 获取单个帖子
    static getPostById(postId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const postData = yield db_1.default.post.findUnique({
                where: { id: postId },
                select: Object.assign({ id: true, title: true, content: true, createdAt: true, updatedAt: true, author: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true
                        }
                    }, likesCount: true, commentsCount: true, favoritesCount: true }, (currentUserId && {
                    likedBy: { where: { userId: currentUserId }, select: { userId: true } },
                    favoritedBy: { where: { userId: currentUserId }, select: { userId: true } }
                }))
            });
            if (!postData)
                return null;
            // Process data
            const fullPost = postData;
            const isLiked = !!((_a = fullPost.likedBy) === null || _a === void 0 ? void 0 : _a.length);
            const isFavorited = !!((_b = fullPost.favoritedBy) === null || _b === void 0 ? void 0 : _b.length);
            delete fullPost.likedBy;
            delete fullPost.favoritedBy;
            const author = fullPost.author ? {
                id: fullPost.author.id,
                name: fullPost.author.name,
                avatarUrl: fullPost.author.avatarUrl
            } : null; // Handle case where author might be null (though unlikely with required relation)
            const result = Object.assign(Object.assign({}, fullPost), { author, isLiked, isFavorited });
            return result;
        });
    }
    // 更新帖子
    static updatePost(postId, postData, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. 检查帖子是否存在且属于该用户
            const post = yield db_1.default.post.findUnique({
                where: { id: postId },
            });
            if (!post) {
                return null; // 或抛出错误表明帖子不存在
            }
            if (post.authorId !== userId) {
                throw new Error('Forbidden: You can only update your own posts');
            }
            // 2. 更新帖子
            const updatedPost = yield db_1.default.post.update({
                where: { id: postId },
                data: {
                    title: postData.title,
                    content: postData.content,
                },
            });
            return updatedPost;
        });
    }
    // 删除帖子
    static deletePost(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. 检查帖子是否存在且属于该用户
            const post = yield db_1.default.post.findUnique({
                where: { id: postId },
            });
            if (!post) {
                return null; // 或抛出错误表明帖子不存在
            }
            if (post.authorId !== userId) {
                throw new Error('Forbidden: You can only delete your own posts');
            }
            // 2. 删除帖子
            yield db_1.default.post.delete({
                where: { id: postId },
            });
            return post; // 返回被删除的帖子信息
        });
    }
    // Like a post
    static likePost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if already liked
            const existingLike = yield db_1.default.like.findUnique({
                where: { userId_postId: { userId, postId } }
            });
            if (existingLike) {
                return existingLike; // Already liked
            }
            // Use transaction to create like, increment count, and create notification
            const [newLike, post] = yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const like = yield tx.like.create({
                    data: { userId, postId }
                });
                const updatedPost = yield tx.post.update({
                    where: { id: postId },
                    data: { likesCount: { increment: 1 } },
                    select: { authorId: true } // Select authorId for notification
                });
                return [like, updatedPost];
            }));
            // --- Create Notification --- 
            if (post && post.authorId !== userId) { // Don't notify self
                try {
                    yield db_1.default.notification.create({
                        data: {
                            recipientId: post.authorId,
                            actorId: userId,
                            postId: postId,
                            type: 'LIKE'
                        }
                    });
                    console.log(`[Notification] LIKE notification created for post ${postId}, recipient ${post.authorId}`);
                }
                catch (error) {
                    console.error(`[Notification Error] Failed to create LIKE notification for post ${postId}:`, error);
                    // Decide if this error should affect the main response
                }
            }
            // --- End Create Notification ---
            return newLike;
        });
    }
    // Unlike a post (No notification needed for unlike)
    static unlikePost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingLike = yield db_1.default.like.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
            if (existingLike) {
                yield db_1.default.like.delete({
                    where: {
                        userId_postId: {
                            userId,
                            postId,
                        },
                    },
                });
                // Optionally return the deleted like, but returning null is simpler
                // and fulfills the Promise<Like | null> contract if nothing is found later.
                // return existingLike; 
            }
            // Always return null, whether a like was found and deleted or not.
            return null;
        });
    }
    // --- Comment Methods ---
    // Create a new comment or reply
    static createComment(postId, commentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { text, authorId, parentId } = commentData;
            // Use a transaction to ensure atomicity: create comment, update count, create notification
            const [newComment, postAuthorData] = yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // 1. Create the comment
                const comment = yield tx.comment.create({
                    data: {
                        text,
                        postId,
                        authorId,
                        parentId: parentId !== null && parentId !== void 0 ? parentId : undefined, // Use undefined if parentId is null/undefined
                    },
                });
                // 2. Increment the post's comments count and get post author ID
                const postUpdate = yield tx.post.update({
                    where: { id: postId },
                    data: { commentsCount: { increment: 1 } },
                    select: { authorId: true } // Select only needed field
                });
                return [comment, postUpdate];
            }));
            // 3. Create Notification for the post author (if not self-commenting)
            if (postAuthorData && postAuthorData.authorId !== authorId) {
                try {
                    yield db_1.default.notification.create({
                        data: {
                            recipientId: postAuthorData.authorId,
                            actorId: authorId,
                            postId: postId,
                            commentId: newComment.id, // Link notification to the new comment
                            type: parentId ? 'REPLY' : 'COMMENT', // Different type for reply?
                        },
                    });
                    console.log(`[Notification] ${parentId ? 'REPLY' : 'COMMENT'} notification created for post ${postId}, recipient ${postAuthorData.authorId}, comment ${newComment.id}`);
                }
                catch (error) {
                    console.error(`[Notification Error] Failed to create ${parentId ? 'REPLY' : 'COMMENT'} notification for post ${postId}:`, error);
                }
            }
            // TODO: Consider adding notification for the parent comment author if it's a reply
            return newComment;
        });
    }
    // Get comments for a post
    static getCommentsByPostId(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield db_1.default.comment.findMany({
                where: { postId: postId },
                orderBy: { createdAt: 'asc' }, // Fetch comments chronologically
                select: {
                    id: true,
                    text: true,
                    createdAt: true,
                    updatedAt: true,
                    parentId: true,
                    // Select author details using the relation
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true,
                        },
                    },
                    // Note: We don't select postId or authorId directly as they are included via the relation/where clause
                },
            });
            // Map the Prisma result to our CommentWithAuthor structure
            // Prisma's select should already match this structure closely
            return comments.map(comment => (Object.assign(Object.assign({}, comment), { 
                // Explicitly structure the author part to match CommentAuthorInfo, although Prisma's select does this
                author: {
                    id: comment.author.id,
                    name: comment.author.name,
                    avatarUrl: comment.author.avatarUrl,
                } })));
        });
    }
    // Delete a comment
    static deleteComment(commentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Find the comment to check ownership and get postId
            const comment = yield db_1.default.comment.findUnique({
                where: { id: commentId },
                select: { authorId: true, postId: true }, // Select necessary fields
            });
            if (!comment) {
                return null; // Comment not found
            }
            // 2. Check if the user is the author
            if (comment.authorId !== userId) {
                // In a real app, throwing a specific error might be better
                throw new Error('Forbidden: You can only delete your own comments');
            }
            // 3. Use a transaction to delete the comment and decrement the post's count
            try {
                const [deletedComment] = yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // First, delete the comment itself
                    // WARNING: This does NOT handle child comments gracefully yet.
                    // Child comments will become orphaned (parentId points to non-existent comment).
                    // A more robust solution would involve finding child comments and either deleting them
                    // or setting their parentId to null.
                    const deleted = yield tx.comment.delete({
                        where: { id: commentId },
                    });
                    // Then, decrement the comments count on the related post
                    yield tx.post.update({
                        where: { id: comment.postId },
                        data: { commentsCount: { decrement: 1 } },
                    });
                    // TODO: Consider deleting related notifications (COMMENT/REPLY)
                    return [deleted]; // Return the deleted comment from transaction
                }));
                return deletedComment;
            }
            catch (error) {
                console.error(`[PostService.deleteComment] Error during transaction for comment ${commentId}:`, error);
                // Depending on the error type, you might want to throw or return null
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    // Handle specific Prisma errors if needed
                }
                throw error; // Re-throw the error for the controller to handle
            }
        });
    }
}
exports.PostService = PostService;
//# sourceMappingURL=PostService.js.map