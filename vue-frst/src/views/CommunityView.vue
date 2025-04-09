<template>
  <div class="community-view container">
    <!-- Action Bar -->
    <section class="action-bar">
      <!-- Placeholder for sorting/filtering tabs -->
       <el-tabs v-model="activeTab" class="tabs">
        <el-tab-pane label="最新发布" name="latest"></el-tab-pane>
        <el-tab-pane label="热门讨论" name="popular"></el-tab-pane>
        <!-- Add more tabs if needed -->
      </el-tabs>

      <el-button type="primary" :icon="EditPen" @click="openPostEditor">发布分享</el-button>
    </section>

    <!-- Posts List Section -->
    <section class="posts-list-section">
       <!-- 添加加载状态 -->
       <div v-if="isLoading" class="loading-state">
         <el-skeleton :rows="10" animated />
       </div>
       <!-- 添加错误状态 -->
       <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
       <!-- 成功加载数据 -->
       <div v-else>
         <el-row :gutter="20">
             <!-- *** 修改：使用 posts 替代 communityPosts *** -->
             <el-col :span="24" v-for="post in posts" :key="post.id">
                <ShareCard :post="post" @like="handleLike" @comment="openPostDetailModal" @favorite="handleFavorite" @update:post="handlePostUpdate" />
              </el-col>
         </el-row>
         <!-- *** 修改：更新空状态的 v-if 条件 *** -->
         <el-empty v-if="!isLoading && !error && posts.length === 0" description="社区还没有分享，快来发布第一条吧！"></el-empty>
       </div>
    </section>

    <!-- Pagination -->
    <!-- *** 修改：更新分页器的 v-if 条件 和属性绑定 *** -->
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

     <!-- *** 引入 PostEditor 组件 *** -->
     <PostEditor v-model:visible="isEditorVisible" @post-created="handlePostCreated" />

     <!-- Add Post Detail Modal -->
     <PostDetailModal 
         :post-id="selectedPostId" 
         v-model:visible="isModalVisible"
         @postUpdated="handlePostUpdate" 
     />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { EditPen } from '@element-plus/icons-vue'
// 引入通用组件
import ShareCard from '@/components/common/ShareCard.vue' 
// --- 新增导入 ---
import { PostService } from '@/services/PostService';
import type { Post } from '@/types/models';
import { ElMessage } from 'element-plus'; // 导入 ElMessage
// --- 导入 PostEditor ---
import PostEditor from '@/components/features/PostEditor.vue';
// --- 新增导入 ---
import { useUserStore } from '@/stores/modules/user';
import { useRouter } from 'vue-router'; // 导入 useRouter
import PostDetailModal from '@/components/common/PostDetailModal.vue'; // Import the modal

const activeTab = ref('latest')

// --- 新增状态控制编辑器显示 ---
const isEditorVisible = ref(false);

// --- 新增状态 ---
const posts = ref<Post[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const pagination = reactive({
  currentPage: 1,
  pageSize: 10, // 或从配置/用户选择获取
  total: 0
})

// --- Add Modal State --- 
const selectedPostId = ref<number | null>(null);
const isModalVisible = ref(false);
// --- End Modal State ---

// --- 移除模拟数据 ---
/*
const communityPosts = ref([
  { id: 101, userName: '美食探险家', userAvatar: '', time: '15分钟前', content: '这家新开的日料店太惊艳了，海胆寿司入口即化，强烈推荐！', imageUrl: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', likes: 25, comments: 8 },
  { id: 102, userName: '家常菜爱好者', userAvatar: '', time: '1小时前', content: '分享一个简单的番茄炒蛋教程，新手也能轻松搞定！#家常菜', imageUrl: '', likes: 15, comments: 3 }, // No image
  { id: 103, userName: '甜品控', userAvatar: '', time: '3小时前', content: '自制芒果慕斯蛋糕，颜值和口味都在线！🥭🍰', imageUrl: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', likes: 58, comments: 12 },
  // Add more posts...
]);
*/

// --- 修改获取帖子函数以接受 sortBy ---
const fetchPosts = async (page: number = 1, sortBy: string = 'latest') => {
  isLoading.value = true;
  error.value = null;
  try {
    // --- 传递 sortBy 参数 --- 
    const response = await PostService.getAllPosts({
      page: page,
      limit: pagination.pageSize,
      sortBy: sortBy // 将 sortBy 传给 Service
    });
    posts.value = response.posts;
    pagination.total = response.totalCount || 0;
    pagination.currentPage = page;
  } catch (err: any) {
    console.error('Failed to fetch posts:', err)
    error.value = '加载帖子失败，请稍后再试。'
    ElMessage.error(error.value)
  } finally {
    isLoading.value = false;
  }
};

// --- 添加 watch 监听 activeTab 变化 ---
watch(activeTab, (newSortBy) => {
  // 当 tab 切换时，从第一页开始加载对应排序的数据
  fetchPosts(1, newSortBy);
});

// --- 修改分页事件处理 (传递当前排序方式) ---
const handlePageChange = (newPage: number) => {
    console.log('Current page:', newPage);
    fetchPosts(newPage, activeTab.value); // 传递当前的 activeTab 作为 sortBy
};

// --- 在 onMounted 中调用 (传递初始排序方式) ---
onMounted(() => {
  fetchPosts(pagination.currentPage, activeTab.value); // 传递初始的 activeTab
});

// --- 获取实例 ---
const userStore = useUserStore();
const router = useRouter();

// --- 修改 openPostEditor 方法 ---
const openPostEditor = () => {
    // --- 实现登录检查 ---
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录再发布分享');
      router.push('/login'); // 跳转到登录页
      return; // 阻止打开编辑器
    }
    // --- 结束登录检查 ---
    console.log('Opening post editor...');
    isEditorVisible.value = true; // 打开对话框
};

// --- 新增处理帖子创建成功的方法 ---
const handlePostCreated = () => {
  console.log('Post created, refreshing list...');
  fetchPosts(1); // 刷新列表并回到第一页
};

// --- 事件处理 (占位) ---
const handleLike = (id: number | string) => {
  console.log('Liked post:', id)
}

// --- Modify handleComment to open modal --- 
const openPostDetailModal = (postId: number) => {
    console.log('Opening modal for post in CommunityView:', postId);
    if (typeof postId === 'number') {
        selectedPostId.value = postId;
        isModalVisible.value = true;
    } else {
        console.error('Invalid postId received from ShareCard:', postId);
    }
}
// --- End modify handleComment ---

const handleFavorite = (id: number | string) => {
  console.log('Favorited post:', id)
}

const handlePostUpdate = (updatedPost: Post) => {
  const index = posts.value.findIndex(p => p.id === updatedPost.id);
  if (index !== -1) {
    posts.value[index] = { ...posts.value[index], ...updatedPost }; // Merge updates
  }
};

</script>

<script lang="ts">
export default {
  name: 'CommunityView'
}
</script>

<style scoped lang="scss">
.community-view {
  padding-top: 30px;
  padding-bottom: 30px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  .tabs {
    // Customize tab appearance if needed
  }
}

.posts-list-section {
  // Style for the posts list area
}

.pagination-section {
    margin-top: 40px;
    display: flex;
    justify-content: center;
}

.loading-state { padding: 20px; }
</style> 