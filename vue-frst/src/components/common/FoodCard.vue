<template>
  <el-card shadow="hover" class="food-card">
    <el-image :src="item.imageUrl || defaultImage" fit="cover" class="food-image" lazy />
    <div class="card-body">
      <h4>{{ item.title || '未知菜品' }}</h4>
      <p class="description">{{ item.description || '暂无描述' }}</p>
      <div class="card-footer">
        <el-rate :model-value="item.rating || 0" disabled size="small" />
        <el-link type="primary" :underline="false" @click="viewDetails">查看详情</el-link>
        <!-- Can emit an event or use router-link for navigation -->
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ElCard, ElImage, ElRate, ElLink } from 'element-plus'
import defaultImage from '@/assets/images/default-food.png'; // Assume a default food image exists

interface FoodItem {
  id: number | string;
  title: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
}

// Define props
const props = defineProps<{ item: FoodItem }>()

// Emit an event when view details is clicked (alternative to direct navigation)
const emit = defineEmits(['view-details'])

const viewDetails = () => {
  emit('view-details', props.item.id)
  // Or use router directly if needed: 
  // import { useRouter } from 'vue-router';
  // const router = useRouter();
  // router.push(`/food/${props.item.id}`);
}

</script>

<style scoped lang="scss">
// Styles copied and adapted from HomeView/DiscoverView
.food-card {
  margin-bottom: 20px; 
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
      transform: translateY(-5px);
  }

  .food-image {
    width: 100%;
    height: 180px; 
    display: block;
    background-color: #eee; // Placeholder background
  }
  // Remove default card padding for image only
  :deep(.el-card__body) {
      padding: 0;
  }
  // Add padding back for the text content area
  .card-body {
    padding: 15px;
    h4 {
      margin: 0 0 10px 0;
      font-size: 1.1rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis; 
    }
    .description {
      font-size: 0.9rem;
      color: #606266;
      margin-bottom: 10px;
      height: 3em; 
      overflow: hidden;
      line-height: 1.5em;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; 
      -webkit-box-orient: vertical;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      .el-rate {
         height: auto; 
      }
    }
  }
}
</style> 