<template>
    <div class="food-detail-view" v-loading="loading">
        <el-page-header @back="goBack" :icon="ArrowLeft">
            <template #content>
                <span class="page-title">{{ foodDetail?.name || '美食详情' }}</span>
            </template>
        </el-page-header>

        <el-card shadow="never" v-if="foodDetail">
            <el-row :gutter="30">
                <el-col :span="10">
                    <img :src="foodDetail.coverImage" :alt="foodDetail.name" class="food-image">
                </el-col>
                <el-col :span="14">
                    <h1>{{ foodDetail.name }}</h1>
                    <el-rate v-if="foodDetail.rating !== undefined" :model-value="foodDetail.rating" disabled show-score
                        text-color="#ff9900" score-template="{value} 分" size="large" class="rating-display" />
                    <p class="price-display" v-if="foodDetail.price">参考价格: <span>¥{{ foodDetail.price }}</span></p>
                    <div class="tags-display" v-if="foodDetail.tags?.length">
                        <el-tag v-for="tag in foodDetail.tags" :key="tag" type="warning" effect="light" round
                            style="margin-right: 8px;">
                            {{ tag }}
                        </el-tag>
                    </div>
                    <p class="description-display">{{ foodDetail.description ||
                        generatePlaceholderDescription(foodDetail.name)
                    }}</p>

                    <div class="action-buttons">
                         <el-button 
                           type="warning" 
                           :icon="Star" 
                           @click="handleAddToCollection"
                           :disabled="isAlreadyCollected || addingToCollection"
                           :loading="addingToCollection">
                           {{ isAlreadyCollected ? '已收藏' : '加入收藏' }}
                         </el-button>
                    </div>

                    <div v-if="foodDetail.restaurantName" class="restaurant-link">
                        <el-divider content-position="left">在哪吃</el-divider>
                        <el-link type="primary" @click="goToRestaurant(foodDetail.restaurantId)" :icon="Shop">{{
                            foodDetail.restaurantName }}</el-link>
                    </div>

                    <el-divider content-position="left">关于这道菜</el-divider>
                    <p class="placeholder-text">{{ generatePlaceholderDetails(foodDetail.name) }}</p>

                </el-col>
            </el-row>
        </el-card>
        <el-empty description="无法加载美食信息" v-else-if="!loading"></el-empty>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { FoodInfo } from '@/types/food';
import { useUserStore } from '@/store/modules/user';
import { ArrowLeft, Shop, Star } from '@element-plus/icons-vue';
import { findFoodById } from '@/utils/mockDataHelper';

const props = defineProps<{
    id: string;
}>();

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const foodDetail = ref<FoodInfo | null>(null);
const addingToCollection = ref(false);

const isAlreadyCollected = computed(() => {
    if (!foodDetail.value) return false;
    return userStore.isCollected('food', foodDetail.value.id);
});

const handleAddToCollection = async () => {
  if (!foodDetail.value || isAlreadyCollected.value) return;
  addingToCollection.value = true;
  try {
      // Use a generic placeholder for food collections for now
      const placeholderImageUrl = `https://via.placeholder.com/150/90EE90/FFFFFF?text=Food`;
      const collectionData = {
          collectedId: Number(foodDetail.value.id), // Ensure ID is number
          type: 'food' as const, 
          title: foodDetail.value.name,
          // imageUrl: foodDetail.value.coverImage, // Don't use the local import path
          imageUrl: placeholderImageUrl, // Use placeholder URL
          link: `/food/${foodDetail.value.id}`
      };
      userStore.addCollection(collectionData);
  } catch (error) {
      console.error("Error adding food to collection:", error);
  } finally {
      addingToCollection.value = false;
  }
};

const goBack = () => {
    router.back();
};

const goToRestaurant = (restaurantId?: number) => {
    if (restaurantId) {
        router.push(`/restaurant/${restaurantId}`);
    }
};

const generatePlaceholderDescription = (name: string): string => {
    return `这道【${name}】风味独特，选用上等食材精心烹制而成，口感丰富，是本店的招牌菜之一，深受食客喜爱。无论是家庭聚餐还是朋友小酌，都是不错的选择。`;
};

const generatePlaceholderDetails = (name: string): string => {
    const details = [
        `【${name}】的历史悠久，起源于...`,
        `制作【${name}】的关键在于火候的掌握和调料的搭配...`,
        `品尝【${name}】时，建议搭配...`,
        `这道菜不仅美味，还富含...等营养成分。`,
        `许多美食家都对【${name}】赞不绝口...`
    ];
    return details[Math.floor(Math.random() * details.length)] + '\n\n' +
        `关于【${name}】的更多故事和做法，可以在我们的社区中找到。探索不同的风味，分享你的美食体验！我们致力于为您带来最地道、最美味的佳肴。`;
};

console.log('Food ID from route params:', props.id);

onMounted(async () => {
    if (!userStore.hasFetchedCollections) {
        await userStore.fetchCollections();
    }
    
    loading.value = true;
    const foodId = parseInt(props.id, 10);
    if (isNaN(foodId)) {
        console.error('Invalid Food ID:', props.id);
        loading.value = false;
        return;
    }
    try {
        const foundFood = await findFoodById(foodId);
        foodDetail.value = foundFood;
        if (!foundFood) {
            console.warn(`Food with ID ${foodId} not found.`);
        }
    } catch (error) {
        console.error('Error fetching food detail:', error);
    } finally {
        loading.value = false;
    }
});

</script>

<style scoped lang="scss">
.food-detail-view {
    max-width: 1000px;
    margin: 20px auto;
    padding: 20px;
}

.el-page-header {
    margin-bottom: 20px;
}

.page-title {
    font-weight: 500;
}

.food-image {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 20px;
}

h1 {
    font-size: 28px;
    margin-bottom: 10px;
}

.rating-display {
    margin-bottom: 15px;

    :deep(.el-rate__icon),
    :deep(.el-rate__text) {
        font-size: 18px;
    }
}

.price-display {
    font-size: 16px;
    color: var(--el-text-color-secondary);
    margin-bottom: 15px;

    span {
        font-size: 22px;
        font-weight: bold;
        color: var(--el-color-error);
        margin-left: 5px;
    }
}

.tags-display {
    margin-bottom: 20px;
}

.description-display {
    font-size: 15px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
    margin-bottom: 20px;
}

.restaurant-link {
    margin-top: 20px;

    .el-link {
        font-size: 15px;
    }
}

.placeholder-text {
    font-size: 14px;
    line-height: 1.8;
    color: var(--el-text-color-secondary);
    white-space: pre-wrap;
}

.el-divider {
    margin: 30px 0;
}

.action-buttons {
    margin-top: 25px;
    padding-top: 15px;
    border-top: 1px solid var(--el-border-color-lighter);
}
</style>