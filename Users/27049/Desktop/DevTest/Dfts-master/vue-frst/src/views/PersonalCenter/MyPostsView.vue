<template>
  <div class="my-posts-view">
    <h2>
      <el-icon><Document /></el-icon> 我的帖子
    </h2>

    <div v-if="isLoading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <div v-else>
      <div v-if="myPosts.length > 0" class="posts-grid">
        <!-- Use ShareCard in a grid -->
        <div v-for="post in myPosts" :key="post.id" class="post-card-item">
           <ShareCard :post="post" @update:post="handlePostUpdateLocally" />
           <!-- Add Manage Buttons specific to this view -->
           <div class="post-actions-manage">
              <el-button type="primary" link :icon="Edit" @click="openEditModal(post)">编辑</el-button>
              <el-popconfirm
                title="确定要删除这篇帖子吗？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="handleDeletePost(post.id)"
              >
                <template #reference>
                  <el-button type="danger" link :icon="Delete">删除</el-button>
                </template>
              </el-popconfirm>
           </div>
        </div>
      </div>
      <el-empty description="你还没有发布任何帖子" v-else />

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

    <!-- Add Edit Post Modal -->
     <el-dialog 
        v-model="isEditModalVisible"
        title="编辑帖子"
        width="60%"
        :close-on-click-modal="false"
     >
        <el-form v-if="editingPost" :model="editForm" label-width="80px">
            <el-form-item label="标题">
                <el-input v-model="editForm.title"></el-input>
            </el-form-item>
            <el-form-item label="内容">
                <el-input type="textarea" :rows="5" v-model="editForm.content"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
            <el-button @click="isEditModalVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSaveEdit" :loading="isSavingEdit">
                保存
            </el-button>
            </span>
        </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { Document, Edit, Delete } from '@element-plus/icons-vue';
import { ElEmpty, ElSkeleton, ElAlert, ElPagination, ElButton, ElPopconfirm, ElDialog, ElForm, ElFormItem, ElInput, ElMessage, ElIcon } from 'element-plus';
import { PostService } from '@/services/PostService';
import type { Post } from '@/types/models';
import ShareCard from '@/components/common/ShareCard.vue'; // Ensure ShareCard is imported

const myPosts = ref<Post[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10, // Adjust as needed
  total: 0
});

// --- Modal States --- 
const isEditModalVisible = ref(false);
const editingPost = ref<Post | null>(null);
const isSavingEdit = ref(false);
const editForm = reactive({ title: '', content: '' });
// --- End Modal States ---

const fetchMyPosts = async (page: number = 1) => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await PostService.getMyPosts({ page, limit: pagination.pageSize });
        myPosts.value = response.posts;
        pagination.total = response.totalCount || 0;
        pagination.currentPage = page;
    } catch (err: any) {
        console.error('Error fetching my posts:', err); 
        error.value = err.response?.data?.message || '加载我的帖子列表失败';
        myPosts.value = [];
        pagination.total = 0;
    } finally {
        isLoading.value = false;
    }
};

const formatTime = (isoString: string): string => {
  if (!isoString) return '未知时间';
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const handlePageChange = (newPage: number) => {
    fetchMyPosts(newPage);
};

const handleDeletePost = async (postId: number) => {
    try {
        await PostService.deletePost(postId);
        ElMessage.success('帖子删除成功');
        // Refresh the list after deletion
        // Option 1: Remove from local array (might be tricky with pagination)
        // Option 2: Fetch current page again
        fetchMyPosts(pagination.currentPage);
    } catch (err: any) {
        console.error('Error deleting post:', err);
        ElMessage.error(err.response?.data?.message || '删除帖子失败');
    }
};

// --- Edit Logic --- 
const openEditModal = (post: Post) => {
    editingPost.value = post;
    editForm.title = post.title;
    editForm.content = post.content || '';
    isEditModalVisible.value = true;
};

const handleSaveEdit = async () => {
    if (!editingPost.value) return;
    isSavingEdit.value = true;
    try {
        const updatedData = { title: editForm.title, content: editForm.content };
        await PostService.updatePost(editingPost.value.id, updatedData);
        ElMessage.success('帖子更新成功');
        isEditModalVisible.value = false;
        fetchMyPosts(pagination.currentPage);
    } catch (err: any) {
        console.error('Error updating post:', err);
        ElMessage.error(err.response?.data?.message || '更新帖子失败');
    } finally {
        isSavingEdit.value = false;
    }
};
// --- End Edit Logic ---

// This function might still be needed if ShareCard emits update even on navigation
// Or if updates happen *within* this view (unlikely now)
const handlePostUpdateLocally = (updatedPost: Post) => {
  const index = myPosts.value.findIndex(p => p.id === updatedPost.id);
  if (index !== -1) {
      myPosts.value[index] = { ...myPosts.value[index], ...updatedPost };
  }
};
// --- End Detail Logic ---

onMounted(() => {
    fetchMyPosts(pagination.currentPage);
});

</script>

<script lang="ts">
export default {
  name: 'MyPostsView'
}
</script>

<style scoped lang="scss">
.my-posts-view {
  padding: 20px;
  h2 {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .el-icon {
      margin-right: 8px;
    }
  }
}

.posts-grid {
  display: grid;
  // Adjust columns based on desired layout and screen size (e.g., using media queries)
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
  gap: 20px; // Spacing between cards
}

.post-card-item {
  // Container for the card and its management buttons
  position: relative; 
  border: 1px solid var(--el-border-color-lighter); // Optional: add border to item container
  border-radius: 8px; // Optional: round corners
  overflow: hidden; // Ensure content stays within bounds
  display: flex; // Use flexbox for internal layout
  flex-direction: column; // Stack card content and buttons vertically

  .share-card { // Target the ShareCard component if needed
      flex-grow: 1; // Allow card to take up available space
      border: none; // Remove ShareCard's own border if it has one and we added one to item
  }

  .post-actions-manage {
      padding: 5px 15px; // Adjust padding
      background-color: #f8f9fa; // Optional: background for button area
      border-top: 1px solid var(--el-border-color-lighter); // Separator line
      display: flex;
      justify-content: flex-end; // Align buttons to the right
      gap: 10px; // Space between buttons
      flex-shrink: 0; // Prevent buttons area from shrinking

      .el-button {
          // Reset link button padding if needed
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