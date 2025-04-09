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
exports.PostService = void 0;
// src/services/PostService.ts
const db_1 = __importDefault(require("../db"));
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
            } // 现在可以按 likesCount 排序
            // --- Add where clause for filtering by authorId --- 
            const whereClause = {};
            if (authorId) {
                whereClause.authorId = authorId;
            }
            // --- End where clause ---
            const [postsData, totalCount] = yield db_1.default.$transaction([
                db_1.default.post.findMany({
                    where: whereClause, // Apply where clause
                    skip: skip,
                    take: limit,
                    orderBy: orderBy,
                    select: Object.assign({ id: true, title: true, content: true, createdAt: true, updatedAt: true, authorId: true, author: { select: { id: true, name: true } }, likesCount: true, commentsCount: true, favoritesCount: true }, (currentUserId && {
                        likedBy: {
                            where: { userId: currentUserId },
                            select: { userId: true }
                        },
                        favoritedBy: {
                            where: { userId: currentUserId },
                            select: { userId: true }
                        }
                    }))
                }),
                db_1.default.post.count({ where: whereClause }) // Apply where clause to count too
            ]);
            // --- Process data (map isLiked and isFavorited) --- 
            const posts = postsData.map(post => {
                const _a = post, { likedBy, favoritedBy } = _a, restOfPost = __rest(_a, ["likedBy", "favoritedBy"]);
                const isLiked = !!likedBy && likedBy.length > 0;
                const isFavorited = !!favoritedBy && favoritedBy.length > 0;
                return Object.assign(Object.assign({}, restOfPost), { isLiked, isFavorited });
            });
            return { posts, totalCount };
        });
    }
    // 根据 ID 获取单个帖子
    static getPostById(postId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const postData = yield db_1.default.post.findUnique({
                where: { id: postId },
                select: Object.assign({ id: true, title: true, content: true, createdAt: true, updatedAt: true, authorId: true, author: { select: { id: true, name: true, email: true } }, likesCount: true, commentsCount: true, favoritesCount: true }, (currentUserId && {
                    likedBy: {
                        where: { userId: currentUserId },
                        select: { userId: true }
                    },
                    favoritedBy: {
                        where: { userId: currentUserId },
                        select: { userId: true }
                    }
                }))
            });
            if (!postData)
                return null;
            // --- Process data (map isLiked and isFavorited) --- 
            const _a = postData, { likedBy, favoritedBy } = _a, restOfPost = __rest(_a, ["likedBy", "favoritedBy"]);
            const isLiked = !!likedBy && likedBy.length > 0;
            const isFavorited = !!favoritedBy && favoritedBy.length > 0;
            return Object.assign(Object.assign({}, restOfPost), { isLiked, isFavorited });
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
}
exports.PostService = PostService;
//# sourceMappingURL=PostService.js.map