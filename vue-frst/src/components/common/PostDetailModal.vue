<template>
  <el-dialog
    v-model="dialogVisible"
    :title="post ? post.title : '帖子详情'"
    width="70%" 
    :before-close="handleClose"
    @opened="loadData" 
    class="post-detail-modal"
    append-to-body 
  >
    <el-skeleton :rows="5" animated v-if="loading" />
    <el-alert
      v-else-if="error"
      title="加载帖子失败"
      type="error"
      :description="error"
      show-icon
      :closable="false"
    />
    <div v-else-if="post" class="modal-content">
        <div class="post-header-modal">
            <el-avatar :size="40" :src="resolveStaticAssetUrl(post.author?.avatarUrl)" />
            <span class="username">{{ post.author?.name || '匿名用户' }}</span>
            <span class="time">{{ formatTime(post.createdAt) }}</span>
        </div>
        <p class="post-content-modal">{{ post.content }}</p>
         <!-- Display images if available -->

        <!-- Like/Comment/Favorite Actions -->
         <div class="post-actions-modal">
             <el-button 
                 text 
                 :icon="post.isLiked ? StarFilled : Star" 
                 :type="post.isLiked ? 'primary' : ''" 
                 @click="handleLike" 
                 :loading="isLiking"
             >
                 {{ post.likesCount || 0 }} 点赞
             </el-button>
             <el-button 
                 text 
                 :icon="post.isFavorited ? StarFilled : Star" 
                 :type="post.isFavorited ? 'warning' : ''" 
                 @click="handleFavorite" 
                 :loading="isFavoriting"
             >
                 {{ post.favoritesCount || 0 }} 收藏
             </el-button>
             <span>{{ post.commentsCount || 0 }} 评论</span> 
         </div>

        <el-divider />

        <!-- Comments Section -->
        <div class="comments-section-modal" id="comments-modal">
            <h4>评论</h4>
            <!-- Comment Input -->
            <div class="comment-input-area" v-if="userStore.isLoggedIn">
               <el-input
                 v-model="newCommentText"
                 type="textarea"
                 :rows="2" 
                 placeholder="添加评论..."
                 maxlength="500"
                 show-word-limit
               />
               <el-button type="primary" @click="submitComment" :loading="isSubmittingComment" size="small" style="margin-top: 8px;">
                 发表
               </el-button>
            </div>
             <div v-else>
                 <el-text type="info" size="small">请<router-link :to="{name: 'Login', query: { redirect: $route.fullPath } }">登录</router-link>后发表评论</el-text>
             </div>

            <!-- Comment List -->
            <el-skeleton :rows="3" animated v-if="loadingComments" style="margin-top: 15px;" />
             <el-alert
                 v-else-if="commentsError"
                 title="加载评论失败"
                 type="error"
                 :description="commentsError"
                 show-icon
                 :closable="false"
                 size="small"
                 style="margin-top: 15px;"
             />
            <ul class="comment-list-modal" v-else-if="comments.length > 0">
              <li v-for="comment in comments" :key="comment.id" class="comment-item-modal">
                <div class="comment-header-modal">
                    <el-avatar :size="24" :src="resolveStaticAssetUrl(comment.author?.avatarUrl)" />
                    <span class="comment-author">{{ comment.author?.name || '匿名用户' }}</span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                     <el-button 
                         v-if="userStore.currentUser?.id === comment.authorId"
                         type="danger" 
                         link 
                         size="small"
                         @click="deleteComment(comment.id)"
                         class="delete-comment-btn"
                     >
                         删除
                     </el-button>
                </div>
                <p class="comment-text-modal">{{ comment.text }}</p>
              </li>
            </ul>
            <el-empty description="暂无评论" v-else :image-size="60" />
             <!-- Add Pagination for comments if needed -->
        </div>
    </div>
     <el-empty description="帖子未找到" v-else :image-size="100" />

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ElDialog, ElButton, ElSkeleton, ElAlert, ElEmpty, ElInput, ElDivider, ElMessage, ElText, ElAvatar, ElMessageBox } from 'element-plus';
import { Star, StarFilled } from '@element-plus/icons-vue';
import { PostService } from '@/services/PostService';
import type { Post, Comment } from '@/types/models';
import { useUserStore } from '@/stores/modules/user';
import { useRouter, useRoute } from 'vue-router'; // Need route for login redirect
import { resolveStaticAssetUrl } from '@/utils/urlUtils'; // Ensure imported

const props = defineProps<{ 
    postId: number | null; 
    visible: boolean; 
}>();

const emit = defineEmits(['update:visible', 'postUpdated']); // Emit event when post data inside modal changes

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const dialogVisible = ref(false);
const post = ref<Post | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const comments = ref<Comment[]>([]);
const loadingComments = ref(false);
const commentsError = ref<string | null>(null);
const newCommentText = ref('');
const isSubmittingComment = ref(false);
const isLiking = ref(false);
const isFavoriting = ref(false); // Add loading state for favorite

// --- Watchers to sync prop and local state ---
watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue;
});

watch(dialogVisible, (newValue) => {
  if (!newValue) {
      emit('update:visible', false); // Notify parent when closed internally
  }
});

// --- Utility Functions ---
const formatTime = (isoString: string): string => {
  if (!isoString) return '未知时间';
  const date = new Date(isoString);
  return date.toLocaleString(); 
};

// --- Data Fetching ---
const loadData = async () => {
    if (!props.postId) {
        error.value = '无效的帖子 ID';
        loading.value = false;
        return;
    }
    loading.value = true;
    error.value = null;
    loadingComments.value = true; // Reset comment loading state
    commentsError.value = null; 
    comments.value = []; // Clear previous comments
    newCommentText.value = ''; // Clear comment input
    try {
        const response = await PostService.getPostById(props.postId);
        if (response && response.post) {
            post.value = response.post;
            await fetchComments(props.postId);
        } else {
            post.value = null;
            error.value = '帖子数据加载失败或不存在。';
        }
    } catch (err: any) {
        console.error('Failed to fetch post details in modal:', err);
        error.value = err.response?.data?.message || '加载帖子时发生错误';
        post.value = null;
    } finally {
        loading.value = false;
    }
};

const fetchComments = async (id: number) => {
    loadingComments.value = true;
    commentsError.value = null;
    try {
        const response: any = await PostService.getCommentsByPostId(id);
        if (response && Array.isArray(response)) {
             comments.value = response;
        } else if (response && response.comments && Array.isArray(response.comments)) {
            comments.value = response.comments;
        } else {
            comments.value = [];
            console.warn('[PostDetailModal] Invalid or empty comments response structure:', response);
        }
    } catch (err: any) {
        console.error('Failed to fetch comments in modal:', err);
        commentsError.value = err.response?.data?.message || '加载评论时发生错误';
        comments.value = [];
    } finally {
        loadingComments.value = false;
    }
};

// --- Actions ---
const handleClose = () => {
  emit('update:visible', false);
};

const handleLike = async () => {
  if (!post.value) return;
  if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录');
      // Consider closing modal and redirecting, or just show message
      // router.push({ name: 'Login', query: { redirect: route.fullPath } }); 
      return;
  }
  if (isLiking.value) return;
  isLiking.value = true;

  const currentIsLiked = post.value.isLiked;
  const currentLikesCount = post.value.likesCount || 0;

  // Optimistic update
  post.value.isLiked = !currentIsLiked;
  post.value.likesCount = currentIsLiked ? currentLikesCount - 1 : currentLikesCount + 1;
  emit('postUpdated', post.value); // Notify parent about the change

  try {
    if (currentIsLiked) {
      await PostService.unlikePost(post.value.id);
    } else {
      await PostService.likePost(post.value.id);
    }
  } catch (error: any) {
    console.error('Failed to update like status in modal:', error);
    ElMessage.error(error.response?.data?.message || '点赞操作失败');
    // Rollback optimistic update
    if (post.value) {
        post.value.isLiked = currentIsLiked;
        post.value.likesCount = currentLikesCount;
        emit('postUpdated', post.value); // Notify parent about the rollback
    }
  } finally {
    isLiking.value = false;
  }
};

// --- Add Favorite Logic --- 
const handleFavorite = async () => {
  if (!post.value) return;
  if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录');
      return;
  }
  if (isFavoriting.value) return;
  isFavoriting.value = true;

  const currentIsFavorited = post.value.isFavorited;
  const currentFavoritesCount = post.value.favoritesCount || 0;

  // Optimistic Update
  post.value.isFavorited = !currentIsFavorited;
  post.value.favoritesCount = currentIsFavorited ? currentFavoritesCount - 1 : currentFavoritesCount + 1;
  emit('postUpdated', post.value); // Notify parent

  try {
    if (currentIsFavorited) {
      await PostService.unfavoritePost(post.value.id);
    } else {
      await PostService.favoritePost(post.value.id);
    }
  } catch (error: any) {
    console.error('Failed to update favorite status in modal:', error);
    ElMessage.error(error.response?.data?.message || '收藏操作失败');
    // Rollback optimistic update
    if (post.value) {
        post.value.isFavorited = currentIsFavorited;
        post.value.favoritesCount = currentFavoritesCount;
        emit('postUpdated', post.value); // Notify parent about rollback
    }
  } finally {
    isFavoriting.value = false;
  }
}
// --- End Add Favorite Logic ---

const submitComment = async () => {
  if (!post.value || !newCommentText.value.trim()) return;
   if (!userStore.isLoggedIn) {
       ElMessage.warning('请先登录再评论');
       return;
   }
  isSubmittingComment.value = true;
  try {
    const response = await PostService.createComment(post.value.id, { text: newCommentText.value.trim() });
    if (response && response.comment) {
        const newCommentWithAuthor = {
            ...response.comment,
            author: {
                id: userStore.currentUser?.id ?? 0,
                name: userStore.currentUser?.name ?? '您'
            }
        };
        comments.value.unshift(newCommentWithAuthor as Comment);
        if (post.value.commentsCount !== undefined) {
             post.value.commentsCount++;
             emit('postUpdated', post.value); // Notify parent about comment count change
        }
        newCommentText.value = '';
        ElMessage.success('评论成功');
    } else {
         ElMessage.error('评论失败，请重试');
    }
  } catch (error: any) {
    console.error('Failed to submit comment in modal:', error);
    ElMessage.error(error.response?.data?.message || '发表评论失败');
  } finally {
    isSubmittingComment.value = false;
  }
};

const deleteComment = async (commentId: number) => {
    if (!post.value) return;
    const commentToDelete = comments.value.find(c => c.id === commentId);
    if (!commentToDelete || commentToDelete.authorId !== userStore.currentUser?.id) {
        // This check might be redundant if button is hidden, but good for safety
        ElMessage.warning('无法删除他人评论'); 
        return;
    }
    try {
        await ElMessageBox.confirm('确定要删除这条评论吗?', '确认删除', { type: 'warning' });
        await PostService.deleteComment(commentId);
        comments.value = comments.value.filter(c => c.id !== commentId);
        if (post.value.commentsCount !== undefined) {
            post.value.commentsCount--;
             emit('postUpdated', post.value); // Notify parent about comment count change
        }
        ElMessage.success('评论已删除');
    } catch (error: any) {
        if (error !== 'cancel') {
            console.error('Failed to delete comment in modal:', error);
            ElMessage.error(error.response?.data?.message || '删除评论失败');
        }
    }
};

</script>

<style scoped lang="scss">
.post-detail-modal .el-dialog__body {
    padding-top: 10px; 
    padding-bottom: 10px;
}

.modal-content {
    /* Add styles if needed */
}

.post-header-modal {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  .username {
    margin-left: 10px;
    font-weight: 500;
  }
  .time {
    margin-left: auto;
    font-size: 0.85rem;
    color: #909399;
  }
}

.post-content-modal {
    line-height: 1.7;
    white-space: pre-wrap; 
    margin-bottom: 20px;
}

.post-actions-modal {
    padding-top: 15px;
    border-top: 1px solid var(--el-border-color-lighter);
    .el-button {
        margin-right: 15px;
    }
    span {
        margin-left: 15px;
        color: #606266;
        font-size: 0.9rem;
    }
}

.comments-section-modal {
  margin-top: 20px;
  h4 {
      margin-bottom: 15px;
      font-size: 1.1rem;
  }
}

.comment-input-area {
    margin-bottom: 20px;
}

.comment-list-modal {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px; /* Limit height and add scroll */
  overflow-y: auto;
}

.comment-item-modal {
  padding: 10px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  &:last-child {
    border-bottom: none;
  }
}

.comment-header-modal {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  .comment-author {
    margin-left: 8px;
    font-weight: bold;
    font-size: 0.85rem;
  }
  .comment-time {
    margin-left: auto;
    font-size: 0.75rem;
    color: #909399;
  }
  .delete-comment-btn {
      margin-left: 10px; 
  }
}

.comment-text-modal {
  margin: 0 0 0 32px; /* Indent text slightly */
  font-size: 0.9rem;
  line-height: 1.6;
  color: #303133;
}
</style> 