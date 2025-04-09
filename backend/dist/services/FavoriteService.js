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
exports.FavoriteService = void 0;
const db_1 = __importDefault(require("../db"));
class FavoriteService {
    /**
     * Add a post to user's favorites.
     */
    static favoritePost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if already favorited
            const existingFavorite = yield db_1.default.favorite.findUnique({
                where: { userId_postId: { userId, postId } }
            });
            if (existingFavorite) {
                return existingFavorite;
            }
            // Use transaction to create favorite, increment count, and create notification
            const [newFavorite, post] = yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const favorite = yield tx.favorite.create({
                    data: { userId, postId }
                });
                const updatedPost = yield tx.post.update({
                    where: { id: postId },
                    data: { favoritesCount: { increment: 1 } },
                    select: { authorId: true } // Select authorId for notification
                });
                return [favorite, updatedPost];
            }));
            // --- Create Notification --- 
            if (post && post.authorId !== userId) { // Don't notify self
                try {
                    yield db_1.default.notification.create({
                        data: {
                            recipientId: post.authorId,
                            actorId: userId,
                            postId: postId,
                            type: 'FAVORITE' // Correct type
                        }
                    });
                    // console.log(`[Notification] FAVORITE notification created for post ${postId}, recipient ${post.authorId}`);
                }
                catch (error) {
                    // console.error(`[Notification Error] Failed to create FAVORITE notification for post ${postId}:`, error);
                }
            }
            // --- End Create Notification ---
            return newFavorite;
        });
    }
    /**
     * Remove a post from user's favorites.
     */
    static unfavoritePost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if it exists before trying to delete
            const favoriteToDelete = yield db_1.default.favorite.findUnique({
                where: { userId_postId: { userId, postId } }
            });
            if (!favoriteToDelete) {
                return null; // Not favorited, nothing to delete
            }
            // Use transaction to delete favorite and decrement count
            const deletedFavorite = yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const favorite = yield tx.favorite.delete({
                    where: { userId_postId: { userId, postId } }
                });
                yield tx.post.update({
                    where: { id: postId },
                    // Prevent count from going below zero, though theoretically shouldn't happen with checks
                    data: { favoritesCount: { decrement: 1 } }
                });
                return favorite;
            }));
            return deletedFavorite;
        });
    }
    /**
     * NEW method to get posts favorited by a specific user with pagination.
     */
    static fetchUserFavoritesPage(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, options = {}) {
            // console.log(`[FavoriteService.fetchUserFavoritesPage] Fetching favorites for userId: ${userId}, options: ${JSON.stringify(options)}`); // Remove log
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;
            // 1. Get total count
            const totalCount = yield db_1.default.favorite.count({ where: { userId } });
            // 2. Get paginated favorite records (just post IDs)
            const favoriteRecords = yield db_1.default.favorite.findMany({
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
            const postsData = yield db_1.default.post.findMany({
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
            const processedPosts = postsData.map(post => {
                var _a;
                const isLiked = !!((_a = post.likedBy) === null || _a === void 0 ? void 0 : _a.length);
                // Since we are fetching *this user's* favorites, isFavorited should be true
                const isFavorited = true; // Simplification: posts fetched via this method are always favorited by the user
                // const isFavorited = !!post.favoritedBy?.length; // Original check retained for consistency if needed elsewhere
                // Create the author object explicitly matching AuthorInfo
                const authorInfo = post.author ? {
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
                .filter((p) => p !== undefined);
            // console.log(`[FavoriteService.fetchUserFavoritesPage] Returning ${orderedPosts.length} ordered posts.`); // Remove log
            return { posts: orderedPosts, totalCount };
        });
    }
}
exports.FavoriteService = FavoriteService;
//# sourceMappingURL=FavoriteService.js.map