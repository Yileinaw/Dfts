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
exports.CommentService = void 0;
// backend/src/services/CommentService.ts
const db_1 = __importDefault(require("../db"));
class CommentService {
    /**
     * Create a new comment for a post.
     */
    static createComment(userId, postId, text) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(text === null || text === void 0 ? void 0 : text.trim())) {
                throw new Error('Comment text cannot be empty');
            }
            // Use transaction to ensure comment creation and count update are atomic
            const newComment = yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const comment = yield tx.comment.create({
                    data: {
                        text: text,
                        authorId: userId,
                        postId: postId,
                    },
                });
                yield tx.post.update({
                    where: { id: postId },
                    data: { commentsCount: { increment: 1 } },
                });
                return comment;
            }));
            return newComment;
        });
    }
    /**
     * Get comments for a specific post with pagination.
     */
    static getCommentsByPostId(postId_1) {
        return __awaiter(this, arguments, void 0, function* (postId, options = {}) {
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;
            const [commentsData, totalCount] = yield db_1.default.$transaction([
                db_1.default.comment.findMany({
                    where: { postId: postId },
                    skip: skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' }, // Show newest comments first
                    include: {
                        author: { select: { id: true, name: true } } // Include author info
                    }
                }),
                db_1.default.comment.count({
                    where: { postId: postId }
                })
            ]);
            return { comments: commentsData, totalCount };
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