<template>
  <div class="restaurant-detail-view" v-loading="loadingDetail">
    <div v-if="restaurant">
      <h1>{{ restaurant.name }}</h1>
      <el-rate
        v-if="restaurant.rating !== undefined"
        :model-value="restaurant.rating"
        disabled
        size="large"
        show-score
        text-color="#ff9900"
        score-template="{value} 分"
      />
      <p>人均: ¥{{ restaurant.avgPrice || '-' }}</p>
      <p>菜系: {{ restaurant.cuisine || '-' }}</p>
      <p>地址: {{ restaurant.address || '-' }}</p>
      <p>电话: {{ restaurant.phone || '-' }}</p>
      <p>营业时间: {{ restaurant.openingHours || '-' }}</p>
      <p>描述: {{ restaurant.description || '暂无描述' }}</p>

      <el-divider>图集</el-divider>
      <div v-if="restaurant.images?.length">
        <el-image
          v-for="(img, index) in restaurant.images"
          :key="index"
          :src="img"
          fit="cover"
          style="width: 200px; height: 150px; margin-right: 10px;"
          :preview-src-list="restaurant.images"
          :initial-index="index"
          lazy
        />
      </div>
      <el-empty v-else description="暂无图片"></el-empty>

      <el-divider>用户评价</el-divider>
      <div v-if="restaurant.reviews?.length">
        <!-- 评价列表渲染 -->
        <div v-for="review in restaurant.reviews" :key="review.id">
          <p><strong>{{ review.user }}:</strong> {{ review.comment }}</p>
        </div>
      </div>
      <el-empty v-else description="暂无评价"></el-empty>

      <!-- 添加评价入口 -->

    </div>
    <el-empty v-else description="未能加载餐厅详情"></el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRestaurantStore } from '@/store/modules/restaurant';

const props = defineProps<{ id: string | number }>(); // 接收路由参数 id

const restaurantStore = useRestaurantStore();

const loadingDetail = computed(() => restaurantStore.loadingDetail);
const restaurant = computed(() => restaurantStore.currentRestaurant);

onMounted(() => {
  restaurantStore.fetchRestaurantDetail(Number(props.id));
});

</script>

<style scoped lang="scss">
.restaurant-detail-view {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}
</style> 