<template>
  <div class="home-view container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>探索舌尖上的世界</h1>
        <p>发现、分享、品味生活中的每一道佳肴</p>
        <el-button type="primary" size="large" @click="goToDiscover" class="cta-button">
          <el-icon><Search /></el-icon>
          立即探索美食
        </el-button>
      </div>
      <!-- 可以添加背景图片样式 -->
    </section>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- 热门推荐 Section -->
      <section class="content-section">
        <h2><el-icon><Star /></el-icon> 热门推荐</h2>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in recommendedItems" :key="item.id">
            <FoodCard :item="item" @view-details="handleViewDetails" />
          </el-col>
        </el-row>
        <div class="more-link">
           <el-button type="primary" plain @click="goToDiscover">查看更多推荐</el-button>
        </div>
      </section>

      <el-divider />

      <!-- 最新分享 Section -->
      <section class="content-section">
         <h2><el-icon><ChatLineSquare /></el-icon> 最新分享</h2>
         <div v-if="isLoadingShares" class="loading-state">
            <el-skeleton :rows="5" animated />
         </div>
         <el-alert v-else-if="sharesError" :title="sharesError" type="error" show-icon :closable="false" />
         <el-row v-else :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="share in latestShares" :key="share.id">
            <ShareCard
              :post="share"
              @like="handleLike"
              @comment="openPostDetailModal"
              @favorite="handleFavorite"
              @update:post="handlePostUpdate"
            />
          </el-col>
           <el-empty v-if="!isLoadingShares && !sharesError && latestShares.length === 0" description="暂无分享内容" />
        </el-row>
        <div class="more-link" v-if="!isLoadingShares && !sharesError && latestShares.length > 0">
           <el-button type="primary" plain @click="goToCommunity">查看更多分享</el-button>
        </div>
      </section>
    </div>

    <!-- Add Post Detail Modal -->
    <PostDetailModal 
        :post-id="selectedPostId" 
        v-model:visible="isModalVisible"
        @postUpdated="handlePostUpdate" 
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Star, ChatLineSquare } from '@element-plus/icons-vue' // 引入图标
// 引入通用组件
import FoodCard from '@/components/common/FoodCard.vue'
import ShareCard from '@/components/common/ShareCard.vue'
import PostDetailModal from '@/components/common/PostDetailModal.vue'; // Import the modal component
// --- 新增导入 ---
import { PostService } from '@/services/PostService'
import type { Post } from '@/types/models' // 导入 Post 类型

const router = useRouter()

// --- 新增状态 ---
const latestShares = ref<Post[]>([]) // 存储从 API 获取的帖子
const isLoadingShares = ref(false)
const sharesError = ref<string | null>(null)

// --- Add Modal State --- 
const selectedPostId = ref<number | null>(null);
const isModalVisible = ref(false);
// --- End Modal State ---

// --- 模拟数据 --- 
const recommendedItems = ref([
  { id: 1, title: '麻婆豆腐', description: '经典川菜，麻辣鲜香。' , imageUrl: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', rating: 4.5 }, // 替换为真实图片 URL
  { id: 2, title: '意式肉酱面', description: '浓郁番茄与肉末的完美结合。' , imageUrl: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', rating: 4.0 },
  { id: 3, title: '抹茶千层蛋糕', description: '层层叠加的细腻口感。' , imageUrl: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', rating: 5.0 },
  { id: 4, title: '日式豚骨拉面', description: '浓厚醇香的骨汤体验。' , imageUrl: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', rating: 4.8 },
]);

// --- 新增获取最新分享的函数 ---
const fetchLatestShares = async () => {
  isLoadingShares.value = true
  sharesError.value = null
  try {
    // 调用 API 获取帖子，可以限制数量，例如 limit=4
    const response = await PostService.getAllPosts({ limit: 4 })
    latestShares.value = response.posts
  } catch (error: any) {
    console.error('Failed to fetch latest shares:', error)
    sharesError.value = '加载最新分享失败，请稍后再试。'
    // 可以更详细地处理错误，例如从 error.response.data.message 获取
  } finally {
    isLoadingShares.value = false
  }
}

// --- 在 onMounted 中调用 ---
onMounted(() => {
  fetchLatestShares()
  // 如果 recommendedItems 也需要从 API 加载，在这里调用相应函数
})

// --- 添加处理 ShareCard 更新的函数 ---
const handlePostUpdate = (updatedPost: Post) => {
  const index = latestShares.value.findIndex(p => p.id === updatedPost.id);
  if (index !== -1) {
    latestShares.value[index] = { ...latestShares.value[index], ...updatedPost }; // Merge updates
  }
};

// --- 事件处理 (占位) ---
const handleViewDetails = (id: number | string) => {
  console.log('View details for food item:', id)
  // router.push(`/food/${id}`)
}
const handleLike = (id: number | string) => {
  console.log('HomeView received like event for post:', id) // 可以移除，因为 ShareCard 处理了
}
const handleFavorite = (id: number | string) => {
  console.log('HomeView received favorite event for post:', id)
}

// --- Modify handleComment to open modal --- 
const openPostDetailModal = (postId: number) => {
    console.log('Opening modal for post:', postId);
    if (typeof postId === 'number') {
        selectedPostId.value = postId;
        isModalVisible.value = true;
    } else {
        console.error('Invalid postId received from ShareCard:', postId);
    }
}
// --- End modify handleComment ---

// --- 导航方法 --- 
const goToDiscover = () => {
  router.push('/discover')
}
const goToCommunity = () => {
  router.push('/community')
}

</script>

// Add a separate script block to define the component name
<script lang="ts">
export default {
  name: 'HomeView'
}
</script>

<style scoped lang="scss">
.home-view {
  width: 100%;
}

// --- Hero Section --- 
.hero-section {
  height: 450px; // 调整高度
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center center/cover no-repeat; // 示例背景图
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #fff;

  .hero-content {
    h1 {
      font-size: 3.5rem; // 调整字号
      font-weight: bold;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    p {
      font-size: 1.5rem;
      margin-bottom: 2.5rem;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    .cta-button {
      padding: 15px 30px;
      font-size: 1.1rem;
      .el-icon {
        margin-right: 8px;
      }
    }
  }
}

// --- Main Content Area --- 
.main-content {
  padding: 40px 0; /* 为内容区添加上下内边距 */
}

.content-section {
  margin-bottom: 50px;
  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    color: #303133;
    .el-icon {
      margin-right: 10px;
      color: var(--el-color-primary);
    }
  }
}

.more-link {
  text-align: center;
  margin-top: 20px;
}

// --- Responsive Adjustments (Optional) --- 
@media (max-width: 768px) {
  .hero-section {
    height: 350px;
    .hero-content {
      h1 {
        font-size: 2.5rem;
      }
      p {
        font-size: 1.2rem;
      }
    }
  }
  .content-section h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .hero-section {
    height: 300px;
    .hero-content {
      h1 {
        font-size: 2rem;
      }
      p {
        font-size: 1rem;
        margin-bottom: 1.5rem;
      }
      .cta-button {
        padding: 10px 20px;
        font-size: 1rem;
      }
    }
  }
}

.loading-state {
  padding: 20px;
}

</style>
