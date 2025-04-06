<template>
  <div class="discover-view">
    <h2>发现美食</h2>

    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-section">
      <el-row :gutter="20" align="middle">
        <el-col :xs="24" :sm="12" :md="16">
          <span class="filter-label">分类:</span>
          <el-radio-group v-model="selectedCategory" size="small" @change="applyFilters" class="category-filter">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button v-for="cat in availableCategories" :key="cat.id" :label="cat.id">{{ cat.name
              }}</el-radio-button>
        </el-radio-group>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-input v-model="searchTermDisplay" placeholder="在结果中搜索..." :prefix-icon="Search" size="small" clearable
            @input="debounceApplyFilters" class="search-input" />
          <!-- <span class="filter-label">排序:</span>
           <el-select v-model="sortBy" placeholder="默认排序" size="small" @change="applySort" style="width: 100%;">
             <el-option label="默认排序" value="default"></el-option>
             <el-option label="评分最高" value="rating_desc"></el-option>
             <el-option label="价格最低" value="price_asc"></el-option>
             <el-option label="价格最高" value="price_desc"></el-option>
          </el-select> -->
        </el-col>
      </el-row>
    </el-card>

    <!-- 美食网格盒子 -->
    <div class="grid-container-box" v-loading="loading">
      <el-empty description="没有找到相关美食" v-if="!paginatedFoods.length && !loading"></el-empty>
      <div class="food-grid" v-else>
        <!-- 修改 v-for 遍历 paginatedFoods -->
        <FoodCard v-for="food in paginatedFoods" :key="food.id" :food="food" @click="goToFoodDetail(food.id)" />
      </div>
      <!-- 分页按钮 -->
      <el-pagination v-if="filteredFoods.length > pageSize" :current-page="currentPage" :page-size="pageSize"
        :total="filteredFoods.length" @current-change="handlePageChange" layout="prev, pager, next" background
        class="discover-pagination" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, Pointer } from '@element-plus/icons-vue'; // Import Search icon
import FoodCard from '@/components/business/FoodCard.vue'; // Reuse FoodCard
import type { FoodInfo, FoodCategory } from '@/types/food';
import _ from 'lodash'; // Import lodash for debounce

// --- Import all TestImages --- 
// (This list is long, generated from the previous step)
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
// --- Image import end ---

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const allFoods = ref<FoodInfo[]>([]); // Stores all food data
const filteredFoods = ref<FoodInfo[]>([]); // Stores filtered and sorted data

// Filter criteria
const initialSearchTerm = ref(route.query.food_keyword as string || ''); // From homepage search
const searchTermDisplay = ref(route.query.food_keyword as string || ''); // For the input field on this page
const selectedCategory = ref(route.query.food_category as string || 'all'); // From homepage category click or filter here
// const sortBy = ref('default'); // Sorting to be added later

// Pagination state
const currentPage = ref(1);
const pageSize = ref(8); // Fixed 2 rows * 4 columns

// 基础分类定义 (ID 对应中文名)
const baseCategories: FoodCategory[] = [
  { id: 'hotpot', name: '火锅' },
  { id: 'sichuan', name: '川菜' },
  { id: 'japanese', name: '日料' },
  { id: 'dessert', name: '甜点' },
  { id: 'snack', name: '小吃' },
  { id: 'bbq', name: '烧烤' },
  { id: 'noodle', name: '面食' },
  { id: 'drink', name: '饮品' },
  { id: 'western', name: '西餐' },
  { id: 'chinese', name: '中餐' },
  { id: 'other', name: '其他' },
];

// 动态生成的可用分类列表 (用于筛选按钮)
const availableCategories = ref<FoodCategory[]>([]);

// Debounce function for applying filters from search input
const debounceApplyFilters = _.debounce(() => {
  applyFilters();
}, 300); // 300ms delay

// Initialize all food data from imported images
const initializeFoodData = () => {
  loading.value = true;
  const foods: FoodInfo[] = [
    // Map imported images and filenames to FoodInfo structure
    // Placeholder categories, tags, ratings, prices assigned
    { id: 1, name: '东坡肉', coverImage: dongPoRou, category: 'chinese', rating: 4.8, price: 68, tags: ['经典', '本帮菜'] },
    { id: 2, name: '乌克兰土豆', coverImage: wuKeLanTuDou, category: 'other', rating: 4.2, price: 35, tags: ['特色'] },
    { id: 3, name: '全家福寿司', coverImage: quanJiaFuShouSi, category: 'japanese', rating: 4.7, price: 98, tags: ['拼盘', '聚餐'] },
    { id: 4, name: '军舰寿司', coverImage: junJianShouSi, category: 'japanese', rating: 4.5, price: 15, tags: ['经典', '海苔'] },
    { id: 5, name: '原切三文鱼', coverImage: yuanQieSanWenYu, category: 'japanese', rating: 4.9, price: 78, tags: ['刺身', '新鲜'] },
    { id: 6, name: '口味虾', coverImage: kouWeiXia, category: 'snack', rating: 4.8, price: 128, tags: ['招牌', '辣', '夜宵优选'] },
    { id: 7, name: '叫花鸡', coverImage: jiaoHuaJi, category: 'chinese', rating: 4.6, price: 88, tags: ['传统', '特色'] },
    { id: 8, name: '多拼沙拉', coverImage: duoPinShaLa, category: 'western', rating: 4.4, price: 45, tags: ['健康', '轻食'] },
    { id: 9, name: '姑姑肉', coverImage: guGuRou, category: 'other', rating: 4.0, price: 50 },
    { id: 10, name: '安格斯汉堡', coverImage: angGeSiHanBao, category: 'western', rating: 4.7, price: 65, tags: ['牛肉', '快餐'] },
    { id: 11, name: '宫保鸡丁', coverImage: gongBaoJiDing, category: 'sichuan', rating: 4.6, price: 45, tags: ['家常菜', '下饭'] },
    { id: 12, name: '小酥肉', coverImage: xiaoSuRou, category: 'snack', rating: 4.5, price: 30, tags: ['炸物', '香脆'] },
    { id: 13, name: '意大利卷面', coverImage: yiDaLiJuanMian, category: 'western', rating: 4.3, price: 55, tags: ['意面'] },
    { id: 14, name: '旦旦面', coverImage: danDanMian, category: 'noodle', rating: 4.5, price: 28, tags: ['四川', '面食'] },
    { id: 15, name: '春卷', coverImage: chunJuan, category: 'snack', rating: 4.2, price: 15, tags: ['炸物', '点心'] },
    { id: 16, name: '杂烩海味', coverImage: zaHuiHaiWei, category: 'chinese', rating: 4.6, price: 75, tags: ['海鲜'] },
    { id: 17, name: '板板肉', coverImage: banBanRou, category: 'other', rating: 4.1, price: 60 },
    { id: 18, name: '柠檬土司', coverImage: ningMengTuSi, category: 'dessert', rating: 4.3, price: 22, tags: ['早餐', '面包'] },
    { id: 19, name: '水煮肉片', coverImage: shuiZhuRouPian, category: 'sichuan', rating: 4.9, price: 55, tags: ['麻辣', '经典川菜'] },
    { id: 20, name: '油泼面', coverImage: youPoMian, category: 'noodle', rating: 4.7, price: 26, tags: ['陕西', '面食', '香辣'] },
    { id: 21, name: '法式早餐', coverImage: faShiZaoCan, category: 'western', rating: 4.5, price: 58, tags: ['早餐', '套餐'] },
    { id: 22, name: '法式火鸡', coverImage: faShiHuoJi, category: 'western', rating: 4.8, price: 188, tags: ['节日', '烤'] },
    { id: 23, name: '浓汤鸡杂', coverImage: nongTangJiZa, category: 'chinese', rating: 4.3, price: 38, tags: ['汤', '家常'] },
    { id: 24, name: '海味寿司', coverImage: haiWeiShouSi, category: 'japanese', rating: 4.6, price: 20, tags: ['海鲜'] },
    { id: 25, name: '烤鸡柳', coverImage: kaoJiLiu, category: 'snack', rating: 4.4, price: 25, tags: ['小吃', '快餐'] },
    { id: 26, name: '焦香蛋卷', coverImage: jiaoXiangDanJuan, category: 'dessert', rating: 4.5, price: 18, tags: ['点心', '下午茶'] },
    { id: 27, name: '牛肉拼盘', coverImage: niuRouPinPan, category: 'chinese', rating: 4.7, price: 85, tags: ['凉菜', '下酒'] },
    { id: 28, name: '玉米纳豆', coverImage: yuMiNaDou, category: 'japanese', rating: 4.1, price: 25, tags: ['健康', '特色'] },
    { id: 29, name: '留一手龙虾', coverImage: liuYiShouLongXia, category: 'snack', rating: 4.7, price: 158, tags: ['小龙虾', '辣'] },
    { id: 30, name: '白切鸡', coverImage: baiQieJi, category: 'chinese', rating: 4.8, price: 58, tags: ['粤菜', '经典'] },
    { id: 31, name: '简单面', coverImage: jianDanMian, category: 'noodle', rating: 4.0, price: 15 },
    { id: 32, name: '紫罗兰冰激凌', coverImage: ziLuoLanBingJiLing, category: 'dessert', rating: 4.6, price: 28, tags: ['冰品', '夏季'] },
    { id: 33, name: '经典寿司', coverImage: jingDianShouSi, category: 'japanese', rating: 4.4, price: 12, tags: ['基础款'] },
    { id: 34, name: '经典意大利面', coverImage: jingDianYiDaLiMian, category: 'western', rating: 4.5, price: 52, tags: ['意面', '番茄'] },
    { id: 35, name: '经典扣肉', coverImage: jingDianKouRou, category: 'chinese', rating: 4.7, price: 72, tags: ['硬菜', '宴请'] },
    { id: 36, name: '羊肉串', coverImage: yangRouChuan, category: 'bbq', rating: 4.7, price: 5, tags: ['夜宵', '肉食'] },
    { id: 37, name: '肉酱意面', coverImage: rouJiangYiMian, category: 'western', rating: 4.6, price: 58, tags: ['经典', '意面'] },
    { id: 38, name: '腊味拼盘', coverImage: laWeiPinPan, category: 'chinese', rating: 4.5, price: 65, tags: ['凉菜', '年味'] },
    { id: 39, name: '腊肠披萨', coverImage: laChangPiSa, category: 'western', rating: 4.6, price: 78, tags: ['披萨', '特色'] },
    { id: 40, name: '腊肠蛋挞', coverImage: laChangDanTa, category: 'dessert', rating: 4.2, price: 10, tags: ['点心', '创意'] },
    { id: 41, name: '蚕蛹炒肉', coverImage: canYongChaoRou, category: 'other', rating: 4.0, price: 55, tags: ['特色', '蛋白质'] },
    { id: 42, name: '蛋炒饭', coverImage: danChaoFan, category: 'chinese', rating: 4.3, price: 20, tags: ['主食', '快手'] },
    { id: 43, name: '西冷焗汤', coverImage: xiLengJuTang, category: 'western', rating: 4.5, price: 48, tags: ['汤品', '浓郁'] },
    { id: 44, name: '西冷牛排', coverImage: xiLengNiuPai, category: 'western', rating: 4.8, price: 128, tags: ['牛排', '品质'] },
    { id: 45, name: '辣子鸡', coverImage: laZiJi, category: 'sichuan', rating: 4.7, price: 65, tags: ['干煸', '麻辣'] },
    { id: 46, name: '辣椒牛肉', coverImage: laJiaoNiuRou, category: 'sichuan', rating: 4.6, price: 70, tags: ['小炒', '下饭'] },
    { id: 47, name: '雪里红炒肉', coverImage: xueLiHongChaoRou, category: 'chinese', rating: 4.2, price: 32, tags: ['家常'] },
    { id: 48, name: '香辣虾球', coverImage: xiangLaXiaQiu, category: 'snack', rating: 4.6, price: 68, tags: ['海鲜', '辣'] },
    { id: 49, name: '鱼柳寿司', coverImage: yuLiuShouSi, category: 'japanese', rating: 4.3, price: 18 },
    { id: 50, name: '鹅肝寿司', coverImage: eGanShouSi, category: 'japanese', rating: 4.9, price: 35, tags: ['高端', '入口即化'] },
  ];
  allFoods.value = foods;

  // 动态生成可用分类列表，并确保使用 baseCategories 的中文名
  const categoriesInFoods = new Set(foods.map(food => food.category).filter(Boolean));
  availableCategories.value = baseCategories.filter(bc => categoriesInFoods.has(bc.id));

  applyFilters(); // Apply initial filters (from route query)
  loading.value = false;
};

// Apply filtering based on search term and category
const applyFilters = () => {
  // Use searchTermDisplay for filtering within the page
  const currentSearch = searchTermDisplay.value.toLowerCase();
  let result = allFoods.value;

  // Filter by search term (name)
  if (currentSearch) {
    result = result.filter(food =>
      food.name.toLowerCase().includes(currentSearch)
    );
  }

  // Filter by category
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    result = result.filter(food => food.category === selectedCategory.value);
  }

  // Reset to first page when filters change
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  }

  filteredFoods.value = result;
  // applySort(); // Apply sorting if implemented
};

// Apply sorting (placeholder for now)
// const applySort = () => {
//   // ... sorting logic ...
// };

// Watch for route query changes (coming from Home page)
watch(
  () => route.query,
  (newQuery) => {
    const keyword = newQuery.food_keyword as string || '';
    const category = newQuery.food_category as string || 'all';

    initialSearchTerm.value = keyword;
    searchTermDisplay.value = keyword; // Update display search term as well
    selectedCategory.value = category;

    // Ensure data is loaded before filtering based on new query
    if (allFoods.value.length > 0) {
      applyFilters();
    }
  },
  { deep: true } // No immediate needed, onMounted handles initial load
);

// Navigate to food detail page
const goToFoodDetail = (foodId: number) => {
  console.log(`Navigate to detail page for food ID: ${foodId}`);
  // Correct the path to match the defined route
  router.push(`/food/${foodId}`); 
};

// Computed property for paginated food items
const paginatedFoods = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredFoods.value.slice(start, end);
});

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page;
  // Optional: Scroll to top of the grid when changing pages
  document.querySelector('.food-grid-wrapper')?.scrollIntoView({ behavior: 'smooth' });
};

// Initialize data on component mount
onMounted(() => {
  initializeFoodData();
});

</script>

<style scoped lang="scss">
.discover-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.filter-section {
  margin-bottom: 25px;
  padding: 15px 20px;
  background-color: var(--el-fill-color-lighter); // Subtle background

    .filter-label {
      font-size: 14px;
    color: var(--el-text-color-secondary);
      margin-right: 10px;
    display: inline-block;
    line-height: 32px; // 调整行高以更好对齐 RadioButton
  }

  .category-filter {
    margin-bottom: 10px; // Space between category and search on small screens
    display: inline-flex; // 改为 inline-flex 允许换行
    flex-wrap: wrap; // 允许换行
    gap: 8px; // 添加按钮间距
    vertical-align: middle; // 尝试垂直对齐标签

    // 移除 RadioButton 之间的默认边距，使用 gap 控制
    .el-radio-button {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }

    @media (min-width: 768px) {
      // md breakpoint and up
      margin-bottom: 0;
    }
  }

  .search-input {
    // width: 100%;
  }
}

// 新增: 网格容器盒子样式
.grid-container-box {
  min-height: 600px; // 根据卡片大小调整，确保盒子有足够高度
  position: relative; // 为分页定位提供基准
  padding-bottom: 60px; // 为底部分页留出空间
}

.food-grid-wrapper {
  // 这个包装器现在可以移除或合并到 .grid-container-box
  min-height: auto;
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); // 固定 4 列
  // grid-template-rows: repeat(2, auto); // 不严格限制行数为 2，让内容自然填充
  gap: 20px;

  // 移除响应式列数变化
  /* 
  @media (min-width: 576px) { ... }
  @media (min-width: 768px) { ... }
  @media (min-width: 992px) { ... }
  */

  .food-card {
    min-width: 0;
  }
}

// 修改: 分页组件样式
.discover-pagination {
  position: absolute; // 绝对定位
  bottom: 10px; // 距离盒子底部 10px
  left: 50%; // 水平居中
  transform: translateX(-50%); // 精确居中
  margin-top: 0; // 移除默认的上边距
  padding: 10px 0;
}

.el-empty {
  grid-column: 1 / -1;
  padding: 40px 0;
}
</style> 