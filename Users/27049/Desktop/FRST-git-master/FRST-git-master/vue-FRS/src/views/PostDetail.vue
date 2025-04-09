<template>
    <div>
        <div v-if="loading" class="loading-state">
            <el-skeleton :rows="10" animated />
        </div>
        <div v-else-if="post" class="post-detail-container">
            <el-page-header @back="goBack" class="page-header">
                <template #content>
                    <span class="header-content">帖子详情</span>
                </template>
            </el-page-header>

            <div class="post-content-card">
                <!-- Author Info -->
                <div class="author-info">
                    <el-avatar :size="40" :src="post.author.avatar || defaultAvatar" class="author-avatar" />
                    <div class="author-details">
                        <span class="author-username">{{ post.author.username }}</span>
                        <span class="post-time">{{ formatRelativeTime(post.createdAt) }}</span>
                    </div>
                </div>

                <!-- Post Body -->
                <div class="post-body" v-html="formattedContent(post.content)"></div>

                <!-- Post Images -->
                <div v-if="post.images && post.images.length > 0" class="post-images">
                    <el-image v-for="(imgUrl, index) in post.images" :key="index" :src="imgUrl"
                        :preview-src-list="post.images" :initial-index="index" fit="cover" loading="lazy"
                        class="post-image-item" />
                </div>

                <!-- Actions -->
                <div class="post-actions">
                    <el-button :type="post.isLiked ? 'primary' : ''" text @click="handleLikePost"
                        :icon="post.isLiked ? StarFilled : Star" :loading="likeLoading">
                        {{ post.likes }} 赞
                    </el-button>
                    <el-button text :icon="ChatDotRound">
                        {{ post.commentsCount }} 评论
                    </el-button>
                    <!-- Add Collection Button -->
                    <el-button 
                        type="warning" 
                        text 
                        :icon="CollectionTag" 
                        @click="handleAddToCollection"
                        :disabled="isAlreadyCollected || addingToCollection"
                        :loading="addingToCollection">
                        {{ isAlreadyCollected ? '已收藏' : '收藏' }}
                    </el-button>
                    <!-- Share Button Placeholder -->
                    <el-button text :icon="Share" @click="handleShare">分享</el-button>
                </div>
            </div>

            <!-- Comments Section -->
            <div class="comments-section-card">
                <h3 class="comments-title">评论 ({{ post.commentsCount }})</h3>
                <CommentList :post-id="postId" :comments="comments" :has-more="hasMoreComments"
                    :loading="commentsLoading" @load-more="loadMoreComments" @add-comment="handleAddComment" />
            </div>

        </div>
        <div v-else class="not-found">
            <el-empty description="帖子未找到或已被删除" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { ElPageHeader, ElAvatar, ElButton, ElSkeleton, ElEmpty, ElMessage, ElIcon, ElImage } from 'element-plus';
import { Star, StarFilled, ChatDotRound, Share, CollectionTag } from '@element-plus/icons-vue';
import CommentList from '@/components/business/CommentList.vue';
import { findPostById, getCommentsByPostId, togglePostLike, addCommentToPost } from '@/utils/mockDataHelper';
import { formatRelativeTime } from '@/utils/timeFormatter.ts';
import type { PostInfo, CommentInfo, PostAuthorInfo } from '@/types/api';
import defaultAvatar from '@/assets/images/default-avatar.png';

// --- State ---
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const post = ref<PostInfo | null>(null);
const comments = ref<CommentInfo[]>([]);
const loading = ref(true);
const commentsLoading = ref(false);
const likeLoading = ref(false);
const hasMoreComments = ref(true);
const commentsPage = ref(1);
const commentsPageSize = 10;
const addingToCollection = ref(false);

// --- Computed ---
const postId = computed(() => {
    const id = route.params.id;
    const parsedId = Number(Array.isArray(id) ? id[0] : id);
    return isNaN(parsedId) ? 0 : parsedId;
});

const isAlreadyCollected = computed(() => {
    if (!post.value || !postId.value) return false;
    return userStore.isCollected('post', postId.value);
});

// --- Methods ---
const goBack = () => {
    router.back();
};

const fetchPostDetails = async () => {
    loading.value = true;
    try {
        const id = postId.value;
        if (!id) {
            console.error("Post ID is missing from route parameters.");
            ElMessage.error("无法加载帖子，缺少ID");
            post.value = null;
            return;
        }
        const fetchedPost = await findPostById(id);
        if (fetchedPost) {
            post.value = fetchedPost;
            // Reset comments when fetching a new post
            comments.value = [];
            commentsPage.value = 1;
            hasMoreComments.value = true;
            await fetchComments(); // Fetch initial comments
        } else {
            post.value = null;
            ElMessage.warning("帖子未找到");
        }
    } catch (error) {
        console.error("Error fetching post details:", error);
        ElMessage.error("加载帖子详情失败");
        post.value = null;
    } finally {
        loading.value = false;
    }
};

const fetchComments = async () => {
    if (!post.value || !postId.value) return;
    commentsLoading.value = true;
    try {
        const response = await getCommentsByPostId(postId.value, commentsPage.value, commentsPageSize);
        comments.value = [...comments.value, ...response.list]; // Append new comments
        hasMoreComments.value = comments.value.length < response.total;
        commentsPage.value += 1;
    } catch (error) {
        console.error("Error fetching comments:", error);
        ElMessage.error("加载评论失败");
    } finally {
        commentsLoading.value = false;
    }
};

const loadMoreComments = () => {
    if (!commentsLoading.value && hasMoreComments.value) {
        fetchComments();
    }
};

const handleLikePost = async () => {
    if (!post.value || likeLoading.value) return;
    likeLoading.value = true;
    try {
        const currentLikeState = post.value.isLiked;
        const newState = await togglePostLike(post.value.id, currentLikeState);
        // Update local state immediately for better UX
        post.value.isLiked = newState;
        post.value.likes += newState ? 1 : -1;
    } catch (error) {
        console.error("Error liking post:", error);
        ElMessage.error("操作失败，请稍后再试");
        // Revert optimistic update on error? Or rely on next fetch.
    } finally {
        likeLoading.value = false;
    }
};

const handleAddComment = async (content: string, replyToUserId?: number): Promise<boolean> => {
    if (!post.value || !postId.value) return false; // Indicate failure

    // Find replyTo author info if replyToUserId is provided
    let replyToAuthor: PostAuthorInfo | undefined = undefined;
    if (replyToUserId) {
        // Search existing comments for the author (this is inefficient in real app, API should handle it)
        replyToAuthor = comments.value.find(c => c.author.id === replyToUserId)?.author;
        // In a real app, you'd have the current user info readily available
    }

    // Simulate getting current user (replace with actual user data later)
    const currentUser: PostAuthorInfo = { id: 999, username: '当前用户' };

    try {
        const newComment = await addCommentToPost(postId.value, {
            author: currentUser, // Use simulated current user
            content: content,
            replyTo: replyToAuthor,
        });

        if (newComment && post.value) {
            comments.value.unshift(newComment); // Add to the top of the list
            post.value.commentsCount += 1;
            return true; // Indicate success
        } else {
            ElMessage.error("评论失败，请稍后再试");
            return false;
        }
    } catch (error) {
        console.error("Error adding comment:", error);
        ElMessage.error("评论失败，请稍后再试");
        return false;
    }
};

// Simple formatting for display (replace newline with <br>)
const formattedContent = (content: string) => {
    return content.replace(/\n/g, '<br>');
};

// --- Add Share Method ---
const handleShare = () => {
    // Simulate copying link to clipboard
    const url = window.location.href;
    // In a real app, use navigator.clipboard.writeText(url)
    // For simulation, just show a message
    ElMessage.success('链接已复制 (模拟)');
    console.log('Sharing URL:', url);
};

// Handle adding to collection
const handleAddToCollection = async () => {
    if (!post.value || isAlreadyCollected.value) return;
    addingToCollection.value = true;
    try {
        const collectionData = {
            collectedId: Number(post.value.id),
            type: 'post' as const,
            title: post.value.content.split('\n')[0]?.substring(0, 50) || '社区帖子',
            imageUrl: post.value.images?.[0] || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=Post',
            link: `/post/${post.value.id}`
        };
        userStore.addCollection(collectionData);
    } catch (error) {
        console.error("Error adding post to collection:", error);
    } finally {
        addingToCollection.value = false;
    }
};

// --- Lifecycle ---
onMounted(async () => {
    if (!userStore.hasFetchedCollections) {
        await userStore.fetchCollections();
    }
    fetchPostDetails();
});

</script>

<style scoped lang="scss">
.post-detail-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 0 15px;
}

.page-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .header-content {
        font-size: 18px;
        color: var(--el-text-color-primary);
    }
}

.post-content-card,
.comments-section-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
    padding: 20px 25px;
    margin-bottom: 20px;
}

.author-info {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .author-avatar {
        margin-right: 12px;
    }

    .author-details {
        display: flex;
        flex-direction: column;

        .author-username {
            font-weight: 600;
            font-size: 15px;
            color: var(--el-text-color-primary);
            margin-bottom: 3px;
        }

        .post-time {
            font-size: 12px;
            color: var(--el-text-color-secondary);
        }
    }
}

.post-body {
    font-size: 15px;
    line-height: 1.8;
    color: var(--el-text-color-regular);
    margin-bottom: 15px;
    white-space: pre-wrap;
    /* Ensures 
 are treated as line breaks */
    word-break: break-word;
}

.post-images {
    margin-bottom: 25px;
}

.post-image-item {
    max-width: 100%;
    max-height: 500px;
    border-radius: 4px;
    display: block;
    margin-bottom: 10px;
}

.post-actions {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid var(--el-border-color-lighter);
    display: flex;
    gap: 15px;

    .el-button {
        padding: 8px;
    }
}

.comments-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.loading-state,
.not-found {
    padding: 40px 20px;
    text-align: center;
}
</style>