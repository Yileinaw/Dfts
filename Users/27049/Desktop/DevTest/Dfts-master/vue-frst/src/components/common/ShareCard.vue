<template>
  <el-card shadow="hover" class="share-card">
    <template #header>
      <div class="share-header">
        <el-avatar :size="40" :src="/* post.author?.avatarUrl || */ defaultAvatar" />
        <span class="username">{{ post.author?.name || '匿名用户' }}</span>
        <span class="time">{{ formatTime(post.createdAt) }}</span>
      </div>
    </template>
    <div class="post-content">
      <p>{{ post.content }}</p>
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
    <div class="post-actions">
      <!-- Modify Like Button -->
      <el-button 
        text 
        :icon="post.isLiked ? StarFilled : Star" 
        :type="post.isLiked ? 'primary' : ''" 
        @click="handleLike" 
        :loading="isLiking"
      >
        {{ post.likesCount || 0 }} 点赞
      </el-button>
      <el-button text :icon="ChatDotSquare" @click="handleComment">{{ post.commentsCount || 0 }} 评论</el-button>
      <el-button text :icon="Star" @click="handleFavorite">收藏</el-button>
      <el-button text :icon="MoreFilled" class="more-options"></el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'; // Import ref for loading state
import { ElCard, ElAvatar, ElImage, ElButton, ElMessage } from 'element-plus' // Import ElMessage
import { Pointer, ChatDotSquare, Star, StarFilled, MoreFilled } from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/images/default-avatar.png';
import type { Post } from '@/types/models';
import { PostService } from '@/services/PostService';
import { useUserStore } from '@/stores/modules/user';
import { useRouter } from 'vue-router'; // Import router for navigation

const props = defineProps<{ post: Post }>()
const emit = defineEmits(['like', 'comment', 'favorite', 'update:post']) // Add update:post emit

const isLiking = ref(false);
const userStore = useUserStore();
const router = useRouter(); // Get router instance

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
  // Navigate to Post Detail page, hash to comments section
  router.push({
      name: 'PostDetail', // Assuming the route name is 'PostDetail'
      params: { id: props.post.id },
      hash: '#comments' // Optional hash for scrolling
  });
  // emit('comment', props.post.id) // Original emit can be kept or removed
}

const handleFavorite = () => {
  emit('favorite', props.post.id)
}

</script>

<style scoped lang="scss">
.share-card {
  margin-bottom: 20px;

  .share-header {
    display: flex;
    align-items: center;
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
  .post-content {
     padding: 15px 0; 
     p {
         margin: 0;
         line-height: 1.6;
         margin-bottom: 15px;
         white-space: pre-wrap; // Preserve whitespace and wrap text
     }
     .post-image {
         width: 100%;
         max-height: 400px; 
         border-radius: 4px;
         margin-top: 10px;
         background-color: #eee;
     }
  }
  .post-actions {
      border-top: 1px solid var(--el-border-color-lighter); 
      padding-top: 10px;
      display: flex;
      align-items: center;
      .el-button {
          margin-right: 15px;
          color: #606266;
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