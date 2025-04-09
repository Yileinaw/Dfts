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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const PostService_1 = require("../services/PostService");
const client_1 = require("@prisma/client");
class CommentController {
    static createComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = parseInt(req.params.postId, 10);
                const userId = req.userId;
                const { text, parentId } = req.body;
                if (isNaN(postId)) {
                    res.status(400).json({ message: 'Invalid post ID' });
                    return;
                }
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                if (!text || typeof text !== 'string' || text.trim() === '') {
                    res.status(400).json({ message: 'Comment text is required and must be a non-empty string' });
                    return;
                }
                if (parentId !== undefined && (typeof parentId !== 'number' || !Number.isInteger(parentId))) {
                    res.status(400).json({ message: 'Invalid parent comment ID' });
                    return;
                }
                const newComment = yield PostService_1.PostService.createComment(postId, {
                    text: text.trim(),
                    authorId: userId,
                    parentId: parentId
                });
                res.status(201).json({ message: 'Comment created successfully', comment: newComment });
            }
            catch (error) {
                console.error('[CommentController.createComment] Error:', error);
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                    res.status(404).json({ message: 'Post not found or related resource missing' });
                }
                else {
                    res.status(500).json({ message: error.message || 'Failed to create comment' });
                }
            }
        });
    }
    static getCommentsByPostId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = parseInt(req.params.postId, 10);
                if (isNaN(postId)) {
                    res.status(400).json({ message: 'Invalid post ID' });
                    return;
                }
                const comments = yield PostService_1.PostService.getCommentsByPostId(postId);
                res.status(200).json(comments);
            }
            catch (error) {
                console.error('[CommentController.getCommentsByPostId] Error:', error);
                res.status(500).json({ message: error.message || 'Failed to retrieve comments' });
            }
        });
    }
    static deleteComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const commentId = parseInt(req.params.commentId, 10);
                const userId = req.userId;
                if (isNaN(commentId)) {
                    res.status(400).json({ message: 'Invalid comment ID' });
                    return;
                }
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const deletedComment = yield PostService_1.PostService.deleteComment(commentId, userId);
                if (!deletedComment) {
                    // This case is handled by PostService throwing an error or returning null if not found
                    // The catch block will handle it. We might refine this.
                    // For now, assume success if no error is thrown.
                }
                res.status(204).send();
            }
            catch (error) {
                console.error('[CommentController.deleteComment] Error:', error);
                if (error.message.includes('Forbidden')) {
                    res.status(403).json({ message: error.message });
                }
                else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                    res.status(404).json({ message: 'Comment not found' });
                }
                else {
                    res.status(500).json({ message: error.message || 'Failed to delete comment' });
                }
            }
        });
    }
}
exports.CommentController = CommentController;
//# sourceMappingURL=CommentController.js.map