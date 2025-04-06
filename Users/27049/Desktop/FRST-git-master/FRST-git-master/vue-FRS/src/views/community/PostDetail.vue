<template>
  <div class="post-detail-view" v-loading="loadingPostDetail">
    <el-page-header @back="goBack" title="返回" class="page-header">
      <template #content>
        <span class="text-large font-600 mr-3"> 帖子详情 </span>
      </template>
    </el-page-header>

    <div v-if="post" class="post-container">
      <!-- 复用 PostItem 显示主体内容 -->
      <PostItem :post="post" @toggle-like="handleToggleLike" />

      <!-- 评论区 -->
      <el-divider>评论 ({{ post.commentsCount }})</el-divider>
      <CommentList
        :post-id="post.id"
        :comments="comments"
        :has-more="commentsHasMore"
        :loading="loadingComments"
        @load-more="loadMoreComments"
        @add-comment="handleAddComment"
      />
    </div>
    <el-empty v-else description="帖子不存在或加载失败"></el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCommunityStore } from '@/store/modules/community';
import PostItem from '@/components/business/PostItem.vue';
import CommentList from '@/components/business/CommentList.vue'; // 引入评论组件

const props = defineProps<{ id: string | number }>(); // 接收路由参数 id

const router = useRouter();
const communityStore = useCommunityStore();

const loadingPostDetail = computed(() => communityStore.loadingPostDetail);
const post = computed(() => communityStore.currentPost);
const comments = computed(() => communityStore.currentComments);
const commentsHasMore = computed(() => communityStore.commentsHasMore);
const loadingComments = computed(() => communityStore.loadingComments);

const goBack = () => {
  router.back();
};

onMounted(() => {
  // 加载帖子详情和第一页评论
  communityStore.fetchPostDetail(props.id);
  communityStore.fetchComments(props.id, false); // false 表示非追加
});

const handleToggleLike = (postId: number | string, currentState: boolean) => {
  communityStore.toggleLikePost(postId, currentState);
};

const loadMoreComments = () => {
  if (post.value) {
    communityStore.fetchComments(post.value.id, true); // true 表示追加
  }
};

const handleAddComment = async (content: string, replyToUserId?: number) => {
  if (post.value) {
    return await communityStore.addComment(post.value.id, content, replyToUserId);
  }
  return false;
};

</script>

<style scoped lang="scss">
.post-detail-view {
  background-color: #fff; // 可以给页面一个背景色
  min-height: calc(100vh - 60px); // 减去导航栏高度
}
.page-header {
  padding: 15px 20px;
  background-color: #fff;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.post-container {
  // padding: 0 20px; // 可以给内容区加边距
  .post-item {
    margin-bottom: 0; // 详情页里的 PostItem 不需要外边距
    :deep(.el-card) {
      border: none; // 去掉卡片边框
      box-shadow: none;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
    // 可能需要调整详情页中 PostItem 的样式
  }
}
</style> 