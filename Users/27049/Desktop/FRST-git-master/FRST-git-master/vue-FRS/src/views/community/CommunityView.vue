<template>
  <div class="community-view">
    <div class="header-section">
      <h2>交流分享</h2>
      <el-button type="primary" :icon="EditPen">发布新帖</el-button>
    </div>

    <el-tabs v-model="activeSortTab" @tab-change="handleSortChange">
      <el-tab-pane label="最新回复" name="lastReply"></el-tab-pane>
      <el-tab-pane label="最新发布" name="createdAt"></el-tab-pane>
      <el-tab-pane label="热门帖子" name="hot"></el-tab-pane>
    </el-tabs>

    <div class="post-list-container" v-loading="loading">
      <el-empty description="还没有人发帖，快来抢沙发吧！" v-if="!paginatedPosts.length && !loading"></el-empty>
      <ul class="post-list" v-else>
        <li v-for="post in paginatedPosts" :key="post.id" class="post-item" @click="goToPostDetail(post.id)">
          <div class="post-avatar">
            <!-- 暂时使用默认头像或首字母 -->
            <el-avatar :size="40"> {{ post.authorName.charAt(0) }} </el-avatar>
          </div>
          <div class="post-content">
            <h3 class="post-title">{{ post.title }}</h3>
            <div class="post-meta">
              <span class="author">{{ post.authorName }}</span>
              <span class="time">{{ formatRelativeTime(post.lastReplyAt || post.createdAt) }}</span>
            </div>
          </div>
          <div class="post-stats">
            <span class="replies">
              <el-icon>
                <ChatDotRound />
              </el-icon>
              {{ post.replyCount }}
            </span>
            <span class="likes">
              <el-icon>
                <Pointer />
              </el-icon>
              {{ post.likeCount }}
            </span>
          </div>
        </li>
      </ul>

      <el-pagination v-if="filteredAndSortedPosts.length > pageSize" :current-page="currentPage" :page-size="pageSize"
        :total="filteredAndSortedPosts.length" @current-change="handlePageChange" layout="prev, pager, next" background
        class="community-pagination" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { EditPen, ChatDotRound, Pointer } from '@element-plus/icons-vue';
import type { PostInfo } from '@/types/post'; // 引入帖子类型
import { formatRelativeTime } from '@/utils/timeFormatter.ts'; // 假设的时间格式化工具

const router = useRouter();

const loading = ref(false);
const allPosts = ref<PostInfo[]>([]); // 所有帖子
const activeSortTab = ref('lastReply'); // 当前排序方式

// Pagination state
const currentPage = ref(1);
const pageSize = ref(15); // 每页显示帖子数量

// 模拟获取帖子数据
const fetchPosts = async () => {
  loading.value = true;
  allPosts.value = [];
  // 模拟 API 请求延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  // 创建模拟数据
  const mockPosts: PostInfo[] = [];
  const authors = ['美食家小李', '爱探索的张三', '厨房新手王五', '甜品控赵六', '深夜食堂常客'];
  for (let i = 1; i <= 50; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 7); // 7天内随机创建时间
    const lastReplyAt = Math.random() > 0.3 ? new Date(createdAt.getTime() + Math.random() * 1000 * 3600 * 24) : createdAt; // 随机回复时间
    mockPosts.push({
      id: 200 + i, // 避免与美食 ID 冲突
      title: `关于 ${['家常菜', '餐厅推荐', '烘焙心得', '饮品测评', '厨房技巧'][i % 5]} 的讨论帖 ${i}`,
      authorId: i % 5 + 1,
      authorName: authors[i % 5],
      createdAt: createdAt,
      lastReplyAt: lastReplyAt,
      replyCount: Math.floor(Math.random() * 100),
      likeCount: Math.floor(Math.random() * 200),
    });
  }
  allPosts.value = mockPosts;
  loading.value = false;
};

// 计算属性：根据当前排序方式对帖子进行排序
const filteredAndSortedPosts = computed(() => {
  const postsToSort = [...allPosts.value];
  switch (activeSortTab.value) {
    case 'createdAt':
      postsToSort.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'hot':
      // 简单热门排序：点赞 + 回复 * 2
      postsToSort.sort((a, b) => (b.likeCount + b.replyCount * 2) - (a.likeCount + a.replyCount * 2));
      break;
    case 'lastReply':
    default:
      postsToSort.sort((a, b) => new Date(b.lastReplyAt || b.createdAt).getTime() - new Date(a.lastReplyAt || a.createdAt).getTime());
      break;
  }
  return postsToSort;
});

// 计算属性：获取当前页需要显示的帖子
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredAndSortedPosts.value.slice(start, end);
});

// 处理排序标签切换
const handleSortChange = (tabName: string | number) => {
  activeSortTab.value = tabName as string;
  currentPage.value = 1; // 切换排序时回到第一页
};

// 处理分页改变
const handlePageChange = (page: number) => {
  currentPage.value = page;
  // 可以添加滚动到顶部的逻辑
  document.querySelector('.post-list-container')?.scrollIntoView({ behavior: 'smooth' });
};

// 跳转到帖子详情
const goToPostDetail = (postId: number) => {
  router.push(`/post/${postId}`);
};

// 组件挂载时加载数据
onMounted(() => {
  fetchPosts();
});

</script>

<style scoped lang="scss">
.community-view {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
  }
}

.el-tabs {
  margin-bottom: 20px;

  :deep(.el-tabs__header) {
    margin-bottom: 10px;
  }
}

.post-list-container {
  min-height: 400px; // 避免加载时塌陷
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &:last-child {
    border-bottom: none;
  }

  .post-avatar {
    margin-right: 15px;
    flex-shrink: 0; // 防止头像被压缩
  }

  .post-content {
    flex-grow: 1;
    overflow: hidden; // 防止标题过长溢出
  }

  .post-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .post-meta {
    font-size: 13px;
    color: var(--el-text-color-secondary);

    .author {
      margin-right: 10px;
    }
  }

  .post-stats {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-left: 20px;
    flex-shrink: 0; // 防止统计数据被压缩

    span {
      display: inline-flex;
      align-items: center;
      margin-left: 15px;

      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

.community-pagination {
  margin-top: 30px;
  justify-content: center;
}
</style>