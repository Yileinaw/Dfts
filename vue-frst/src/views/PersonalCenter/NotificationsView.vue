<template>
  <div class="notifications-view">
    <div class="header">
      <h2>
        <el-icon><Bell /></el-icon> 消息通知
      </h2>
      <div class="actions">
        <el-button type="primary" link @click="markAllRead" :disabled="unreadCount === 0 || isLoading">全部标记为已读</el-button>
        <el-popconfirm
          title="确定要清空所有通知吗？"
          confirm-button-text="确定"
          cancel-button-text="取消"
          @confirm="clearAll"
        >
          <template #reference>
            <el-button type="danger" link :disabled="notifications.length === 0 || isLoading">清空通知</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <div v-else>
      <div v-if="notifications.length > 0" class="notification-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id" 
          class="notification-item" 
          :class="{ unread: !notification.read }"
          @click="goToPost(notification.postId)"
        >
          <!-- Unread indicator -->
          <span class="unread-indicator" v-if="!notification.read"></span>
          <!-- Pass string type to getNotificationIcon -->
          <el-icon class="type-icon" :size="20">
              <component :is="getNotificationIcon(notification.type)" />
          </el-icon>
          <!-- Always use defaultAvatar for actor -->
          <el-avatar :size="36" :src="resolveStaticAssetUrl(notification.actor?.avatarUrl)" class="actor-avatar" />
          <!-- Main Content -->
          <div class="content">
             <span class="actor-name">{{ notification.actor?.name || '用户' }}</span>
             <!-- Pass string type to getActionText -->
             <span class="action-text">{{ getActionText(notification.type) }}</span>
             <span class="post-title">《{{ notification.post?.title || '帖子' }}》</span>
             <span v-if="notification.type === 'COMMENT' && notification.comment" class="comment-preview">: "{{ truncate(notification.comment.text, 30) }}"</span>
          </div>
          <!-- Meta and Actions -->
          <div class="meta">
            <span class="time">{{ formatTime(notification.createdAt) }}</span>
            <el-button v-if="!notification.read" type="success" link size="small" @click.stop="markOneRead(notification.id)">标记已读</el-button>
            <el-tooltip content="删除通知" placement="top">
                <el-button type="danger" link size="small" :icon="Delete" @click.stop="openDeleteConfirm(notification.id)"></el-button>
            </el-tooltip>
          </div>
        </div>
      </div>
      <el-empty description="暂无通知" v-else />

      <!-- Pagination -->
      <section class="pagination-section" v-if="!isLoading && !error && pagination.total > pagination.pageSize">
         <el-pagination
              background
              layout="prev, pager, next"
              :total="pagination.total"
              :page-size="pagination.pageSize"
              v-model:current-page="pagination.currentPage"
              @current-change="handlePageChange"
          />
      </section>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Bell, Delete, Pointer, ChatDotRound, Star } from '@element-plus/icons-vue';
import { ElEmpty, ElSkeleton, ElAlert, ElPagination, ElButton, ElPopconfirm, ElMessage, ElAvatar, ElIcon, ElTooltip, ElMessageBox } from 'element-plus';
import { NotificationService, type NotificationWithRelations, NotificationType } from '@/services/NotificationService';
import { resolveStaticAssetUrl } from '@/utils/urlUtils';

const notifications = ref<NotificationWithRelations[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const pagination = reactive({
  currentPage: 1,
  pageSize: 15,
  total: 0
});
const router = useRouter();

const unreadCount = computed(() => notifications.value.filter((n: NotificationWithRelations) => !n.read).length);

const fetchNotifications = async (page: number = 1) => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await NotificationService.getNotifications({ page, limit: pagination.pageSize });
        notifications.value = response.notifications.map((n: NotificationWithRelations) => ({
            ...n,
            actor: n.actor || { id: -1, name: '未知用户', avatarUrl: '' },
            post: n.post || { id: -1, title: '未知帖子' }
        }));
        pagination.total = response.totalCount || 0;
        pagination.currentPage = page;
    } catch (err: any) {
        console.error('Error fetching notifications:', err);
        error.value = err.response?.data?.message || '加载通知列表失败';
        notifications.value = [];
        pagination.total = 0;
    } finally {
        isLoading.value = false;
    }
};

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'LIKE': return Pointer;
        case 'COMMENT': return ChatDotRound;
        case 'FAVORITE': return Star;
        default: return Bell;
    }
};

const getActionText = (type: string): string => {
    switch (type) {
        case 'LIKE': return '点赞了你的帖子';
        case 'COMMENT': return '评论了你的帖子';
        case 'FAVORITE': return '收藏了你的帖子';
        default: return '与你的帖子进行了互动';
    }
};

const formatTime = (isoString: string): string => {
  if (!isoString) return '未知时间';
  const date = new Date(isoString);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString();
  }
};

const truncate = (text: string = '', length: number): string => {
    return text.length > length ? text.substring(0, length) + '...' : text;
};

const handlePageChange = (newPage: number) => {
    fetchNotifications(newPage);
};

const markOneRead = async (id: number) => {
    try {
        await NotificationService.markAsRead(id);
        const index = notifications.value.findIndex((n: NotificationWithRelations) => n.id === id);
        if (index !== -1) {
            notifications.value[index].read = true;
        }
    } catch (err: any) {
        console.error('Error marking notification as read:', err);
        ElMessage.error(err.response?.data?.message || '操作失败');
    }
};

const markAllRead = async () => {
    try {
        const result = await NotificationService.markAllAsRead();
        notifications.value.forEach((n: NotificationWithRelations) => n.read = true);
        ElMessage.success(`已将 ${result.count} 条未读通知标记为已读`);
    } catch (err: any) {
        console.error('Error marking all notifications as read:', err);
        ElMessage.error(err.response?.data?.message || '操作失败');
    }
};

const openDeleteConfirm = (id: number) => {
    ElMessageBox.confirm(
        '确定要删除这条通知吗?',
        '确认删除',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
    .then(() => {
        deleteOne(id);
    })
    .catch(() => {
        // User cancelled
    });
};

const deleteOne = async (id: number) => {
    try {
        await NotificationService.deleteNotification(id);
        fetchNotifications(pagination.currentPage);
        ElMessage.success('通知已删除');
    } catch (err: any) {
        console.error('Error deleting notification:', err);
        ElMessage.error(err.response?.data?.message || '删除失败');
    }
};

const clearAll = async () => {
    try {
        const result = await NotificationService.clearAllNotifications();
        notifications.value = [];
        pagination.total = 0;
        pagination.currentPage = 1;
        ElMessage.success(`已清空 ${result.count} 条通知`);
    } catch (err: any) {
        console.error('Error clearing notifications:', err);
        ElMessage.error(err.response?.data?.message || '清空失败');
    }
};

const goToPost = (postId: number | null | undefined) => {
    if (postId === undefined || postId === null || postId === -1) {
        ElMessage.warning('关联的帖子不存在或已被删除');
        return;
    }
    router.push(`/posts/${postId}`);
};

onMounted(() => {
    fetchNotifications(pagination.currentPage);
});

</script>

<style scoped lang="scss">
.notifications-view {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color-lighter); 
    margin-bottom: 15px; 

    h2 {
        display: flex;
        align-items: center;
        font-size: 1.3rem;
        color: #303133;
        margin: 0; 
        .el-icon {
          margin-right: 8px;
          color: var(--el-color-primary);
        }
    }
    .actions .el-button {
        margin-left: 10px;
    }
}

.notification-list {
    // Container for all items
}

.notification-item {
    display: flex;
    align-items: center;
    padding: 18px 10px;
    border-top: 1px solid var(--el-border-color-lighter);
    transition: background-color 0.2s ease;
    position: relative;

    &:first-child {
        border-top: none;
    }

    &.unread {
        .content .actor-name,
        .content .action-text,
        .content .post-title {
             font-weight: 500;
        }
    }

    &:hover {
         background-color: var(--el-fill-color-light);
    }

    .unread-indicator {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 18px;
        background-color: var(--el-color-primary);
        border-radius: 0 2px 2px 0;
    }

    .type-icon {
        margin-right: 12px;
        color: #909399;
        flex-shrink: 0;
    }

    .actor-avatar {
        margin-right: 12px;
        flex-shrink: 0;
    }

    .content {
        flex-grow: 1;
        display: flex;
        align-items: center;
        flex-wrap: wrap; 
        gap: 5px 8px;
        margin-right: 15px;

        .actor-name {
            font-weight: 500;
            color: #303133;
        }
        .action-text {
            color: #606266;
        }
        .post-title {
            color: var(--el-color-primary);
            cursor: pointer;
            &:hover {
                text-decoration: underline;
            }
        }
        .comment-preview {
            color: #909399;
            font-style: italic;
            margin-left: 2px;
        }
    }

    .meta {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 15px;

        .time {
            font-size: 0.85rem;
            color: #909399;
            min-width: 70px;
            text-align: right;
        }
        .el-button {
            padding: 0;
            font-size: 1rem;
        }
    }
}

.loading-state, .el-alert, .el-empty {
  margin-top: 20px;
}

.pagination-section {
    margin-top: 30px;
    display: flex;
    justify-content: center;
}
</style> 