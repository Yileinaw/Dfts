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
const CommentService_1 = require("../services/CommentService");
class CommentController {
    static createComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = parseInt(req.params.postId, 10);
                const userId = req.userId;
                const { text } = req.body; // Get comment text from request body
                if (isNaN(postId)) {
                    res.status(400).json({ message: 'Invalid post ID' });
                    return;
                }
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                if (!text) {
                    res.status(400).json({ message: 'Comment text is required' });
                    return;
                }
                const newComment = yield CommentService_1.CommentService.createComment(userId, postId, text);
                res.status(201).json({ message: 'Comment created successfully', comment: newComment });
            }
            catch (error) {
                console.error('Create Comment Error:', error);
                res.status(500).json({ message: error.message || 'Failed to create comment' });
            }
        });
    }
    static getCommentsByPostId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = parseInt(req.params.postId, 10);
                const page = parseInt(req.query.page) || undefined;
                const limit = parseInt(req.query.limit) || undefined;
                if (isNaN(postId)) {
                    res.status(400).json({ message: 'Invalid post ID' });
                    return;
                }
                const result = yield CommentService_1.CommentService.getCommentsByPostId(postId, { page, limit });
                res.status(200).json(result); // Returns { comments: [], totalCount: number }
            }
            catch (error) {
                console.error('Get Comments Error:', error);
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
                yield CommentService_1.CommentService.deleteComment(userId, commentId);
                res.status(204).send(); // No Content on successful deletion
            }
            catch (error) {
                console.error('Delete Comment Error:', error);
                // Handle specific errors like 'Comment not found' or 'Unauthorized'
                if (error.message === 'Comment not found') {
                    res.status(404).json({ message: error.message });
                }
                else if (error.message === 'Unauthorized to delete this comment') {
                    res.status(403).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Failed to delete comment' });
                }
            }
        });
    }
}
exports.CommentController = CommentController;
//# sourceMappingURL=CommentController.js.map