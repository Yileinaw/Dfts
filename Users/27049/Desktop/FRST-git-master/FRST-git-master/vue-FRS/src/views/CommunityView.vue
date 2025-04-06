<template>
    <div class="community-view">
        <div class="community-header">
            <h2>交流分享</h2>
            <el-button type="primary" :icon="EditPen" @click="openCreateDialog">发布新帖</el-button>
        </div>

        <!-- Sorting/Filtering Tabs (Keep as is for now) -->
        <el-tabs v-model="activeTab" class="post-tabs">
            <el-tab-pane label="最新回复" name="latestReply"></el-tab-pane>
            <el-tab-pane label="最新发布" name="latestPost"></el-tab-pane>
            <el-tab-pane label="热门帖子" name="hotPost"></el-tab-pane>
        </el-tabs>

        <!-- Post List -->
        <div v-if="loading" class="loading-state">
            <el-skeleton :rows="5" animated />
        </div>
        <!-- Always render post-list div when not loading -->
        <div class="post-list" v-else>
            <!-- Remove the simplified loop -->
            <!-- 
            <div v-if="posts.length" class="simplified-list-items">
                <div v-for="post in posts" :key="post.id" style="padding: 10px; border-bottom: 1px solid #eee;">
                    Post ID: {{ post.id }} - Content Snippet: {{ post.content ? post.content.substring(0, 20) : 'N/A' }}
                </div>
            </div>
             -->

            <!-- Restore Original loop and structure -->
            <div v-if="posts.length">
                <router-link v-for="post in posts" :key="post.id" :to="`/post/${post.id}`" class="post-item-link">
                    <div class="post-item">
                        <el-avatar :size="32" :src="post.author.avatar || defaultAvatar" class="post-avatar" />
                        <div class="post-details">
                            <div class="post-content-preview">{{ truncateContent(post.content) }}</div>
                            <div class="post-meta">
                                <span class="author-name">{{ post.author.username }}</span>
                                <span class="post-time">{{ formatRelativeTime(post.createdAt) }}</span>
                            </div>
                        </div>
                        <div class="post-stats">
                            <span class="stat-item"><el-icon>
                                    <ChatDotRound />
                                </el-icon> {{ post.commentsCount }}</span>
                            <span class="stat-item"><el-icon>
                                    <Star />
                                </el-icon> {{ post.likes }}</span>
                        </div>
                    </div>
                </router-link>
                <!-- Restore Pagination Placeholder -->
                <div class="pagination-container">
                    <el-pagination background layout="prev, pager, next" :total="50" />
                    <!-- TODO: Make pagination dynamic based on actual total posts -->
                </div>
            </div>
            <!-- Show empty state only if not loading AND posts are empty -->
            <el-empty description="还没有人分享，快来发布第一条吧！" v-if="!posts.length"></el-empty>
        </div>

        <!-- Create Post Dialog -->
        <CreatePostDialog v-model="showCreateDialog" @post-created="handlePostCreated" />

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElTabs, ElTabPane, ElButton, ElAvatar, ElEmpty, ElIcon, ElSkeleton, ElPagination } from 'element-plus';
import { EditPen, ChatDotRound, Star } from '@element-plus/icons-vue';
import CreatePostDialog from '@/components/business/CreatePostDialog.vue'; // Import the dialog
import { getAllPosts } from '@/utils/mockDataHelper';
import { formatRelativeTime } from '@/utils/timeFormatter.ts';
import type { PostInfo } from '@/types/api'; // Use the correct PostInfo type
import defaultAvatar from '@/assets/images/default-avatar.png';

const router = useRouter();
const activeTab = ref('latestReply');
const posts = ref<PostInfo[]>([]);
const loading = ref(true);
const showCreateDialog = ref(false); // State for dialog visibility

const fetchPosts = async () => {
    loading.value = true;
    try {
        // TODO: Implement sorting/pagination based on activeTab later
        const fetchedPosts = await getAllPosts();
        console.log('Fetched posts in CommunityView:', fetchedPosts);
        if (!Array.isArray(fetchedPosts)) {
            console.error('getAllPosts did not return an array!');
            posts.value = [];
        } else {
            posts.value = fetchedPosts;
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
        posts.value = []; // Ensure posts is an empty array on error
        // Handle error (e.g., show a message)
    } finally {
        loading.value = false;
    }
};

const openCreateDialog = () => {
    showCreateDialog.value = true;
};

// Handle the event when a post is created
const handlePostCreated = (newPost: PostInfo) => {
    // Option 1: Add to the top of the list directly (if sorted by creation date)
    // posts.value.unshift(newPost); 
    // Option 2: Refetch the list to ensure correct sorting/pagination
    fetchPosts();
};

// Helper to truncate content for preview
const truncateContent = (content: string, maxLength = 80) => {
    const cleanedContent = content.replace(/\n/g, ' '); // Replace newlines for preview
    if (cleanedContent.length <= maxLength) {
        return cleanedContent;
    }
    return cleanedContent.slice(0, maxLength) + '...';
};

onMounted(() => {
    fetchPosts();
});

</script>

<style scoped lang="scss">
.community-view {
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
}

.community-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
    }
}

.post-tabs {
    margin-bottom: 25px;
}

.post-list {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden; // Ensures border-radius applies correctly
}

.post-item-link {
    text-decoration: none;
    color: inherit; // Inherit text color
    display: block;
}

.post-item {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    transition: background-color 0.2s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: var(--el-fill-color-light);
    }

    .post-avatar {
        margin-right: 15px;
        flex-shrink: 0;
    }

    .post-details {
        flex-grow: 1;
        min-width: 0; // Prevents overflow issues
        margin-right: 20px;

        .post-content-preview {
            font-size: 15px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .post-meta {
            font-size: 13px;
            color: var(--el-text-color-secondary);

            .author-name {
                margin-right: 10px;
            }
        }
    }

    .post-stats {
        display: flex;
        align-items: center;
        gap: 15px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
        flex-shrink: 0;

        .stat-item {
            display: inline-flex; // Use inline-flex for icon alignment
            align-items: center;

            .el-icon {
                margin-right: 4px;
                vertical-align: middle; // Better vertical alignment
            }
        }
    }
}

.pagination-container {
    padding: 20px;
    display: flex;
    justify-content: center;
    background-color: #fff; // Match post-list background if needed
    border-top: 1px solid var(--el-border-color-lighter); // Separator line
}

.loading-state {
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
}
</style>