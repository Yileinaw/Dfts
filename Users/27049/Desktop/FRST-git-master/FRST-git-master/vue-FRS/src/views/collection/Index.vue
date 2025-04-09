<template>
  <div class="collection-view" v-loading="loadingCollections">
    <h1>我的收藏</h1>
    <div v-if="collectedRestaurants.length">
      <el-row :gutter="20">
        <el-col :span="8" v-for="restaurant in collectedRestaurants" :key="restaurant.id" style="margin-bottom: 20px;">
          <RestaurantCard :restaurant="restaurant" @click.stop="goToDetail(restaurant.id)">
             <!-- 添加移除收藏按钮 -->
            <template #footer>
              <el-button type="danger" plain size="small" @click.stop="handleRemoveCollection(restaurant.id)">移除收藏</el-button>
            </template>
          </RestaurantCard>
        </el-col>
      </el-row>
      <!-- 可以添加分页 -->
    </div>
    <el-empty description="你还没有收藏任何餐厅哦" v-else></el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCollectionStore } from '@/store/modules/collection';
import RestaurantCard from '@/components/business/RestaurantCard.vue';
import { ElMessageBox, ElMessage } from 'element-plus';

const router = useRouter();
const collectionStore = useCollectionStore();

const loadingCollections = computed(() => collectionStore.loadingCollections);
const collectedRestaurants = computed(() => collectionStore.collectedRestaurants);

onMounted(() => {
  collectionStore.fetchCollections();
});

const goToDetail = (id: number) => {
  router.push(`/restaurant/${id}`);
};

const handleRemoveCollection = async (restaurantId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要将这家餐厅从收藏中移除吗?',
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    // 用户确认
    const success = await collectionStore.removeRestaurantFromCollection(restaurantId);
    if (success) {
      ElMessage.success('已移除收藏');
    } else {
      ElMessage.error('移除失败，请稍后再试');
    }
  } catch (error) {
    // 用户取消或其他错误
    if (error !== 'cancel') {
      console.error('Remove collection error:', error);
    }
  }
};

</script>

<style scoped lang="scss">
.collection-view {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;

  h1 {
    margin-bottom: 20px;
    font-size: 24px;
    color: #303133;
  }

  // 为 RestaurantCard 添加 footer 插槽样式
  :deep(.restaurant-card .el-card__footer) {
    padding: 10px 14px;
    text-align: right;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style> 