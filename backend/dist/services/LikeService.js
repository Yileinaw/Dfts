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
exports.LikeService = void 0;
const db_1 = __importDefault(require("../db"));
const client_1 = require("@prisma/client");
class LikeService {
    /**
     * Like a post. Creates a Like record and increments likesCount.
     * Throws an error if the user has already liked the post.
     */
    static likePost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // 1. Create the Like record
                    yield tx.like.create({
                        data: {
                            userId: userId,
                            postId: postId,
                        },
                    });
                    // 2. Increment the likesCount on the Post
                    yield tx.post.update({
                        where: { id: postId },
                        data: {
                            likesCount: { increment: 1 },
                        },
                    });
                }));
            }
            catch (error) {
                // Handle potential errors, e.g., unique constraint violation if already liked (P2002)
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    // This means the like already exists, which might be okay or indicate a client-side issue.
                    // We could choose to do nothing or re-throw a specific error.
                    console.warn(`User ${userId} already liked post ${postId}.`);
                    // Or: throw new Error('Post already liked'); 
                }
                else {
                    console.error(`Error liking post ${postId} by user ${userId}:`, error);
                    throw new Error('Failed to like post');
                }
            }
        });
    }
    /**
     * Unlike a post. Deletes the Like record and decrements likesCount.
     * Does nothing if the user hasn't liked the post.
     */
    static unlikePost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // 1. Attempt to delete the Like record
                    const deletedLike = yield tx.like.delete({
                        where: {
                            userId_postId: {
                                userId: userId,
                                postId: postId,
                            },
                        },
                    }).catch((error) => {
                        // Handle case where the like doesn't exist (P2025)
                        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                            return null; // Indicate that no like was found/deleted
                        }
                        throw error; // Re-throw other errors
                    });
                    // 2. Only decrement if a like was actually deleted
                    if (deletedLike) {
                        yield tx.post.update({
                            where: { id: postId },
                            data: {
                                likesCount: { decrement: 1 },
                            },
                        });
                    }
                }));
            }
            catch (error) {
                console.error(`Error unliking post ${postId} by user ${userId}:`, error);
                throw new Error('Failed to unlike post');
            }
        });
    }
}
exports.LikeService = LikeService;
//# sourceMappingURL=LikeService.js.map