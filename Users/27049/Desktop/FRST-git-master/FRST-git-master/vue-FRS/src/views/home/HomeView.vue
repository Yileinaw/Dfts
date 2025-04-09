<template>
  <div class="home-view" v-loading="loading">
    <!-- 添加内容包装器 -->
    <div class="home-content-wrapper">
      <!-- 顶部区域: 城市与搜索 -->
      <el-row :gutter="20" class="top-bar">
        <el-col :span="4">
          <el-select v-model="currentCity" placeholder="选择城市" size="large" disabled>
            <el-option label="北京市" value="beijing"></el-option>
            <!-- 城市列表需要动态获取 -->
          </el-select>
        </el-col>
        <el-col :span="20">
          <el-input v-model="searchKeyword" placeholder="搜索美食、菜品..." size="large" clearable @keyup.enter="handleSearch">
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </el-col>
      </el-row>

      <!-- 美食分类 -->
      <el-card shadow="never" class="category-section">
        <template #header>
          <div class="card-header">
            <span>美食分类</span>
          </div>
        </template>
        <div class="category-tags">
          <el-tag v-for="category in foodCategories" :key="category.id" class="category-tag"
            @click="goToCategory(category.id)" effect="plain">
            {{ category.name }}
          </el-tag>
          <el-tag class="category-tag" @click="goToDiscover" effect="plain">全部</el-tag>
        </div>
      </el-card>

      <!-- 食物轮播图 -->
      <el-carousel :interval="4000" type="card" height="250px" class="food-carousel">
        <el-carousel-item v-for="item in carouselItems" :key="item.id">
          <img :src="item.src" :alt="item.alt || 'Featured Food'" class="carousel-image"
            @click="goToFoodDetail(item.id)" />
        </el-carousel-item>
      </el-carousel>

      <!-- 热门帖子 -->
      <el-card shadow="never" class="community-section">
        <template #header>
          <div class="card-header">
            <span>热门帖子</span>
            <el-link type="primary" @click="goToCommunity">查看更多</el-link>
          </div>
        </template>
        <div v-loading="communityLoading">
          <el-empty description="社区静悄悄，快来发帖吧~" v-if="!hotPosts.length && !communityLoading"></el-empty>
          <ul class="post-list" v-else>
            <li v-for="post in hotPosts" :key="post.id" class="post-item" @click="goToPostDetail(post.id)">
              <span class="post-title">{{ post.title }}</span>
              <div class="post-meta">
                <span class="author">by {{ post.authorName }}</span>
                <span class="likes" v-if="post.likes"><el-icon>
                    <Pointer />
                  </el-icon> {{ post.likes }}</span>
              </div>
            </li>
          </ul>
        </div>
      </el-card>
    </div> <!-- 关闭内容包装器 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Pointer } from '@element-plus/icons-vue';
import type { FoodCategory } from '@/types/food';
import type { PostInfo } from '@/types/api';
// import type { FoodInfo } from '@/types/food'; // 移除 FoodInfo
// import FoodCard from '@/components/business/FoodCard.vue'; // 移除 FoodCard

// --- 导入所有 TestImages 图片资源 --- 
// (这里需要所有 TestImages 的导入，以便随机选取)
import dongPoRou from '@/assets/images/TestImages/东坡肉.jpg';
import wuKeLanTuDou from '@/assets/images/TestImages/乌克兰土豆.jpg';
import quanJiaFuShouSi from '@/assets/images/TestImages/全家福寿司.jpg';
import junJianShouSi from '@/assets/images/TestImages/军舰寿司.jpg';
import yuanQieSanWenYu from '@/assets/images/TestImages/原切三文鱼.jpg';
import kouWeiXia from '@/assets/images/TestImages/口味虾.jpg';
import jiaoHuaJi from '@/assets/images/TestImages/叫花鸡.jpg';
import duoPinShaLa from '@/assets/images/TestImages/多拼沙拉.jpg';
import guGuRou from '@/assets/images/TestImages/姑姑肉.jpg';
import angGeSiHanBao from '@/assets/images/TestImages/安格斯汉堡.jpg';
import gongBaoJiDing from '@/assets/images/TestImages/宫保鸡丁.jpg';
import xiaoSuRou from '@/assets/images/TestImages/小酥肉.jpg';
import yiDaLiJuanMian from '@/assets/images/TestImages/意大利卷面.jpg';
import danDanMian from '@/assets/images/TestImages/旦旦面.jpg';
import chunJuan from '@/assets/images/TestImages/春卷.jpg';
import zaHuiHaiWei from '@/assets/images/TestImages/杂烩海味.jpg';
import banBanRou from '@/assets/images/TestImages/板板肉.jpg';
import ningMengTuSi from '@/assets/images/TestImages/柠檬土司.jpg';
import shuiZhuRouPian from '@/assets/images/TestImages/水煮肉片.jpg';
import youPoMian from '@/assets/images/TestImages/油泼面.jpg';
import faShiZaoCan from '@/assets/images/TestImages/法式早餐.jpg';
import faShiHuoJi from '@/assets/images/TestImages/法式火鸡.jpg';
import nongTangJiZa from '@/assets/images/TestImages/浓汤鸡杂.jpg';
import haiWeiShouSi from '@/assets/images/TestImages/海味寿司.jpg';
import kaoJiLiu from '@/assets/images/TestImages/烤鸡柳.jpg';
import jiaoXiangDanJuan from '@/assets/images/TestImages/焦香蛋卷.jpg';
import niuRouPinPan from '@/assets/images/TestImages/牛肉拼盘.jpg';
import yuMiNaDou from '@/assets/images/TestImages/玉米纳豆.jpg';
import liuYiShouLongXia from '@/assets/images/TestImages/留一手龙虾.jpg';
import baiQieJi from '@/assets/images/TestImages/白切鸡.jpg';
import jianDanMian from '@/assets/images/TestImages/简单面.jpg';
import ziLuoLanBingJiLing from '@/assets/images/TestImages/紫罗兰冰激凌.jpg';
import jingDianShouSi from '@/assets/images/TestImages/经典寿司.jpg';
import jingDianYiDaLiMian from '@/assets/images/TestImages/经典意大利面.jpg';
import jingDianKouRou from '@/assets/images/TestImages/经典扣肉.jpg';
import yangRouChuan from '@/assets/images/TestImages/羊肉串.jpg';
import rouJiangYiMian from '@/assets/images/TestImages/肉酱意面.jpg';
import laWeiPinPan from '@/assets/images/TestImages/腊味拼盘.jpg';
import laChangPiSa from '@/assets/images/TestImages/腊肠披萨.jpg';
import laChangDanTa from '@/assets/images/TestImages/腊肠蛋挞.jpg';
import canYongChaoRou from '@/assets/images/TestImages/蚕蛹炒肉.jpg';
import danChaoFan from '@/assets/images/TestImages/蛋炒饭.jpg';
import xiLengJuTang from '@/assets/images/TestImages/西冷焗汤.jpg';
import xiLengNiuPai from '@/assets/images/TestImages/西冷牛排.jpg';
import laZiJi from '@/assets/images/TestImages/辣子鸡.jpg';
import laJiaoNiuRou from '@/assets/images/TestImages/辣椒牛肉.jpg';
import xueLiHongChaoRou from '@/assets/images/TestImages/雪里红炒肉.jpg';
import xiangLaXiaQiu from '@/assets/images/TestImages/香辣虾球.jpg';
import yuLiuShouSi from '@/assets/images/TestImages/鱼柳寿司.jpg';
import eGanShouSi from '@/assets/images/TestImages/鹅肝寿司.jpg';
// --- 图片资源导入结束 ---

const router = useRouter();

const currentCity = ref('beijing');
const searchKeyword = ref('');
const loading = ref(false); // 主加载状态 (可用于整体或特定部分)
const communityLoading = ref(false); // 社区部分加载状态

// --- 轮播图数据结构 ---
interface CarouselItem {
  id: number;
  src: string;
  alt?: string;
}
const carouselItems = ref<CarouselItem[]>([]);

// --- 所有可用轮播图项 (包含 ID 和图片) ---
// ID 需要与 foodDataHelper.ts 中的 ID 对应
const allAvailableCarouselItems: CarouselItem[] = [
  { id: 1, src: dongPoRou, alt: '东坡肉' },
  { id: 2, src: wuKeLanTuDou, alt: '乌克兰土豆' },
  { id: 3, src: quanJiaFuShouSi, alt: '全家福寿司' },
  { id: 4, src: junJianShouSi, alt: '军舰寿司' },
  { id: 5, src: yuanQieSanWenYu, alt: '原切三文鱼' },
  { id: 6, src: kouWeiXia, alt: '口味虾' },
  { id: 7, src: jiaoHuaJi, alt: '叫花鸡' },
  { id: 8, src: duoPinShaLa, alt: '多拼沙拉' },
  { id: 9, src: guGuRou, alt: '姑姑肉' },
  { id: 10, src: angGeSiHanBao, alt: '安格斯汉堡' },
  { id: 11, src: gongBaoJiDing, alt: '宫保鸡丁' },
  { id: 12, src: xiaoSuRou, alt: '小酥肉' },
  { id: 13, src: yiDaLiJuanMian, alt: '意大利卷面' },
  { id: 14, src: danDanMian, alt: '旦旦面' },
  { id: 15, src: chunJuan, alt: '春卷' },
  { id: 16, src: zaHuiHaiWei, alt: '杂烩海味' },
  { id: 17, src: banBanRou, alt: '板板肉' },
  { id: 18, src: ningMengTuSi, alt: '柠檬土司' },
  { id: 19, src: shuiZhuRouPian, alt: '水煮肉片' },
  { id: 20, src: youPoMian, alt: '油泼面' },
  { id: 21, src: faShiZaoCan, alt: '法式早餐' },
  { id: 22, src: faShiHuoJi, alt: '法式火鸡' },
  { id: 23, src: nongTangJiZa, alt: '浓汤鸡杂' },
  { id: 24, src: haiWeiShouSi, alt: '海味寿司' },
  { id: 25, src: kaoJiLiu, alt: '烤鸡柳' },
  { id: 26, src: jiaoXiangDanJuan, alt: '焦香蛋卷' },
  { id: 27, src: niuRouPinPan, alt: '牛肉拼盘' },
  { id: 28, src: yuMiNaDou, alt: '玉米纳豆' },
  { id: 29, src: liuYiShouLongXia, alt: '留一手龙虾' },
  { id: 30, src: baiQieJi, alt: '白切鸡' },
  { id: 31, src: jianDanMian, alt: '简单面' },
  { id: 32, src: ziLuoLanBingJiLing, alt: '紫罗兰冰激凌' },
  { id: 33, src: jingDianShouSi, alt: '经典寿司' },
  { id: 34, src: jingDianYiDaLiMian, alt: '经典意大利面' },
  { id: 35, src: jingDianKouRou, alt: '经典扣肉' },
  { id: 36, src: yangRouChuan, alt: '羊肉串' },
  { id: 37, src: rouJiangYiMian, alt: '肉酱意面' },
  { id: 38, src: laWeiPinPan, alt: '腊味拼盘' },
  { id: 39, src: laChangPiSa, alt: '腊肠披萨' },
  { id: 40, src: laChangDanTa, alt: '腊肠蛋挞' },
  { id: 41, src: canYongChaoRou, alt: '蚕蛹炒肉' },
  { id: 42, src: danChaoFan, alt: '蛋炒饭' },
  { id: 43, src: xiLengJuTang, alt: '西冷焗汤' },
  { id: 44, src: xiLengNiuPai, alt: '西冷牛排' },
  { id: 45, src: laZiJi, alt: '辣子鸡' },
  { id: 46, src: laJiaoNiuRou, alt: '辣椒牛肉' },
  { id: 47, src: xueLiHongChaoRou, alt: '雪里红炒肉' },
  { id: 48, src: xiangLaXiaQiu, alt: '香辣虾球' },
  { id: 49, src: yuLiuShouSi, alt: '鱼柳寿司' },
  { id: 50, src: eGanShouSi, alt: '鹅肝寿司' },
];

// --- 美食分类数据 ---
const foodCategories = ref<FoodCategory[]>([
  { id: 'hotpot', name: '火锅' },
  { id: 'sichuan', name: '川菜' },
  { id: 'japanese', name: '日料' },
  { id: 'dessert', name: '甜点' },
  { id: 'snack', name: '小吃' },
  { id: 'bbq', name: '烧烤' },
  { id: 'noodle', name: '面食' },
  { id: 'drink', name: '饮品' },
]);

// --- 模拟热门帖子数据 ---
interface HotPost {
  id: number;
  title: string;
  authorName: string;
  likes?: number;
}
const hotPosts = ref<HotPost[]>([]);

// --- Define LocalStorage Key ---
const POSTS_KEY = 'frs_posts'; // Match the key from mockDataHelper

// 模拟获取数据 (合并为一个函数)
const fetchData = () => {
  // --- Load Carousel (no change) ---
  const shuffled = [...allAvailableCarouselItems].sort(() => 0.5 - Math.random());
  carouselItems.value = shuffled.slice(0, 8);

  // --- Load Hot Posts from LocalStorage ---
  communityLoading.value = true;
  hotPosts.value = []; // Clear previous posts
  try {
    const storedPosts = localStorage.getItem(POSTS_KEY);
    if (storedPosts) {
      const parsedPosts: PostInfo[] = JSON.parse(storedPosts);
      // Basic validation
      if (Array.isArray(parsedPosts)) {
        // Sort by likes (descending) or use other criteria if needed
        // For now, just take the first few as "hot"
        const latestPosts = parsedPosts.slice(-4).reverse(); // Get latest 4 posts

        hotPosts.value = latestPosts.map(post => ({
          // Ensure ID is a number
          id: Number(post.id), 
          title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '') || '查看帖子详情',
          authorName: post.author.username,
          likes: post.likes
        }));
        console.log('Loaded hot posts from localStorage:', hotPosts.value);
      }
    }
  } catch (error) {
    console.error('Error loading posts from localStorage for homepage:', error);
    // Handle error, maybe show a message or leave hotPosts empty
  } finally {
     // Simulate loading time even if loaded quickly or failed
     setTimeout(() => {
         communityLoading.value = false;
     }, 300); 
  }
};
// --- fetchData function end ---

// 组件挂载时加载数据
onMounted(() => {
  fetchData();
});

const handleSearch = () => {
  if (!searchKeyword.value) return;
  router.push({ path: '/discover', query: { food_keyword: searchKeyword.value } });
};

const goToCategory = (categoryId: number | string) => {
  router.push({ path: '/discover', query: { food_category: categoryId } });
};

const goToDiscover = () => {
  router.push('/discover');
};

const goToCommunity = () => {
  router.push('/community');
};

const goToPostDetail = (postId: number) => {
  router.push(`/post/${postId}`);
};

const goToFoodDetail = (foodId: number) => {
  router.push(`/food/${foodId}`);
};

</script>

<style scoped lang="scss">
.home-view {
  // padding: 20px; /* 移除这里的内边距，移到包装器上 */
}

// 新增: 内容包装器样式
.home-content-wrapper {
  max-width: 1200px; // 设置最大宽度，可以根据设计调整
  margin: 0 auto; // 左右自动外边距实现居中
  padding: 20px; // 将原来的内边距应用到这里
}

.top-bar {
  margin-bottom: 20px;
}

.category-section,
.community-section {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 18px;
      font-weight: bold;
    }
  }
}

// 美食分类样式
.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-tag {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }
}

// 轮播图样式
.food-carousel {
  margin-bottom: 20px;

  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
  }
}

// 热门帖子列表样式
.community-section {
  .post-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .post-item {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &:last-child {
      border-bottom: none;
    }

    .post-title {
      display: block;
      font-size: 15px;
      color: var(--el-text-color-primary);
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .post-meta {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--el-text-color-secondary);

      .author {
        // margin-right: 15px;
      }

      .likes {
        display: inline-flex;
        align-items: center;

        .el-icon {
          margin-right: 4px;
        }
      }
    }
  }

  .el-empty {
    padding: 30px 0;
  }
}
</style>