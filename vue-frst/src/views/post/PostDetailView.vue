<template>
  <div class="post-detail-view">
    <!-- Add Back Button -->
    <div class="back-button-container">
      <el-button :icon="Back" @click="goBack">返回</el-button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <el-skeleton :rows="10" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <div v-else-if="post" class="post-content-area">
      <!-- Post Header -->
      <div class="post-header">
        <h1>{{ post.title }}</h1>
        <div class="meta-bar"> 
          <div class="author-info">
            <el-avatar :size="32" :src="resolveStaticAssetUrl(post.author?.avatarUrl)" class="author-avatar" />
            <div class="info-text">
              <span class="author-name">{{ post.author?.name || '匿名用户' }}</span>
              <span class="publish-time">发布于 {{ formatTime(post.createdAt) }}</span>
            </div>
          </div>
          <!-- Moved Actions Here -->
          <div class="post-actions-inline">
            <el-button text :icon="post.isLiked ? StarFilled : Star" :type="post.isLiked ? 'primary' : ''" @click.stop="handleLike" :loading="isLiking">
              {{ post.likesCount || 0 }} 点赞
            </el-button>
            <el-button 
              text 
              :icon="post.isFavorited ? StarFilled : Star" 
              :type="post.isFavorited ? 'warning' : ''"  
              @click.stop="handleFavorite" 
              :loading="isFavoriting"
            >
              {{ post.favoritesCount || 0 }} 收藏
            </el-button>
          </div>
        </div>
      </div>

      <!-- Post Body -->
      <div class="post-body" v-html="renderedContent"></div>

      <!-- Comments Section -->
      <div class="comments-section">
        <h2>评论 ({{ post?.commentsCount || 0 }})</h2> 
        
        <!-- Top-level Comment Input -->
        <div class="comment-input-area top-level-input">
          <el-avatar :size="32" :src="userStore.resolvedAvatarUrl" class="comment-avatar"/>
          <div class="input-wrapper">
             <el-input type="textarea" :rows="2" placeholder="添加评论..." v-model="newCommentText"></el-input>
             <el-button 
                type="primary" 
                @click="submitComment({ parentId: null, text: newCommentText })" 
                :disabled="!newCommentText.trim()" 
                :loading="isSubmittingComment && replyingToCommentId === null"
              >
                发表评论
              </el-button>
          </div>
        </div>

        <el-divider />

        <!-- Comment List (Manual Two-Level Rendering with Flattened Replies) -->
        <div class="comment-list">
            <div v-if="isCommentsLoading" class="comments-loading">
                <el-skeleton :rows="5" animated />
            </div>
            <el-alert v-else-if="commentsError" :title="commentsError" type="error" show-icon />
            <div v-else-if="nestedComments.length > 0">
                 <!-- Loop through top-level comments -->
                 <template v-for="topLevelComment in nestedComments" :key="topLevelComment.id">
                    <CommentItem
                        :comment="topLevelComment"
                        @toggle-reply="handleToggleReply"      
                        @submit-comment="submitComment"  
                        @delete-comment="deleteComment" 
                        :reply-to-author-name="null"  
                    />
                    <!-- Render ALL descendants flattened into the second level -->
                    <div 
                        v-if="topLevelComment.children && topLevelComment.children.length > 0" 
                        class="replies-container" 
                        style="margin-left: 40px;" > 
                        <!-- Use flattenDescendants to get all replies -->
                        <CommentItem
                            v-for="reply in flattenDescendants(topLevelComment)" 
                            :key="reply.id"
                            :comment="reply" 
                            :reply-to-author-name="reply.replyToAuthorName" 
                            @toggle-reply="handleToggleReply"
                            @submit-comment="submitComment"
                            @delete-comment="deleteComment"
                        />
                    </div>
                 </template>
            </div>
            <el-empty description="暂无评论，快来抢沙发吧！" v-else />
        </div>
      </div>

    </div>
    <el-empty description="帖子未找到" v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElSkeleton, ElAlert, ElEmpty, ElAvatar, ElButton, ElInput, ElMessage, ElDivider } from 'element-plus';
import { Star, StarFilled, ChatLineSquare, Delete, Back } from '@element-plus/icons-vue';
import { PostService } from '@/services/PostService';
import type { Post, Comment, User } from '@/types/models'; // Import Comment type
import { marked } from 'marked'; // Import marked library
import { resolveStaticAssetUrl } from '@/utils/urlUtils'; // Correct import path
import { useUserStore } from '@/stores/modules/user';
import CommentItem from '@/components/comments/CommentItem.vue'; 

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const postId = ref<number | null>(null);
const post = ref<Post | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// --- Comment State ---
const comments = ref<Comment[]>([]);
const isCommentsLoading = ref(false);
const commentsError = ref<string | null>(null);
// --- End Comment State ---

// --- Action States ---
const isLiking = ref(false);
const isFavoriting = ref(false);
const isSubmittingComment = ref(false);
const newCommentText = ref('');

// --- Reply State ---
const replyingToCommentId = ref<number | null>(null);
const replyText = ref('');
const replyInputRef = ref<InstanceType<typeof ElInput> | null>(null);

// 使用 provide 提供状态
provide('replyingToCommentId', replyingToCommentId);

// --- Computed property for nested comments ---
interface NestedComment extends Comment {
    children?: NestedComment[];
}

const nestedComments = computed((): NestedComment[] => {
    const commentsMap: Record<number, NestedComment> = {};
    const rootComments: NestedComment[] = [];

    // Create a map of comments by their ID and add a children array
    comments.value.forEach(comment => {
        commentsMap[comment.id] = { ...comment, children: [] };
    });

    // Build the nested structure
    comments.value.forEach(comment => {
        const nestedComment = commentsMap[comment.id];
        if (comment.parentId && commentsMap[comment.parentId]) {
            // Ensure children array exists before pushing
            if (!commentsMap[comment.parentId].children) {
                commentsMap[comment.parentId].children = [];
            }
            commentsMap[comment.parentId].children!.push(nestedComment);
        } else {
            rootComments.push(nestedComment);
        }
    });

    // Sort comments and their children by creation date (optional)
    const sortComments = (list: NestedComment[]) => {
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        list.forEach(c => {
            if (c.children) sortComments(c.children);
        });
    };
    sortComments(rootComments);

    return rootComments;
});
// --- End Computed property for nested comments ---

// --- Computed property for rendered Markdown content ---
const renderedContent = computed(() => {
    if (post.value?.content) {
        // Configure marked (optional, enable GFM for tables, strikethrough etc.)
        // marked.use({ gfm: true }); 
        try {
            // Use DOMPurify here if content comes from untrusted sources EVEN AFTER marked
            // import DOMPurify from 'dompurify';
            // return DOMPurify.sanitize(marked.parse(post.value.content));
            return marked.parse(post.value.content); // Assuming marked output is safe enough for now
        } catch (e) {
            console.error("Error parsing markdown:", e);
            return '<p>内容解析错误</p>'; // Fallback content
        }
    } 
    return ''; // Return empty string if no content
});
// --- End Computed property ---

const fetchComments = async () => {
    if (!postId.value) return;
    isCommentsLoading.value = true;
    commentsError.value = null;
    try {
        const response = await PostService.getCommentsByPostId(postId.value);
        comments.value = response || []; 
    } catch (err: any) {
        console.error('Error fetching comments:', err);
        commentsError.value = err.response?.data?.message || '加载评论失败';
        comments.value = []; // Clear comments on error
    } finally {
        isCommentsLoading.value = false;
    }
};

const fetchPostDetails = async () => {
  const id = parseInt(route.params.id as string, 10);
  if (isNaN(id)) {
    error.value = '无效的帖子 ID';
    isLoading.value = false;
    return;
  }
  postId.value = id;
  isLoading.value = true;
  error.value = null;
  try {
    const responseWrapper = await PostService.getPostById(id);
    console.log('[fetchPostDetails] API Response Wrapper:', responseWrapper);
    
    const fetchedPost = responseWrapper.post; 

    if (fetchedPost) { 
      post.value = fetchedPost;
      console.log('[fetchPostDetails] Assigned post.value.author:', JSON.stringify(post.value.author)); 
      await fetchComments(); 
    } else {
      post.value = null;
      error.value = '帖子未找到或数据格式错误'; 
    }
  } catch (err: any) {
     console.error('Error fetching post details:', err);
     post.value = null;
     error.value = err.response?.data?.message || '加载帖子详情失败';
  } finally {
    isLoading.value = false;
  }
};

const formatTime = (isoString: string | undefined): string => {
  if (!isoString) return '未知时间';
  const date = new Date(isoString);
  // Use a more detailed format for the post page
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

// --- Action Handlers (Basic Placeholders/Logic) ---

const handleLike = async () => {
  if (!post.value) return;
  if (!userStore.isLoggedIn) return ElMessage.warning('请先登录');
  if (isLiking.value) return;
  isLiking.value = true;

  try {
    const currentPost = post.value; // Work on a local copy
    if (currentPost.isLiked) {
      await PostService.unlikePost(currentPost.id);
      currentPost.likesCount = (currentPost.likesCount ?? 1) - 1;
      currentPost.isLiked = false;
    } else {
      await PostService.likePost(currentPost.id);
      currentPost.likesCount = (currentPost.likesCount ?? 0) + 1;
      currentPost.isLiked = true;
    }
    // Update the reactive post ref - might need adjustments if backend returns updated post
    post.value = { ...currentPost }; 
  } catch (err: any) {
     ElMessage.error(err.response?.data?.message || '点赞操作失败');
  } finally {
    isLiking.value = false;
  }
};

const handleFavorite = async () => {
  if (!post.value) return;
  if (!userStore.isLoggedIn) return ElMessage.warning('请先登录');
  if (isFavoriting.value) return;
  isFavoriting.value = true;
  
  try {
    const currentPost = post.value;
    if (currentPost.isFavorited) {
      await PostService.unfavoritePost(currentPost.id);
      currentPost.favoritesCount = (currentPost.favoritesCount ?? 1) - 1;
      currentPost.isFavorited = false;
    } else {
      await PostService.favoritePost(currentPost.id);
      currentPost.favoritesCount = (currentPost.favoritesCount ?? 0) + 1;
      currentPost.isFavorited = true;
    }
     post.value = { ...currentPost }; 
  } catch (err: any) {
     ElMessage.error(err.response?.data?.message || '收藏操作失败');
  } finally {
    isFavoriting.value = false;
  }
};

const submitComment = async (payload: { parentId: number | null; text: string }) => {
    if (!post.value) return;
    const { parentId, text } = payload;

    if (!text || !text.trim()) {
        ElMessage.warning('评论内容不能为空');
        return;
    }
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录');
        return;
    }
    
    // Determine which loading state to use
    const setLoading = (loading: boolean) => {
      if (parentId === null) {
        isSubmittingComment.value = loading; // Top-level comment loading
      } else {
        // For replies, CommentItem has its own loading state, 
        // but we might need a general loading state or handle it differently
        isSubmittingComment.value = loading; // Use general one for now
      }
    };

    setLoading(true);

    try {
        // Prepare the payload for the service
        const servicePayload: { text: string; parentId?: number } = {
            text: text.trim(),
        };
        if (parentId !== null) {
            servicePayload.parentId = parentId;
        }

        await PostService.createComment(post.value.id, servicePayload);
        ElMessage.success(parentId ? '回复发表成功' : '评论发表成功');

        // Clear the correct input and close reply box
        if (parentId !== null) {
            // Clear replyText in CommentItem? - No, CommentItem clears its own input on emit
            replyingToCommentId.value = null; // Close the reply input box globally
        } else {
            newCommentText.value = ''; // Clear top-level comment input
        }

        await fetchComments(); // Refresh comments list
        if (post.value) {
            // Update count (consider potential race conditions if backend doesn't return updated count)
            post.value.commentsCount = (post.value.commentsCount || 0) + 1;
        }
    } catch (err: any) {
        console.error("Error submitting comment/reply:", err);
        ElMessage.error(err.response?.data?.message || (parentId ? '回复发表失败' : '评论发表失败'));
    } finally {
        setLoading(false);
    }
};

const handleToggleReply = (id: number) => {
  console.log('[PostDetailView] handleToggleReply called with id:', id);
  console.log('[PostDetailView] Current replyingToCommentId before change:', replyingToCommentId.value);
  if (replyingToCommentId.value === id) {
    replyingToCommentId.value = null; // Close if already open
    console.log('[PostDetailView] Closing reply input for comment id:', id);
  } else {
    replyingToCommentId.value = id; // Open for this comment
    console.log('[PostDetailView] Opening reply input for comment id:', id);
  }
  console.log('[PostDetailView] Current replyingToCommentId after change:', replyingToCommentId.value);
};

const deleteComment = async (id: number) => {
    if (!post.value || !userStore.isLoggedIn) return;
    // Optional: Confirmation dialog
    try {
        await PostService.deleteComment(id);
        ElMessage.success('评论删除成功');
        // Update comments count locally (consider race conditions)
        if (post.value && post.value.commentsCount) {
            // Find the comment and its children to adjust count accurately
            let countToRemove = 1;
            // Helper function to find a comment in the nested structure
            const findComment = (commentId: number, list: NestedComment[]): NestedComment | null => {
                for (const c of list) {
                    if (c.id === commentId) return c;
                    if (c.children) {
                        const found = findComment(commentId, c.children);
                        if (found) return found;
                    }
                }
                return null;
            };
            // Helper function to count all children recursively
            const countChildren = (comment: NestedComment | null): number => {
                if (!comment || !comment.children || comment.children.length === 0) return 0;
                let count = comment.children.length;
                comment.children.forEach((child: NestedComment) => { 
                    count += countChildren(child);
                });
                return count;
            };
            const commentToDelete = findComment(id, nestedComments.value); // Search in nested structure
            if (commentToDelete) {
                countToRemove += countChildren(commentToDelete);
            }
            // Ensure count doesn't go below zero
            post.value.commentsCount = Math.max(0, post.value.commentsCount - countToRemove);
        }
        await fetchComments(); // Refresh the comments list from the server
    } catch (err: any) {
        console.error('Error deleting comment:', err);
        ElMessage.error(err.response?.data?.message || '评论删除失败');
    }
};

// --- Helper function to flatten descendants and get parent author name ---
interface FlattenedComment extends Comment {
    replyToAuthorName?: string | null;
}

const flattenDescendants = (comment: NestedComment): FlattenedComment[] => {
    let descendants: FlattenedComment[] = [];
    const parentAuthorName = comment.author?.name || '匿名用户'; // Get the name of the comment being replied to

    const traverse = (children: NestedComment[], currentParentAuthorName: string | null) => {
        if (!children) return;
        children.forEach(child => {
            // Add the current child with the name of the author it directly replies to
            descendants.push({ ...child, replyToAuthorName: currentParentAuthorName });
            // Recursively traverse its children, passing the current child's author name
            traverse(child.children || [], child.author?.name || '匿名用户');
        });
    };

    // Start traversal with the direct children, passing the top-level comment's author name
    traverse(comment.children || [], parentAuthorName);
    return descendants;
};
// --- End Helper Function ---

onMounted(() => {
  fetchPostDetails();
});

// Optional: Watch for route changes if user navigates between posts directly
// watch(() => route.params.id, fetchPostDetails);

// Function to go back
const goBack = () => {
  router.back(); // Use router.back() to navigate to the previous page
};

</script>

<style scoped lang="scss">
.post-detail-view {
  max-width: 800px; // Limit content width for readability
  margin: 20px auto; // Center the content
  padding: 25px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-state, .el-alert, .el-empty {
  margin-top: 30px;
}

.post-header {
  margin-bottom: 30px;
  padding-bottom: 0; // Remove padding-bottom from header itself
  border-bottom: none; // Remove border from header itself

  h1 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 15px;
    color: #303133;
  }

  .meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px; // Add padding below the meta bar
      border-bottom: 1px solid var(--el-border-color-lighter); // Add border below meta bar
      margin-top: 10px; // Space between title and meta bar
  }

  .author-info {
    display: flex;
    align-items: center;

    .author-avatar {
      margin-right: 12px;
    }

    .info-text {
      display: flex;
      flex-direction: column;
      .author-name {
        font-weight: 500;
        color: #555;
        margin-bottom: 2px;
      }
      .publish-time {
        font-size: 0.85rem;
        color: #909399;
      }
    }
  }

  // Styles for the inline actions
  .post-actions-inline {
      display: flex;
      gap: 15px; 
      .el-button {
          padding: 0 5px; // Adjust padding if needed
      }
  }
}

.post-body {
  line-height: 1.8; 
  font-size: 1rem;
  color: #333;
  margin-bottom: 30px;
  
  /* Deep styles for rendered Markdown content */
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 1.5em;
    margin-bottom: 0.8em;
    font-weight: 600;
    line-height: 1.4;
  }
  :deep(h1) { font-size: 1.8em; }
  :deep(h2) { font-size: 1.5em; border-bottom: 1px solid var(--el-border-color-lighter); padding-bottom: 0.3em; }
  :deep(h3) { font-size: 1.3em; }
  :deep(h4) { font-size: 1.1em; }

  :deep(p) { 
     margin-bottom: 1.2em;
     word-wrap: break-word; // Ensure long words wrap
  }
  
   :deep(ul),
   :deep(ol) {
     padding-left: 2em;
     margin-bottom: 1.2em;
   }
   :deep(li) {
       margin-bottom: 0.5em;
   }

   :deep(img) { 
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin: 1.5em 0;
      display: block; // Prevent extra space below image
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
   }
   
   :deep(blockquote) {
       margin: 1.5em 0;
       padding: 10px 15px;
       border-left: 4px solid var(--el-color-primary-light-3);
       background-color: var(--el-fill-color-light);
       color: #555;
       p {
           margin-bottom: 0; // Remove bottom margin for paragraphs inside blockquote
       }
   }
   
   :deep(pre) {
       margin: 1.5em 0;
       padding: 15px;
       background-color: #f5f7fa;
       border-radius: 4px;
       overflow-x: auto; // Enable horizontal scrolling for long code lines
       code {
           font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
           font-size: 0.9em;
           color: #333;
           background-color: transparent; // Override potential inner background
           padding: 0; // Override potential inner padding
       }
   }
   
   :deep(code) { // Inline code
       font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
       background-color: #f0f2f5;
       padding: 0.2em 0.4em;
       border-radius: 3px;
       font-size: 0.9em;
   }
   
   :deep(a) {
       color: var(--el-color-primary);
       text-decoration: none;
       &:hover {
           text-decoration: underline;
       }
   }
   
   :deep(hr) {
       border: none;
       border-top: 1px solid var(--el-border-color-lighter);
       margin: 2em 0;
   }
}

.comments-section {
  margin-top: 40px;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .comment-input-area {
    margin-bottom: 30px;
    .el-textarea {
      margin-bottom: 10px;
    }
    div > .el-button {
        float: right;
        margin-top: 5px;
    }
  }

  .comment-list {
    margin-top: 20px;

    .comments-loading {
        padding: 20px 0;
    }
    .el-alert {
        margin-bottom: 15px;
    }

    .el-empty {
         padding: 30px 0;
     }
  }
}

.comment-input-area.top-level-input {
    display: flex;
    align-items: flex-start; // Align avatar top
    margin-bottom: 20px;
    .comment-avatar {
        margin-right: 15px;
        flex-shrink: 0;
    }
    .input-wrapper {
        flex-grow: 1;
        .el-textarea {
            margin-bottom: 10px;
        }
        .el-button {
            float: right;
        }
    }
}

// Style for the back button container
.back-button-container {
  margin-bottom: 15px; // Space below the back button
  padding-bottom: 10px; // Optional: Extra space
  // border-bottom: 1px solid var(--el-border-color-lighter); // Optional: Separator line
}
</style> 