<template>
  <div class="post-item" v-if="post">
    <el-card shadow="never">
      <!-- 作者信息 -->
      <div class="author-info">
        <el-avatar :size="40" :src="post.author.avatar || defaultAvatar" />
        <div class="author-details">
          <span class="username">{{ post.author.username }}</span>
          <span class="time">{{ formatTimeAgo(post.createdAt) }}</span>
        </div>
        <!-- 可以添加关注按钮或更多操作 -->
        <el-button text :icon="MoreFilled" class="more-options" />
      </div>

      <!-- 帖子内容 -->
      <div class="post-content" @click="goToPostDetail">
        <p class="text-content">{{ post.content }}</p>
        <!-- 图片展示 -->
        <div v-if="post.images?.length" class="image-grid">
          <el-image
            v-for="(img, index) in post.images"
            :key="index"
            :src="img"
            fit="cover"
            :preview-src-list="post.images"
            :initial-index="index"
            lazy
          />
        </div>
      </div>

      <!-- 帖子操作栏 -->
      <div class="post-actions">
        <el-button text :icon="Share">分享</el-button>
        <el-button text :icon="ChatDotRound">{{ post.commentsCount || '评论' }}</el-button>
        <el-button
          text
          :icon="post.isLiked ? StarFilled : Star"
          :type="post.isLiked ? 'warning' : ''"
          @click.stop="handleLike"
        >
          {{ post.likes || '点赞' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import type { PostInfo } from '@/types/api';
import { ElCard, ElAvatar, ElButton, ElIcon, ElImage, ElMessage } from 'element-plus';
import {
  MoreFilled,
  Share,
  ChatDotRound,
  Star,
  StarFilled
} from '@element-plus/icons-vue';
import defaultAvatar from '@/assets/images/default-avatar.png';
import { formatTimeAgo } from '@/utils/formatters'; // 引入时间格式化工具

const props = defineProps<{
  post: PostInfo;
}>();

const emit = defineEmits(['toggle-like']); // 定义点赞事件

const router = useRouter();

const goToPostDetail = () => {
  // 跳转到帖子详情页
  router.push(`/post/${props.post.id}`); // 假设帖子详情路由为 /post/:id
};

const handleLike = () => {
  // 触发点赞/取消点赞事件，由父组件处理 API 调用和状态更新
  emit('toggle-like', props.post.id, props.post.isLiked);
};

</script>

<style scoped lang="scss">
.post-item {
  margin-bottom: 15px;
  .el-card {
    border: none; // 可以去掉卡片边框，使其更像信息流项
    border-radius: 0;
    border-bottom: 1px solid var(--el-border-color-lighter); // 用底部分隔线
  }
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  .author-details {
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    .username {
      font-weight: bold;
      font-size: 15px;
      color: #333;
    }
    .time {
      font-size: 12px;
      color: #999;
    }
  }
  .more-options {
    margin-left: auto;
    padding: 5px;
  }
}

.post-content {
  cursor: pointer;
  margin-bottom: 10px;
  .text-content {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    margin-bottom: 10px;
    white-space: pre-wrap; // 保持换行
  }
  .image-grid {
    display: grid;
    // 根据图片数量调整列数，这里简单设为最多3列
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 5px;
    .el-image {
      width: 100%;
      aspect-ratio: 1 / 1; // 正方形图片
      border-radius: 4px;
    }
  }
}

.post-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 8px;
  .el-button {
    color: #666;
    font-size: 13px;
    .el-icon {
      margin-right: 3px;
    }
    &.is-warning { // 点赞后的样式
      color: var(--el-color-warning);
    }
  }
}
</style> 