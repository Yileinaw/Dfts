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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
            // Check if already favorited to prevent duplicates (optional but good practice)
            const existingFavorite = yield db_1.default.favorite.findUnique({
                where: { userId_postId: { userId, postId } }
            });
            if (existingFavorite) {
                return existingFavorite; // Already favorited, do nothing
            }
            // Use transaction to create favorite and increment count
            const newFavorite = yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const favorite = yield tx.favorite.create({
                    data: {
                        userId: userId,
                        postId: postId,
                    }
                });
                yield tx.post.update({
                    where: { id: postId },
                    data: { favoritesCount: { increment: 1 } }
                });
                return favorite;
            }));
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
     * Get posts favorited by a specific user with pagination.
     */
    static getFavoritePostsByUserId(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, options = {}) {
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;
            // 1. Get the total count of favorited posts by the user
            const totalCount = yield db_1.default.favorite.count({
                where: { userId: userId }
            });
            // 2. Get the paginated list of favorite records for the user
            const favoriteRecords = yield db_1.default.favorite.findMany({
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
            const postsData = yield db_1.default.post.findMany({
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
                const _a = post, { likedBy, favoritedBy } = _a, restOfPost = __rest(_a, ["likedBy", "favoritedBy"]);
                const isLiked = !!likedBy && likedBy.length > 0;
                // Since we are fetching favorites for this user, isFavorited should always be true
                // However, including the check based on favoritedBy is safer and consistent
                const isFavorited = !!favoritedBy && favoritedBy.length > 0;
                return Object.assign(Object.assign({}, restOfPost), { isLiked, isFavorited });
            });
            // Optional: Re-order posts based on the favoriteRecords order if needed
            const orderedPosts = postIds.map(id => posts.find(p => p.id === id)).filter(p => p !== undefined);
            return { posts: orderedPosts, totalCount };
        });
    }
}
exports.FavoriteService = FavoriteService;
//# sourceMappingURL=FavoriteService.js.map