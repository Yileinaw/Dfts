<template>
    <el-card :body-style="{ padding: '0px' }" shadow="hover" class="food-card" @click="goToDetailMaybe">
        <img :src="food.coverImage || defaultImage" class="image" :alt="food.name" @error="onImageError" />
        <div style="padding: 10px;">
            <span class="name">{{ food.name }}</span>
            <p class="description" v-if="food.description">{{ food.description }}</p>
            <div class="bottom">
                <el-rate v-if="food.rating !== undefined" :model-value="food.rating" disabled size="small"
                    text-color="#ff9900" score-template="{value}" />
                <span v-else class="no-rating">暂无评分</span>
                <span class="price" v-if="food.price">¥{{ food.price }}</span>
            </div>
            <div class="tags" v-if="food.tags?.length">
                <el-tag size="small" type="info" v-for="tag in food.tags" :key="tag"
                    style="margin-right: 4px; margin-bottom: 4px;">{{ tag }}</el-tag>
            </div>
            <div class="restaurant-info" v-if="food.restaurantName">
                <el-icon>
                    <Shop />
                </el-icon> <span @click.stop="goToRestaurantMaybe">{{ food.restaurantName }}</span>
            </div>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import type { FoodInfo } from '@/types/food'; // 引入美食类型
import { Shop } from '@element-plus/icons-vue'; // 引入 Shop 图标
import defaultImage from '@/assets/images/default-food.png'; // 假设有默认美食图片

const props = defineProps<{
    food: FoodInfo;
}>();

const router = useRouter();

// 点击卡片默认行为，可以跳转到美食详情页 (如果后续创建)
const goToDetailMaybe = () => {
    // console.log('Go to food detail for:', props.food.id);
    // router.push(`/food/${props.food.id}`);
};

// 点击餐厅名称跳转到餐厅详情页 (如果需要且有 ID)
const goToRestaurantMaybe = () => {
    if (props.food.restaurantId) {
        // console.log('Go to restaurant detail:', props.food.restaurantId);
        router.push(`/restaurant/${props.food.restaurantId}`);
    } else {
        // console.log('Restaurant ID not available for:', props.food.restaurantName);
    }
};

const onImageError = (event: Event) => {
    // 检查并确保 defaultImage 存在，如果不存在需要创建或替换为已有图片
    (event.target as HTMLImageElement).src = defaultImage;
};

</script>

<style scoped lang="scss">
.food-card {
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    border-radius: 8px;
    overflow: hidden;

    &:hover {
        transform: translateY(-5px);
        box-shadow: var(--el-box-shadow-lighter);
    }
}

.image {
    width: 100%;
    height: 180px; // 图片高度可以调整
    object-fit: cover;
    display: block;
    background-color: #f5f5f5; // 图片加载时背景色
}

.name {
    font-size: 16px;
    font-weight: bold;
    display: block;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.description {
    font-size: 13px;
    color: #666;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2; // 限制描述显示两行
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
    min-height: 2.8em; // 保证两行的高度
}

.bottom {
    margin-top: 8px;
    line-height: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #999;
    margin-bottom: 8px;

    .el-rate {
        height: auto;
        margin-right: 5px;

        :deep(.el-rate__icon) {
            // 调整星星大小
            font-size: 16px;
            margin-right: 1px;
        }
    }

    .no-rating {
        font-size: 12px;
    }

    .price {
        color: #ff6347; // Tomato color
        font-weight: bold;
        font-size: 15px;
    }
}

.tags {
    margin-top: 8px;
    line-height: 1.5;
}

.restaurant-info {
    font-size: 12px;
    color: #999;
    margin-top: 10px;
    display: flex;
    align-items: center;
    border-top: 1px dashed #eee;
    padding-top: 8px;

    .el-icon {
        margin-right: 4px;
        font-size: 14px;
    }

    span {
        cursor: pointer;

        &:hover {
            color: var(--el-color-primary);
        }
    }
}
</style>