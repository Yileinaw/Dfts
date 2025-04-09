<template>
  <div class="discover-view container">
    <!-- Search Section -->
    <section class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索美食、餐厅、菜谱..."
        size="large"
        class="search-input"
        clearable
        @input="debouncedSearch"
        @keyup.enter="immediateSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="immediateSearch">搜索</el-button>
        </template>
      </el-input>
    </section>

    <!-- Filter Section (Placeholder) -->
    <section class="filter-section">
      <el-row :gutter="20" align="middle">
        <el-col :span="4">
          <span class="filter-label">分类:</span>
        </el-col>
        <el-col :span="20">
          <el-radio-group v-model="selectedCategory" size="small">
            <el-radio-button label="全部"></el-radio-button>
            <el-radio-button label="家常菜"></el-radio-button>
            <el-radio-button label="西餐"></el-radio-button>
            <el-radio-button label="甜点"></el-radio-button>
            <el-radio-button label="饮品"></el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>
       <el-row :gutter="20" align="middle" class="filter-row">
        <el-col :span="4">
          <span class="filter-label">评分:</span>
        </el-col>
        <el-col :span="20">
           <el-rate v-model="selectedRating" :max="5" size="large" allow-half clearable />
        </el-col>
      </el-row>
       <!-- Add more filters like location, price range etc. -->
    </section>

     <el-divider />

    <!-- Results Section -->
    <section class="results-section">
       <h3>搜索结果</h3>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in searchResults" :key="item.id">
             <!-- 使用 FoodCard 组件 -->
             <FoodCard :item="item" @view-details="handleViewDetails" />
          </el-col>
        </el-row>

        <!-- Placeholder for empty state -->
        <el-empty v-if="!searchResults.length" description="暂无匹配结果"></el-empty>

    </section>

    <!-- Pagination -->
    <section class="pagination-section" v-if="searchResults.length">
        <el-pagination
            background
            layout="prev, pager, next"
            :total="100" 
            :page-size="12"
            @current-change="handlePageChange"
        />
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import FoodCard from '@/components/common/FoodCard.vue' 
import { debounce } from 'lodash-es'

const searchQuery = ref('')
const selectedCategory = ref('全部')
const selectedRating = ref<number | undefined>(undefined)
const searchResults = ref([
  { id: 5, title: '红烧肉', description: '肥而不腻，入口即化。' , imageUrl: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', rating: 4.7 },
  { id: 6, title: '牛排配芦笋', description: '经典的西式搭配。' , imageUrl: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', rating: 4.2 },
  { id: 7, title: '提拉米苏', description: '带我走吧。' , imageUrl: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', rating: 4.9 },
  { id: 8, title: '珍珠奶茶', description: 'Q弹珍珠，丝滑奶茶。' , imageUrl: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', rating: 4.0 },
  // Add more items...
]);
const loading = ref(false);

const performSearch = async () => {
  if (!searchQuery.value && !selectedCategory.value && selectedRating.value === undefined) {
      console.log('Search criteria are empty, skipping search.');
      // Optionally clear results or show a default state
      // searchResults.value = []; 
      return;
  }
  
  loading.value = true;
  console.log(`Performing search with query: "${searchQuery.value}", category: ${selectedCategory.value}, rating: ${selectedRating.value}`);
  try {
    // TODO: Replace with actual API call using the filters
    // Example: const results = await searchApi({ query: searchQuery.value, category: selectedCategory.value, rating: selectedRating.value, page: currentPage.value });
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    // searchResults.value = results; // Update with API response
    console.log('Search simulation finished.')
  } catch (error) {
      console.error("Search failed:", error);
      // Handle error (e.g., show message)
  } finally {
      loading.value = false;
  }
}

const debouncedSearch = debounce(performSearch, 500);

const immediateSearch = () => {
    debouncedSearch.cancel(); 
    performSearch();
};

watch([selectedCategory, selectedRating], () => {
    console.log('Filters changed, search might be triggered by input/button.');
});

const handleViewDetails = (id: number | string) => {
  console.log('View details for food item:', id)
  // import { useRouter } from 'vue-router';
  // const router = useRouter();
  // router.push(`/food/${id}`)
}

const handlePageChange = (page: number) => {
    console.log('Current page:', page)
    // TODO: Fetch data for the new page, potentially calling performSearch with new page number
}

</script>

<script lang="ts">
export default {
  name: 'DiscoverView'
}
</script>

<style scoped lang="scss">
.discover-view {
  padding-top: 30px;
  padding-bottom: 30px;
}

.search-section {
  margin-bottom: 30px;
  .search-input {
    // max-width: 600px; // Limit search input width if needed
  }
}

.filter-section {
  margin-bottom: 20px;
  .filter-label {
    font-size: 0.9rem;
    color: #606266;
    display: inline-block;
    line-height: 32px; // Align with radio buttons/rate
  }
  .filter-row {
     margin-top: 15px;
  }
  .el-radio-group {
      // Add some spacing if needed
  }
}

.results-section {
   margin-top: 30px;
  h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
}

.pagination-section {
    margin-top: 40px;
    display: flex;
    justify-content: center;
}
</style> 