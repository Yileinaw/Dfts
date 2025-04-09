import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
// import type { Post, Comment } from '@/types/community'; // 假设类型定义在独立文件或 api.d.ts

// 假设的 Post 和 Comment 类型 (后续会移到 types/api.d.ts)
interface Post {
    id: number | string;
    author: { id: number; username: string; avatar?: string };
    content: string;
    images?: string[];
    location?: string;
    tags?: string[];
    likes: number;
    isLiked: boolean;
    commentsCount: number;
    createdAt: string;
}

interface Comment {
    id: number | string;
    postId: number | string;
    author: { id: number; username: string; avatar?: string };
    content: string;
    replyTo?: { id: number; username: string }; // 回复给谁
    createdAt: string;
}

export const useCommunityStore = defineStore('community', () => {
    // 动态信息流
    const feedPosts = ref<Post[]>([]);
    const feedType = ref<'recommended' | 'following'>('recommended'); // 当前信息流类型
    const feedPage = ref(1);
    const feedHasMore = ref(true);
    const loadingFeed = ref(false);

    // 当前帖子详情
    const currentPost = ref<Post | null>(null);
    const loadingPostDetail = ref(false);

    // 当前帖子的评论
    const currentComments = ref<Comment[]>([]);
    const commentsPage = ref(1);
    const commentsHasMore = ref(true);
    const loadingComments = ref(false);

    // --- Actions --- //

    // 设置信息流类型
    function setFeedType(type: 'recommended' | 'following') {
        if (feedType.value === type) return;
        feedType.value = type;
        feedPosts.value = []; // 清空旧数据
        feedPage.value = 1;
        feedHasMore.value = true;
        fetchFeed(false); // 重新加载
    }

    // 获取动态信息流
    async function fetchFeed(append = false) {
        if (loadingFeed.value || (!append && !feedHasMore.value)) return;

        loadingFeed.value = true;
        const pageToFetch = append ? feedPage.value + 1 : 1;

        try {
            // const res = await getFeed({ type: feedType.value, page: pageToFetch });
            // if (res.code === 0 && res.data) {
            //   const newPosts = res.data.list;
            //   if (append) {
            //     feedPosts.value = [...feedPosts.value, ...newPosts];
            //   } else {
            //     feedPosts.value = newPosts;
            //   }
            //   feedPage.value = res.data.page;
            //   feedHasMore.value = res.data.list.length >= res.data.pageSize; // 简单判断是否有更多
            // }
            // 暂存假数据
            await new Promise(resolve => setTimeout(resolve, 700));
            const newPosts: Post[] = Array.from({ length: 5 }).map((_, i) => ({
                id: `${feedType.value}-${pageToFetch}-${i}`,
                author: { id: i + 1, username: `用户 ${feedType.value}${i + pageToFetch}`, avatar: `https://via.placeholder.com/40?text=U${i + 1}` },
                content: `这是来自 #${feedType.value} 的第 ${pageToFetch} 页，第 ${i + 1} 条动态内容示例，测试一下长文本效果会不会溢出或者换行处理是否正确。`,
                images: pageToFetch % 2 === 0 ? [] : [`https://via.placeholder.com/300x200?text=Post+${pageToFetch}-${i}`],
                likes: Math.floor(Math.random() * 100),
                isLiked: Math.random() > 0.5,
                commentsCount: Math.floor(Math.random() * 20),
                createdAt: new Date().toISOString(),
            }));

            if (append) {
                feedPosts.value = [...feedPosts.value, ...newPosts];
            } else {
                feedPosts.value = newPosts;
            }
            feedPage.value = pageToFetch;
            feedHasMore.value = pageToFetch < 3; // 假设最多3页
            console.log(`Fetched fake ${feedType.value} feed page ${pageToFetch}`, feedPosts.value);

        } catch (error) {
            console.error('Failed to fetch feed:', error);
            feedHasMore.value = false; // 出错时停止加载更多
        } finally {
            loadingFeed.value = false;
        }
    }

    // 获取帖子详情
    async function fetchPostDetail(postId: number | string) {
        loadingPostDetail.value = true;
        currentPost.value = null;
        try {
            // const res = await getPostDetail(postId);
            // if (res.code === 0 && res.data) {
            //   currentPost.value = res.data;
            // }
            await new Promise(resolve => setTimeout(resolve, 500));
            currentPost.value = {
                id: postId,
                author: { id: 1, username: '帖子作者', avatar: 'https://via.placeholder.com/40?text=A1' },
                content: `这是帖子 #${postId} 的详细内容示例。`,
                images: [`https://via.placeholder.com/600x400?text=Post+${postId}`],
                likes: 123,
                isLiked: false,
                commentsCount: 5,
                createdAt: new Date().toISOString(),
            };
            console.log(`Fetched fake post detail ${postId}`, currentPost.value);
        } catch (error) {
            console.error(`Failed to fetch post detail ${postId}:`, error);
        } finally {
            loadingPostDetail.value = false;
        }
    }

    // 获取帖子评论
    async function fetchComments(postId: number | string, append = false) {
        if (loadingComments.value || (!append && !commentsHasMore.value)) return;

        loadingComments.value = true;
        const pageToFetch = append ? commentsPage.value + 1 : 1;

        try {
            // const res = await getComments({ postId, page: pageToFetch });
            // if (res.code === 0 && res.data) {
            //   const newComments = res.data.list;
            //   if (append) {
            //     currentComments.value = [...currentComments.value, ...newComments];
            //   } else {
            //     currentComments.value = newComments;
            //   }
            //   commentsPage.value = res.data.page;
            //   commentsHasMore.value = res.data.list.length >= res.data.pageSize;
            // }
            await new Promise(resolve => setTimeout(resolve, 400));
            const newComments: Comment[] = Array.from({ length: 8 }).map((_, i) => ({
                id: `c-${pageToFetch}-${i}`,
                postId,
                author: { id: i + 10, username: `评论者${i + pageToFetch}`, avatar: `https://via.placeholder.com/30?text=C${i + 10}` },
                content: `这是对帖子 #${postId} 的第 ${pageToFetch} 页，第 ${i + 1} 条评论。`,
                createdAt: new Date().toISOString(),
            }));
            if (append) {
                currentComments.value = [...currentComments.value, ...newComments];
            } else {
                currentComments.value = newComments;
            }
            commentsPage.value = pageToFetch;
            commentsHasMore.value = pageToFetch < 2; // 假设最多2页评论
            console.log(`Fetched fake comments for post ${postId}, page ${pageToFetch}`, currentComments.value);
        } catch (error) {
            console.error(`Failed to fetch comments for post ${postId}:`, error);
            commentsHasMore.value = false;
        } finally {
            loadingComments.value = false;
        }
    }

    // 点赞/取消点赞帖子 (需要更新 post 状态)
    async function toggleLikePost(postId: number | string, currentState: boolean) {
        // 乐观更新 UI
        const postIndex = feedPosts.value.findIndex(p => p.id === postId);
        if (postIndex > -1) {
            feedPosts.value[postIndex].isLiked = !currentState;
            feedPosts.value[postIndex].likes += currentState ? -1 : 1;
        }
        if (currentPost.value && currentPost.value.id === postId) {
            currentPost.value.isLiked = !currentState;
            currentPost.value.likes += currentState ? -1 : 1;
        }

        try {
            // await likePost(postId, !currentState);
            console.log(`Toggled like for post ${postId}`);
        } catch (error) {
            console.error(`Failed to toggle like for post ${postId}:`, error);
            // 回滚 UI
            if (postIndex > -1) {
                feedPosts.value[postIndex].isLiked = currentState;
                feedPosts.value[postIndex].likes -= currentState ? -1 : 1;
            }
            if (currentPost.value && currentPost.value.id === postId) {
                currentPost.value.isLiked = currentState;
                currentPost.value.likes -= currentState ? -1 : 1;
            }
        }
    }

    // 发表评论 (需要更新评论列表)
    async function addComment(postId: number | string, content: string, replyTo?: number) {
        try {
            // const res = await postComment({ postId, content, replyTo });
            // if (res.code === 0 && res.data) {
            //   // 刷新评论列表或将新评论添加到开头
            //   fetchComments(postId, false);
            //   return true;
            // }
            await new Promise(resolve => setTimeout(resolve, 300));
            const newComment: Comment = {
                id: `new-${Date.now()}`,
                postId,
                author: { id: 99, username: '当前用户', avatar: 'https://via.placeholder.com/30?text=Me' },
                content,
                createdAt: new Date().toISOString(),
            };
            currentComments.value.unshift(newComment); // 添加到开头
            if (currentPost.value) currentPost.value.commentsCount++;
            console.log(`Added comment to post ${postId}: ${content}`);
            return true;
        } catch (error) {
            console.error(`Failed to add comment to post ${postId}:`, error);
            return false;
        }
    }

    // --- Getters (或直接使用 ref) --- //

    return {
        feedPosts,
        feedType,
        feedPage,
        feedHasMore,
        loadingFeed,
        currentPost,
        loadingPostDetail,
        currentComments,
        commentsPage,
        commentsHasMore,
        loadingComments,
        setFeedType,
        fetchFeed,
        fetchPostDetail,
        fetchComments,
        toggleLikePost,
        addComment,
    };
}); 