<template>
  <el-card shadow="hover" class="share-card" @click="handleCardClick">
    <template #header>
      <div class="share-header">
        <el-avatar :size="40" :src="getAvatarUrl(post.author?.avatarUrl)" @click.stop="handleAvatarClick" class="clickable-avatar" />
        <span class="username">{{ post.author?.name || '匿名用户' }}</span>
        <span class="time">{{ formatTime(post.createdAt) }}</span>
      </div>
    </template>

    <!-- Remove click handler from title container -->
    <div class="title-container">
        <h3 class="post-title" v-if="post.title">{{ post.title }}</h3>
    </div>

    <!-- Card body now mainly contains content -->
    <div class="card-body">
      <div class="post-content">
        <p class="truncated-content">{{ post.content }}</p>
        <!-- 暂时移除图片，因为后端 Post 模型没有 imageUrl -->
        <!--
        <el-image
          v-if="post.imageUrl"
          :src="post.imageUrl"
          fit="cover"
          class="post-image"
          lazy
          :preview-src-list="[post.imageUrl]"
          preview-teleported
         ></el-image>
         -->
      </div>
    </div>

    <div class="post-actions">
      <!-- Like Button -->
      <el-button text :icon="post.isLiked ? StarFilled : Star" :type="post.isLiked ? 'primary' : ''" @click.stop="handleLike" :loading="isLiking">
        {{ post.likesCount || 0 }} 点赞
      </el-button>
      <!-- Comment Button -->
      <el-button text :icon="ChatDotSquare" @click.stop="handleComment">{{ post.commentsCount || 0 }} 评论</el-button>
      <!-- Favorite Button -->
      <el-button 
        text 
        :icon="post.isFavorited ? StarFilled : Star" 
        :type="post.isFavorited ? 'warning' : ''"  
        @click.stop="handleFavorite" 
        :loading="isFavoriting"
      >
        {{ post.favoritesCount || 0 }} 收藏
      </el-button>
      <el-button text :icon="MoreFilled" class="more-options" @click.stop></el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'; // Import ref for loading state
import { ElCard, ElAvatar, ElImage, ElButton, ElMessage } from 'element-plus' // Import ElMessage
import { Pointer, ChatDotSquare, Star, StarFilled, MoreFilled } from '@element-plus/icons-vue'
import type { Post } from '@/types/models';
import { PostService } from '@/services/PostService';
import { useUserStore } from '@/stores/modules/user';
import { useRouter } from 'vue-router'; // Import router for navigation
import { resolveStaticAssetUrl } from '@/utils/urlUtils'; // Import the utility function

const props = defineProps<{ post: Post }>()
const emit = defineEmits(['like', 'comment', 'favorite', 'update:post']) // Add update:post emit

const isLiking = ref(false);
const isFavoriting = ref(false); // Add loading state for favorite
const userStore = useUserStore();
const router = useRouter(); // Get router instance

// Wrapper function to be used in the template
const getAvatarUrl = (url: string | null | undefined): string => {
  // You can add a default path specific to the card context if needed
  // e.g., const defaultCardAvatar = '/path/to/card/default.png';
  return resolveStaticAssetUrl(url /*, defaultCardAvatar */);
};

const formatTime = (isoString: string): string => {
  if (!isoString) return '未知时间';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
}

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    return;
  }
  
  if (isLiking.value) return;
  isLiking.value = true;

  const updatedPostData: Partial<Post> = { 
      likesCount: props.post.likesCount || 0, 
      isLiked: props.post.isLiked 
  };

  try {
    if (props.post.isLiked) {
      await PostService.unlikePost(props.post.id);
      updatedPostData.likesCount = (updatedPostData.likesCount ?? 1) - 1;
      updatedPostData.isLiked = false;
    } else {
      await PostService.likePost(props.post.id);
      updatedPostData.likesCount = (updatedPostData.likesCount ?? 0) + 1;
      updatedPostData.isLiked = true;
    }
    emit('update:post', { ...props.post, ...updatedPostData });
    
  } catch (error: any) {
    console.error('Failed to update like status:', error);
    ElMessage.error(error.response?.data?.message || '操作失败');
  } finally {
    isLiking.value = false;
  }
}

const handleComment = () => {
  console.log('Comment button clicked for post:', props.post.id);
  // Navigate to the detail page and perhaps add a query/hash to focus comments
  router.push(`/posts/${props.post.id}?focus=comments`); 
  // emit('comment', props.post.id) // No longer emit to open modal
}

const handleCardClick = () => {
    console.log('Card click event triggered for post:', props.post.id);
    // Navigate to the detail page
    router.push(`/posts/${props.post.id}`);
    // emit('comment', props.post.id); // No longer emit to open modal
};

const handleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    return;
  }
  if (isFavoriting.value) return;
  isFavoriting.value = true;

  const currentIsFavorited = props.post.isFavorited;
  const currentFavoritesCount = props.post.favoritesCount || 0;
  const updatedPostData: Partial<Post> = { 
      favoritesCount: currentFavoritesCount,
      isFavorited: currentIsFavorited 
  };

  // Optimistic Update
  updatedPostData.isFavorited = !currentIsFavorited;
  updatedPostData.favoritesCount = currentIsFavorited ? currentFavoritesCount - 1 : currentFavoritesCount + 1;
  emit('update:post', { ...props.post, ...updatedPostData });

  try {
    if (currentIsFavorited) {
      await PostService.unfavoritePost(props.post.id);
    } else {
      await PostService.favoritePost(props.post.id);
    }
    // API call successful, optimistic update is confirmed
  } catch (error: any) {
    console.error('Failed to update favorite status:', error);
    ElMessage.error(error.response?.data?.message || '收藏操作失败');
    // Rollback optimistic update on error
    emit('update:post', { ...props.post, isFavorited: currentIsFavorited, favoritesCount: currentFavoritesCount });
  } finally {
    isFavoriting.value = false;
  }
}

// Placeholder function for future avatar click logic
const handleAvatarClick = () => {
    console.log('Avatar clicked for author:', props.post.author?.id);
    // TODO: Implement navigation to user profile page in the future
    // Example: router.push(`/user/${props.post.author?.id}`);
    ElMessage.info('查看用户详情功能待实现'); // Temporary feedback
};

</script>

<style scoped lang="scss">
.share-card {
  margin-bottom: 20px;
  cursor: pointer;

  .share-header {
    display: flex;
    align-items: center;
    cursor: default;
    
    // Style for the clickable avatar
    .clickable-avatar {
        cursor: pointer; // Indicate it's clickable
        // Optional: add slight visual feedback on hover
        transition: opacity 0.2s ease;
        &:hover {
            opacity: 0.85;
        }
    }

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

  .title-container {
      padding: 15px 20px 10px 20px; 
      margin-bottom: 10px; 
      border-left: 4px solid var(--el-color-primary-light-5); 
      cursor: default;
      transition: background-color 0.2s ease;

      &:hover {
         border-left-color: var(--el-color-primary); 
      }

      .post-title {
        margin: 0;
        font-size: 1.25rem; 
        font-weight: 600;
        line-height: 1.4;
        color: #303133;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2; 
        overflow: hidden;
        text-overflow: ellipsis;
      }
  }

  .card-body {
     padding: 0 20px 15px 20px; 
     cursor: default;
  }

  .post-content {
     .truncated-content {
         margin: 0 0 15px 0; 
         line-height: 1.6;
         display: -webkit-box;
         -webkit-box-orient: vertical;
         -webkit-line-clamp: 3;
         overflow: hidden;
         text-overflow: ellipsis;
         white-space: pre-wrap;
         color: var(--el-text-color-regular);
         min-height: calc(1.6em * 3);
     }
  }

  .post-actions {
      padding: 10px 20px 15px 20px;
      border-top: 1px solid var(--el-border-color-lighter); 
      display: flex;
      align-items: center;
      cursor: default;
      .el-button {
          margin-right: 15px;
          color: #606266;
          cursor: pointer;
          &:hover {
             color: var(--el-color-primary);
          }
      }
      .more-options {
          margin-left: auto; 
          margin-right: 0;
      }
  }
}
</style> 