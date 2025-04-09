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
exports.CommentService = void 0;
// backend/src/services/CommentService.ts
const db_1 = __importDefault(require("../db"));
const client_1 = require("@prisma/client");
class CommentService {
    /**
     * Create a new comment, optionally replying to another comment.
     */
    static createComment(userId, postId, text, parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(text === null || text === void 0 ? void 0 : text.trim())) {
                throw new Error('Comment text cannot be empty');
            }
            // Data for the new comment
            const commentData = {
                text: text,
                author: { connect: { id: userId } },
                post: { connect: { id: postId } },
            };
            // If parentId is provided, connect to the parent comment
            if (parentId) {
                // Optional: Verify parent comment exists and belongs to the same post
                const parentComment = yield db_1.default.comment.findUnique({ where: { id: parentId } });
                if (!parentComment || parentComment.postId !== postId) {
                    throw new Error('Invalid parent comment ID');
                }
                commentData.parent = { connect: { id: parentId } };
            }
            // Use transaction for comment creation, count update, and notifications
            const [newComment, post, parentAuthorId] = yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const createdComment = yield tx.comment.create({ data: commentData });
                const updatedPost = yield tx.post.update({
                    where: { id: postId },
                    data: { commentsCount: { increment: 1 } },
                    select: { authorId: true }
                });
                let parentCommentAuthorId = null;
                if (parentId) {
                    const parent = yield tx.comment.findUnique({ where: { id: parentId }, select: { authorId: true } });
                    parentCommentAuthorId = (_a = parent === null || parent === void 0 ? void 0 : parent.authorId) !== null && _a !== void 0 ? _a : null;
                }
                return [createdComment, updatedPost, parentCommentAuthorId];
            }));
            // --- Create Notifications --- 
            // 1. Notify post author about a new comment (unless it's their own post)
            if (post && post.authorId !== userId) {
                try {
                    yield db_1.default.notification.create({
                        data: {
                            recipientId: post.authorId,
                            actorId: userId,
                            postId: postId,
                            commentId: newComment.id,
                            type: parentId ? client_1.NotificationType.REPLY : client_1.NotificationType.COMMENT
                        }
                    });
                    console.log(`[Notification] ${parentId ? 'REPLY' : 'COMMENT'} notification created for post ${postId}, recipient ${post.authorId}`);
                }
                catch (error) {
                    console.error(`[Notification Error] Failed to create ${parentId ? 'REPLY' : 'COMMENT'} notification for post ${postId}:`, error);
                }
            }
            // 2. Notify parent comment author about the reply (if it's a reply and not self-reply)
            if (parentId && parentAuthorId && parentAuthorId !== userId && parentAuthorId !== (post === null || post === void 0 ? void 0 : post.authorId)) {
                try {
                    yield db_1.default.notification.create({
                        data: {
                            recipientId: parentAuthorId,
                            actorId: userId,
                            postId: postId, // Include post context
                            commentId: newComment.id, // Link to the new reply comment
                            type: client_1.NotificationType.REPLY
                        }
                    });
                    console.log(`[Notification] REPLY notification created for comment ${parentId}, recipient ${parentAuthorId}`);
                }
                catch (error) {
                    console.error(`[Notification Error] Failed to create REPLY notification for comment ${parentId}:`, error);
                }
            }
            // --- End Create Notifications ---
            return newComment;
        });
    }
    /**
     * Get comments for a specific post with pagination, including parentId and replies count.
     */
    static getCommentsByPostId(postId_1) {
        return __awaiter(this, arguments, void 0, function* (postId, options = {}) {
            const { page = 1, limit = 10, currentUserId } = options;
            const skip = (page - 1) * limit;
            // Get top-level comments first (or all comments if not handling hierarchy server-side initially)
            // For simplicity now, fetch all comments and let frontend handle hierarchy
            const whereClause = { postId: postId };
            const [commentsData, totalCount] = yield db_1.default.$transaction([
                db_1.default.comment.findMany({
                    where: whereClause,
                    skip: skip,
                    take: limit,
                    orderBy: { createdAt: 'asc' }, // Order by oldest first for potential nesting display
                    select: {
                        id: true,
                        text: true,
                        createdAt: true,
                        updatedAt: true,
                        authorId: true,
                        postId: true,
                        parentId: true,
                        author: { select: { id: true, name: true, avatarUrl: true } },
                        _count: { select: { replies: true } },
                    }
                }),
                db_1.default.comment.count({ where: whereClause })
            ]);
            // Map data to include repliesCount and ensure correct author type
            const comments = commentsData.map(comment => {
                const { _count, author, authorId, postId, parentId } = comment, restOfComment = __rest(comment, ["_count", "author", "authorId", "postId", "parentId"]);
                return Object.assign(Object.assign({}, restOfComment), { parentId: parentId, author: author, repliesCount: (_count === null || _count === void 0 ? void 0 : _count.replies) || 0 });
            });
            return { comments, totalCount };
        });
    }
    /**
     * Delete a comment by its ID, verifying ownership.
     */
    static deleteComment(userId, commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const commentToDelete = yield db_1.default.comment.findUnique({
                where: { id: commentId },
                select: { authorId: true, postId: true } // Select needed fields for validation and update
            });
            if (!commentToDelete) {
                throw new Error('Comment not found');
            }
            if (commentToDelete.authorId !== userId) {
                throw new Error('Unauthorized to delete this comment'); // Or use a specific error type/status
            }
            // Use transaction to ensure comment deletion and count update are atomic
            const deletedComment = yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const comment = yield tx.comment.delete({
                    where: { id: commentId },
                });
                yield tx.post.update({
                    where: { id: commentToDelete.postId }, // Use postId from the fetched comment
                    data: { commentsCount: { decrement: 1 } },
                });
                return comment;
            }));
            return deletedComment;
        });
    }
}
exports.CommentService = CommentService;
//# sourceMappingURL=CommentService.js.map