<template>
  <div class="my-favorites-view">
    <h2 class="view-title">
      <el-icon><StarFilled /></el-icon> 我的收藏
    </h2>

    <div v-if="isLoading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" class="error-alert" />

    <div v-else-if="favoritePosts.length > 0" class="posts-list">
      <el-row :gutter="20">
        <el-col :span="24" v-for="post in favoritePosts" :key="post.id">
          <ShareCard
              :post="post" 
              @update:post="handlePostUpdate"
           />
        </el-col>
      </el-row>

      <section class="pagination-section" v-if="pagination.total > pagination.pageSize">
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

    <el-empty description="你还没有收藏任何帖子" v-else class="empty-state" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { StarFilled } from '@element-plus/icons-vue';
import {
    ElSkeleton,
    ElAlert,
    ElRow,
    ElCol,
    ElEmpty,
    ElPagination,
    ElMessage,
    ElIcon
} from 'element-plus';
import ShareCard from '@/components/common/ShareCard.vue';
import { FavoriteService } from '@/services/FavoriteService';
import type { Post } from '@/types/models'; // Keep this import

// Use the base Post type from models.ts
const favoritePosts = ref<Post[]>([]); 
const isLoading = ref(true);
const error = ref<string | null>(null);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10, // Or your preferred page size
  total: 0
});

const fetchMyFavorites = async (page: number = pagination.currentPage) => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await FavoriteService.getMyFavorites({ page, limit: pagination.pageSize });
    
    if (response && Array.isArray(response.posts)) {
        favoritePosts.value = response.posts;
        pagination.total = response.totalCount || 0;
        pagination.currentPage = page;
    } else {
        throw new Error('加载收藏列表时返回数据格式不正确');
    }

  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.message || '加载收藏列表失败';
    error.value = errorMsg;
    ElMessage.error(errorMsg);
    favoritePosts.value = [];
    pagination.total = 0;
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (newPage: number) => {
  fetchMyFavorites(newPage);
};

// Handle the event emitted by ShareCard when a post's favorite status changes
const handlePostUpdate = (updatedPost: Post) => {
  const index = favoritePosts.value.findIndex(p => p.id === updatedPost.id);
  if (index !== -1) {
      if (!updatedPost.isFavorited) {
          favoritePosts.value.splice(index, 1);
          pagination.total = Math.max(0, pagination.total - 1);
      } else {
          favoritePosts.value[index] = { ...favoritePosts.value[index], ...updatedPost };
      }
  }
};

onMounted(() => {
  fetchMyFavorites();
});

</script>

<script lang="ts">
export default {
  name: 'MyFavoritesView'
}
</script>

<style scoped lang="scss">
.my-favorites-view {
  padding: 25px;
  background-color: #fff; // Optional: Add a background
  border-radius: 4px; // Optional: Add rounding
  min-height: 400px; // Ensure container has some height
}

.view-title {
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  color: #303133;
  margin-bottom: 25px;
  .el-icon {
    margin-right: 10px;
    color: var(--el-color-warning); // Use warning color for star
  }
}

.loading-state,
.error-alert,
.empty-state {
  margin-top: 30px;
}

.posts-list {
    .el-col {
        margin-bottom: 20px; // Add space between cards
    }
}

.pagination-section {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style> 