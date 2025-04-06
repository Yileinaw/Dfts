<template>
    <div class="collection-list">
        <el-empty v-if="!items || items.length === 0" description="暂无收藏记录" />
        <div v-else class="collections-grid">
            <el-card v-for="item in items" :key="item.id" shadow="hover" class="collection-card">
                <div class="card-content">
                    <router-link :to="item.link" class="image-link">
                        <el-image :src="item.imageUrl" fit="cover" class="collection-image">
                            <template #placeholder>
                                <div class="image-slot image-slot-placeholder">
                                   <el-icon><Loading /></el-icon> 
                                   <span>加载中...</span>
                                </div>
                            </template>
                            <template #error>
                                <div class="image-slot image-slot-error">
                                    <el-icon><Picture /></el-icon>
                                    <span>加载失败</span>
                                </div>
                            </template>
                        </el-image>
                    </router-link>
                    <div class="item-details">
                        <router-link :to="item.link" class="title-link">
                            <h4 class="item-title">{{ item.title }}</h4>
                        </router-link>
                        <div class="item-meta">
                            <el-tag size="small" :type="item.type === 'post' ? 'primary' : 'success'" effect="light">
                                {{ item.type === 'post' ? '帖子' : '食物' }}
                            </el-tag>
                            <span class="collected-time">收藏于 {{ formatRelativeTime(item.collectedAt) }}</span>
                        </div>
                        <el-button type="danger" link :icon="Delete" size="small" class="remove-button"
                            @click="handleRemove(item.id)">
                            取消收藏
                        </el-button>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { ElCard, ElEmpty, ElImage, ElTag, ElButton, ElIcon } from 'element-plus';
import { Picture, Delete, Loading } from '@element-plus/icons-vue';
import { RouterLink } from 'vue-router';
import type { CollectionItem } from '@/types/collection';
import { formatRelativeTime } from '@/utils/timeFormatter.ts';

interface Props {
    items: CollectionItem[];
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'remove', id: number): void }>();

const handleRemove = (id: number) => {
    emit('remove', id);
};
</script>

<style scoped lang="scss">
.collection-list {
    margin-top: 20px;
}

.collections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.collection-card {
    :deep(.el-card__body) {
        padding: 0; // Remove default padding to make image flush
    }
}

.card-content {
    display: flex;
    flex-direction: column;
}

.image-link {
    display: block;
    line-height: 0; // Prevent extra space below image
}

.collection-image {
    width: 100%;
    height: 180px; // Fixed height for images
    display: block;
}

.image-slot {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 14px;
    
    .el-icon {
        font-size: 30px;
        margin-bottom: 8px;
    }
    span {
       font-size: 12px;
    }
}

.image-slot-error {
  // background: var(--el-color-danger-light-9);
}

.item-details {
    padding: 15px;
}

.title-link {
    text-decoration: none;
    color: inherit;

    &:hover {
        color: var(--el-color-primary);
    }
}

.item-title {
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 10px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 10px;
}

.collected-time {
    margin-left: 10px;
}

.remove-button {
    padding: 0; // Remove extra padding around link button
}
</style>