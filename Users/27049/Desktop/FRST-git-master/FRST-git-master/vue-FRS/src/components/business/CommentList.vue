<template>
  <div class="comment-list">
    <!-- 发表评论输入框 -->
    <div class="add-comment">
      <el-input v-model="newCommentContent" placeholder="留下你的精彩评论吧..." :rows="2" type="textarea" resize="none"
        maxlength="200" show-word-limit />
      <el-button type="primary" @click="submitComment" :disabled="!newCommentContent"
        :loading="isSubmitting">发表评论</el-button>
    </div>

    <!-- 评论列表 -->
    <div v-if="comments && comments.length">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <el-avatar :size="32" :src="comment.author.avatar || defaultAvatar" class="comment-avatar" />
        <div class="comment-body">
          <div class="comment-header">
            <span class="username">{{ comment.author.username }}</span>
            <span class="time">{{ formatRelativeTime(comment.createdAt) }}</span>
          </div>
          <div class="comment-content">
            <span v-if="comment.replyTo">回复 <span class="reply-user">@{{ comment.replyTo.username }}</span>: </span>
            {{ comment.content }}
          </div>
          <div class="comment-actions">
            <el-button text size="small" @click="replyToComment(comment.author)">回复</el-button>
            <!-- 可以添加点赞评论等操作 -->
          </div>
        </div>
      </div>

      <!-- 加载更多评论 -->
      <div class="load-more" v-if="hasMore">
        <el-button text @click="$emit('load-more')" :loading="loading">加载更多评论</el-button>
      </div>
    </div>
    <el-empty description="还没有评论，快来抢沙发吧！" v-else-if="!loading"></el-empty>

  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import type { CommentInfo, PostAuthorInfo } from '@/types/api';
import { ElInput, ElButton, ElAvatar, ElEmpty, ElMessage } from 'element-plus';
import defaultAvatar from '@/assets/images/default-avatar.png';
import { formatRelativeTime } from '@/utils/timeFormatter.ts';

const props = defineProps<{
  postId: number | string;
  comments: CommentInfo[];
  hasMore: boolean;
  loading: boolean;
}>();

const emit = defineEmits(['load-more', 'add-comment']);

const newCommentContent = ref('');
const isSubmitting = ref(false);
const replyToUser = ref<PostAuthorInfo | null>(null); // 当前回复的目标用户

const submitComment = async () => {
  if (!newCommentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空');
    return;
  }
  isSubmitting.value = true;
  try {
    // 调用父组件传递的 add-comment 事件，并传递回复用户 ID
    const success = await emit('add-comment', newCommentContent.value, replyToUser.value?.id);
    if (success) {
      newCommentContent.value = ''; // 清空输入框
      replyToUser.value = null; // 清除回复目标
      ElMessage.success('评论发表成功!');
    } else {
      // ElMessage.error('评论失败，请稍后再试');
    }
  } catch (error) {
    console.error('Submit comment error:', error);
    // ElMessage.error('评论失败，请稍后再试');
  } finally {
    isSubmitting.value = false;
  }
};

// 设置回复目标
const replyToComment = (author: PostAuthorInfo) => {
  replyToUser.value = author;
  // 可以在输入框 placeholder 中提示正在回复谁
  // 或将光标聚焦到输入框
  // inputRef.value?.focus();
};

</script>

<style scoped lang="scss">
.comment-list {
  padding: 15px 0;
}

.add-comment {
  display: flex;
  align-items: flex-start; // 让按钮和文本域顶部对齐
  margin-bottom: 25px;

  .el-textarea {
    margin-right: 10px;
  }

  .el-button {
    flex-shrink: 0; // 防止按钮被压缩
  }
}

.comment-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }

  .comment-avatar {
    margin-right: 12px;
    flex-shrink: 0;
  }

  .comment-body {
    flex-grow: 1;

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;

      .username {
        font-weight: bold;
        font-size: 14px;
        color: #555;
      }

      .time {
        font-size: 12px;
        color: #999;
      }
    }

    .comment-content {
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      white-space: pre-wrap;

      .reply-user {
        color: var(--el-color-primary);
        cursor: pointer;
      }
    }

    .comment-actions {
      margin-top: 8px;
      text-align: right;

      .el-button {
        padding: 0 5px; // 减小按钮间距
      }
    }
  }
}

.load-more {
  text-align: center;
  margin-top: 15px;
}
</style>