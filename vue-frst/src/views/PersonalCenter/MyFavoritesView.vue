<template>
  <div class="my-favorites-view">
    <h2><el-icon><StarFilled /></el-icon> 我的收藏</h2>

    <div v-if="isLoading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <div v-else>
      <el-row :gutter="20" v-if="favoritePosts.length > 0">
        <el-col :span="24" v-for="post in favoritePosts" :key="post.id">
          <ShareCard 
              :post="post" 
              @update:post="handlePostUpdate"
          />
        </el-col>
      </el-row>
      <el-empty description="你还没有收藏任何帖子" v-else />

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
import { ref, onMounted, reactive } from 'vue';
import { StarFilled } from '@element-plus/icons-vue';
import { ElSkeleton, ElAlert, ElRow, ElCol, ElEmpty, ElPagination, ElMessage } from 'element-plus'; // Import ElMessage
import ShareCard from '@/components/common/ShareCard.vue';
import { FavoriteService } from '@/services/FavoriteService';
import type { Post } from '@/types/models';

const favoritePosts = ref<Post[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10, // Adjust as needed
  total: 0
});

const fetchMyFavorites = async (page: number = 1) => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await FavoriteService.getMyFavorites({ page, limit: pagination.pageSize });
        favoritePosts.value = response.posts;
        pagination.total = response.totalCount || 0;
        pagination.currentPage = page;
    } catch (err: any) {
        console.error('Detailed error fetching favorites:', err); 
        console.error('Error response data:', err.response?.data); 
        const errorMsg = err.response?.data?.message || '加载收藏列表失败';
        error.value = errorMsg;
        favoritePosts.value = [];
        pagination.total = 0;
        if (errorMsg) {
           ElMessage.error(errorMsg); 
        }
    } finally {
        isLoading.value = false;
    }
};

const handlePageChange = (newPage: number) => {
    fetchMyFavorites(newPage);
};

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
    fetchMyFavorites(pagination.currentPage);
});

</script>

<script lang="ts">
export default {
  name: 'MyFavoritesView'
}
</script>

<style scoped lang="scss">
/* ... styles from previous creation ... */
.my-favorites-view {
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

.loading-state, .el-alert, .el-empty {
    margin-top: 20px;
}

.pagination-section {
    margin-top: 30px;
    display: flex;
    justify-content: center;
}
</style> 