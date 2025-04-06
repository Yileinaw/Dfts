<template>
  <el-card :body-style="{ padding: '0px' }" shadow="hover" class="restaurant-card" @click="goToDetail">
    <img
      :src="restaurant.coverImage || defaultImage"
      class="image"
      alt="Restaurant cover"
      @error="onImageError"
    />
    <div style="padding: 14px;">
      <span class="name">{{ restaurant.name }}</span>
      <div class="bottom">
        <el-rate
          v-if="restaurant.rating !== undefined"
          :model-value="restaurant.rating"
          disabled
          size="small"
          text-color="#ff9900"
          score-template="{value} 分"
        />
        <span v-else class="no-rating">暂无评分</span>
        <span class="price" v-if="restaurant.avgPrice">人均 ¥{{ restaurant.avgPrice }}</span>
      </div>
      <div class="tags" v-if="restaurant.tags?.length">
        <el-tag size="small" type="info" v-for="tag in restaurant.tags" :key="tag" style="margin-right: 5px;">{{ tag }}</el-tag>
      </div>
      <div class="address" v-if="restaurant.address">
        <el-icon><Location /></el-icon> {{ restaurant.address }}
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import type { RestaurantInfo } from '@/types/api'; // 使用 API 类型
import { Location } from '@element-plus/icons-vue';
import defaultImage from '@/assets/images/default-restaurant.png'; // 引入默认餐厅图片

const props = defineProps<{
  restaurant: RestaurantInfo;
}>();

const router = useRouter();

const goToDetail = () => {
  // 跳转到餐厅详情页，需要定义对应的路由
  router.push(`/restaurant/${props.restaurant.id}`);
};

const onImageError = (event: Event) => {
  (event.target as HTMLImageElement).src = defaultImage;
};

</script>

<style scoped lang="scss">
.restaurant-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: translateY(-5px);
  }
}

.image {
  width: 100%;
  height: 150px; // 固定高度
  object-fit: cover; // 保持图片比例并填充
  display: block;
}

.name {
  font-size: 16px;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bottom {
  margin-top: 5px;
  line-height: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #999;
  .el-rate {
    height: auto; // 覆盖 el-rate 默认高度
    margin-right: 5px;
  }
  .no-rating {
    font-size: 12px;
  }
  .price {
    color: #e6a23c;
    font-weight: bold;
  }
}

.tags {
  margin-top: 8px;
}

.address {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  display: flex;
  align-items: center;
  .el-icon {
    margin-right: 3px;
  }
}
</style> 