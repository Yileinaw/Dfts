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
exports.LikeController = void 0;
const LikeService_1 = require("../services/LikeService");
class LikeController {
    static likePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = parseInt(req.params.postId, 10); // Get postId from route params
                const userId = req.userId;
                if (isNaN(postId)) {
                    res.status(400).json({ message: 'Invalid post ID' });
                    return;
                }
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                yield LikeService_1.LikeService.likePost(userId, postId);
                res.status(204).send(); // 204 No Content is suitable for successful like/unlike
            }
            catch (error) {
                // Handle specific errors if needed (e.g., 'Post already liked')
                console.error('Like Post Error:', error);
                res.status(500).json({ message: error.message || 'Failed to like post' });
            }
        });
    }
    static unlikePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = parseInt(req.params.postId, 10); // Get postId from route params
                const userId = req.userId;
                if (isNaN(postId)) {
                    res.status(400).json({ message: 'Invalid post ID' });
                    return;
                }
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                yield LikeService_1.LikeService.unlikePost(userId, postId);
                res.status(204).send(); // 204 No Content
            }
            catch (error) {
                console.error('Unlike Post Error:', error);
                res.status(500).json({ message: error.message || 'Failed to unlike post' });
            }
        });
    }
}
exports.LikeController = LikeController;
//# sourceMappingURL=LikeController.js.map