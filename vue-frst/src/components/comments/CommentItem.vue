<template>
  <div class="comment-item">
    <el-avatar 
      :size="32" 
      :src="resolveStaticAssetUrl(comment.author?.avatarUrl)" 
      class="comment-avatar"
    ></el-avatar>
    <div class="comment-main">
      <div class="comment-content">
        <span class="comment-author-name">{{ comment.author?.name || '匿名用户' }}</span>
        <span v-if="replyToAuthorName" class="reply-indicator"> 回复 @{{ replyToAuthorName }}</span>
        <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
        <p class="comment-text">{{ comment.text }}</p>
      </div>
      <div class="comment-actions">
        <el-button type="info" link :icon="ChatLineSquare" @click="onToggleReply">
          {{ isReplying ? '取消回复' : '回复' }}
        </el-button>
        <el-button 
          v-if="userStore.currentUser?.id === comment.authorId"
          type="danger" link :icon="Delete" 
          @click="onDeleteComment">
          删除
        </el-button>
      </div>

      <div v-if="isReplying" class="comment-input-area reply-input">
        <el-avatar :size="32" :src="userStore.resolvedAvatarUrl" class="comment-avatar"></el-avatar>
        <div class="input-wrapper">
          <el-input 
            ref="replyInputRef"
            type="textarea" :rows="2" 
            :placeholder="'回复 @' + (comment.author?.name || '匿名用户') + '...'" 
            v-model="replyText"
          ></el-input>
          <el-button 
            type="primary" 
            @click="onSubmitReply" 
            :disabled="!replyText.trim()" 
            :loading="isSubmitting"
          >
            发表回复
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, inject } from 'vue';
import { ElAvatar, ElButton, ElInput, ElMessage } from 'element-plus';
import { ChatLineSquare, Delete } from '@element-plus/icons-vue';
import type { Comment as CommentType } from '@/types/models';
import { useUserStore } from '@/stores/modules/user';
import { resolveStaticAssetUrl } from '@/utils/urlUtils'; 
import type { Ref } from 'vue';

// Define the props needed for a single comment item
interface Props {
  comment: CommentType; // Expecting a standard Comment object now
  replyToAuthorName?: string | null; // New prop
}
const props = withDefaults(defineProps<Props>(), {
    replyToAuthorName: null // Default to null
});

// Define emits
const emit = defineEmits<{
  (e: 'toggle-reply', id: number): void;
  (e: 'submit-comment', payload: { parentId: number; text: string }): void;
  (e: 'delete-comment', id: number): void;
}>();

const userStore = useUserStore();
const replyText = ref('');
const isSubmitting = ref(false);
const replyInputRef = ref<InstanceType<typeof ElInput> | null>(null);

// 使用 inject 注入状态
const replyingToId = inject<Ref<number | null>>('replyingToCommentId');

// 更新计算属性以使用注入的值
const isReplying = computed(() => replyingToId?.value === props.comment.id);

watch(isReplying, async (newVal) => {
  if (newVal) {
    await nextTick(); 
    replyInputRef.value?.focus();
  }
});

const formatTime = (isoString: string | undefined): string => {
  if (!isoString) return '未知时间';
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const onToggleReply = () => {
  emit('toggle-reply', props.comment.id);
  if (!isReplying.value) {
     replyText.value = ''; 
  }
};

const onSubmitReply = async () => {
  if (!replyText.value.trim()) {
    ElMessage.warning('回复内容不能为空');
    return;
  }
  isSubmitting.value = true;
  try {
    emit('submit-comment', { parentId: props.comment.id, text: replyText.value.trim() });
    replyText.value = ''; 
  } catch (error) {
      console.error("Error submitting reply (from CommentItem):", error);
      ElMessage.error('回复发表失败');
  } finally {
    isSubmitting.value = false; 
  }
};

const onDeleteComment = () => {
  emit('delete-comment', props.comment.id);
};

</script>

<style scoped lang="scss">
.comment-item {
  display: flex;
  padding: 15px 0;
  padding-left: 10px; 
  border-top: 1px solid var(--el-border-color-lighter);
  position: relative; 

  &:first-child {
      border-top: none;
  }

  .comment-avatar {
    margin-right: 15px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .comment-main {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  .comment-content {
    margin-bottom: 8px; 
    .comment-author-name {
      font-weight: 600;
      font-size: 0.95rem;
      color: #444;
      margin-right: 8px;
    }
    .comment-time {
      font-size: 0.8rem;
      color: #aaa;
    }
    .comment-text {
      margin-top: 6px;
      line-height: 1.7;
      font-size: 0.95rem;
      color: #555;
      word-wrap: break-word;
      white-space: pre-wrap; 
    }
    .reply-indicator {
        font-size: 0.9rem;
        color: #666;
        margin: 0 4px;
    }
  }

  .comment-actions {
    margin-bottom: 10px; 
    .el-button {
      font-size: 0.85rem; 
      padding: 0 4px; 
    }
  }

  .comment-input-area.reply-input {
    display: flex; 
    margin-top: 10px; 
    margin-bottom: 15px; 
    padding: 10px;
    background-color: #f9f9f9; 
    border-radius: 4px;

    .comment-avatar {
        margin-right: 10px; 
    }
    .input-wrapper {
        flex-grow: 1;
        .el-textarea {
            margin-bottom: 8px;
        }
         .el-button {
            float: right; 
            font-size: 0.9rem; 
         }
    }
  }
}
</style> 