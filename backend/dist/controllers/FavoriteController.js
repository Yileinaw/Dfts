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
exports.FavoriteController = void 0;
const FavoriteService_1 = require("../services/FavoriteService");
class FavoriteController {
    /**
     * Handle request to favorite a post.
     */
    static favoritePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = parseInt(req.params.postId, 10);
                const userId = req.userId;
                if (isNaN(postId)) {
                    res.status(400).json({ message: 'Invalid post ID' });
                    return;
                }
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                yield FavoriteService_1.FavoriteService.favoritePost(userId, postId);
                // Return 204 No Content or 200 OK with a simple message
                res.status(204).send();
            }
            catch (error) {
                console.error('Favorite Post Error:', error);
                res.status(500).json({ message: error.message || 'Failed to favorite post' });
            }
        });
    }
    /**
     * Handle request to unfavorite a post.
     */
    static unfavoritePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = parseInt(req.params.postId, 10);
                const userId = req.userId;
                if (isNaN(postId)) {
                    res.status(400).json({ message: 'Invalid post ID' });
                    return;
                }
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const result = yield FavoriteService_1.FavoriteService.unfavoritePost(userId, postId);
                if (result === null) {
                    // If service returns null, it means the favorite didn't exist
                    // Depending on desired behavior, could return 404 or just 204
                    res.status(204).send(); // Treat as success (idempotent)
                }
                else {
                    res.status(204).send(); // Success
                }
            }
            catch (error) {
                console.error('Unfavorite Post Error:', error);
                res.status(500).json({ message: error.message || 'Failed to unfavorite post' });
            }
        });
    }
    /**
     * Handle request to get the current user's favorited posts.
     */
    static getMyFavorites(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const page = parseInt(req.query.page) || undefined;
                const limit = parseInt(req.query.limit) || undefined;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const result = yield FavoriteService_1.FavoriteService.fetchUserFavoritesPage(userId, { page, limit });
                res.status(200).json(result);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to retrieve favorite posts' });
            }
        });
    }
}
exports.FavoriteController = FavoriteController;
//# sourceMappingURL=FavoriteController.js.map