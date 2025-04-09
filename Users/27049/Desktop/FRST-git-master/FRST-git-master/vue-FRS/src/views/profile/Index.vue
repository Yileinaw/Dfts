<template>
  <div class="profile-view">
    <h1>个人中心</h1>

    <el-tabs v-model="activeTab" class="profile-tabs">
      <el-tab-pane label="基本信息" name="info">
        <el-card shadow="never" class="profile-card">
          <div class="profile-header">
            <div class="avatar-uploader">
              <el-avatar :size="100" :src="currentAvatarPreview || defaultAvatar" class="profile-avatar" />
              <el-upload ref="uploadRef" class="avatar-upload-trigger" action="#" :show-file-list="false"
                :auto-upload="false" :limit="1" :on-change="handleAvatarChange" accept="image/*">
                <el-button type="primary" link :icon="Edit">更换头像</el-button>
              </el-upload>
            </div>
            <div class="user-info">
              <p class="username">{{ userStore.userInfo?.username || '用户名加载中...' }}</p>
              <!-- 可以添加其他用户信息，如邮箱、简介等 -->
              <el-button v-if="newAvatarUrl" type="primary" @click="saveAvatar" :loading="isSavingAvatar"
                size="small">保存头像</el-button>
              <el-button v-if="newAvatarUrl" @click="cancelAvatarChange" size="small">取消</el-button>
            </div>
          </div>

          <el-divider />

          <div class="profile-actions">
            <el-menu :default-active="'1'" class="profile-menu" mode="vertical">
              <el-menu-item index="/profile-settings" @click="goTo('/profile/settings')">
                <el-icon>
                  <Setting />
                </el-icon>
                <span>账户设置</span>
              </el-menu-item>
              <el-menu-item index="logout" @click="handleLogout">
                <el-icon>
                  <SwitchButton />
                </el-icon>
                <span>退出登录</span>
              </el-menu-item>
            </el-menu>
          </div>

        </el-card>
      </el-tab-pane>

      <el-tab-pane label="我的收藏" name="collections" class="collections-tab-pane">
         <div v-if="isLoadingCollections">
             <el-skeleton :rows="5" animated />
         </div>
         <div v-else>
             <!-- Food Collections -->
             <div class="collection-group">
                 <h3 class="collection-group-title">食物收藏</h3>
                 <collection-list 
                   v-if="foodCollections.length > 0"
                   :items="foodCollections" 
                   @remove="handleRemoveCollection"
                  />
                 <el-empty v-else description="暂无食物收藏"></el-empty>
            </div>

            <el-divider v-if="foodCollections.length > 0 && postCollections.length > 0" />

             <!-- Post Collections -->
            <div class="collection-group">
                 <h3 class="collection-group-title">帖子收藏</h3>
                 <collection-list 
                   v-if="postCollections.length > 0"
                   :items="postCollections" 
                   @remove="handleRemoveCollection"
                  />
                 <el-empty v-else description="暂无帖子收藏"></el-empty>
             </div>
             
             <!-- Overall Empty State if both are empty -->
             <el-empty description="您还没有任何收藏哦，快去发现喜欢的内容吧！" 
               v-if="foodCollections.length === 0 && postCollections.length === 0">
             </el-empty>

         </div>
      </el-tab-pane>

      <!-- Add more tabs here if needed -->

    </el-tabs>

    <!-- 可以在下面添加更多个人中心的内容，例如我的帖子、修改资料表单等 -->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { useAuthStore } from '@/store/modules/auth'; // Need auth store for logout
import { ElCard, ElAvatar, ElButton, ElUpload, ElIcon, ElMessage, ElMessageBox, ElDivider, ElMenu, ElMenuItem, ElTabs, ElTabPane, ElSkeleton, ElEmpty } from 'element-plus';
import type { UploadInstance, UploadProps, UploadFile, UploadRawFile } from 'element-plus';
import { Edit, Star, Setting, SwitchButton } from '@element-plus/icons-vue';
import defaultAvatar from '@/assets/images/default-avatar.png';
import CollectionList from '@/components/business/CollectionList.vue'; // Import the new component

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const uploadRef = ref<UploadInstance>();

const activeTab = ref('info'); // Default to info tab
const newAvatarUrl = ref<string | null>(null); // Store temporary Data URL for new avatar
const isSavingAvatar = ref(false);
const isLoadingCollections = ref(false);

// Computed property for avatar preview
const currentAvatarPreview = computed(() => {
  return newAvatarUrl.value || userStore.userInfo?.avatar || defaultAvatar;
});

// Handle avatar selection
const handleAvatarChange: UploadProps['onChange'] = (uploadFile: UploadFile) => {
  if (uploadFile.status === 'ready' && uploadFile.raw) {
    // Basic validation (optional but recommended)
    const isLt2M = uploadFile.size! / 1024 / 1024 < 2;
    if (!isLt2M) {
      ElMessage.error('头像图片大小不能超过 2MB!');
      uploadRef.value?.clearFiles(); // Clear the invalid file
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        newAvatarUrl.value = e.target.result;
        console.log('New avatar preview ready.');
      } else {
        ElMessage.error('图片读取失败');
        newAvatarUrl.value = null;
        uploadRef.value?.clearFiles();
      }
    };
    reader.onerror = () => {
      ElMessage.error('图片读取错误');
      newAvatarUrl.value = null;
      uploadRef.value?.clearFiles();
    };
    reader.readAsDataURL(uploadFile.raw);
  } else if (uploadFile.status !== 'ready') {
    // Handle other statuses if needed, e.g., upload errors if auto-upload was true
    // Clear temporary url if upload failed or was removed implicitly
    if (uploadFile.status === 'fail') {
      newAvatarUrl.value = null;
    }
  }
};

// Save the new avatar
const saveAvatar = async () => {
  if (!newAvatarUrl.value) return;
  isSavingAvatar.value = true;
  try {
    // Simulate potential API call delay if needed in future
    // await new Promise(resolve => setTimeout(resolve, 500)); 
    userStore.updateAvatar(newAvatarUrl.value); // Update store (which saves to LS)
    ElMessage.success('头像更新成功!');
    newAvatarUrl.value = null; // Clear temporary URL
    uploadRef.value?.clearFiles(); // Clear the upload component
  } catch (error) { // Although updateAvatar doesn't throw now, keep for future
    console.error("Error saving avatar:", error);
    ElMessage.error('头像保存失败');
  } finally {
    isSavingAvatar.value = false;
  }
};

// Cancel avatar change
const cancelAvatarChange = () => {
  newAvatarUrl.value = null;
  uploadRef.value?.clearFiles();
};

// --- Collection Methods ---
const fetchMyCollections = async () => {
  isLoadingCollections.value = true;
  try {
    await userStore.fetchCollections();
  } catch (error) {
    // Error message is handled within the store action
    console.error("Error caught in component while fetching collections:", error);
  } finally {
    isLoadingCollections.value = false;
  }
};

const handleRemoveCollection = async (collectionId: number) => {
  // Optional: Add confirmation dialog
  try {
    await ElMessageBox.confirm('确定要取消收藏吗?', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    // If confirmed, proceed with removal
    await userStore.removeCollection(collectionId);
    // No need to manually refresh list, store update is reactive
  } catch (error) {
    // If user clicked cancel or API failed (handled in store)
    if (error !== 'cancel') { // Don't show message if user just cancelled
      console.log('Remove collection cancelled or failed');
    }
  }
};

// --- Add Computed Properties for Collections ---
const foodCollections = computed(() => 
  userStore.collections.filter(item => item.type === 'food')
);

const postCollections = computed(() => 
  userStore.collections.filter(item => item.type === 'post')
);
// ---------------------------------------------

// --- Lifecycle Hook ---
onMounted(() => {
  // Fetch collections when the component mounts
  fetchMyCollections();
});

// Logout logic (moved from DefaultLayout)
const handleLogout = async () => {
  await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).catch(() => { return Promise.reject(); }); // Prevent further execution if cancelled

  try {
    // await apiLogout(); // Call backend logout API if available
  } catch (error) {
    console.error('Logout API failed:', error);
  }

  authStore.clearAuth();
  userStore.clearUser();
  ElMessage.success('已退出登录');
  router.push('/auth/login');
};

// Navigation helper
const goTo = (path: string) => {
  if (path === '/profile/settings') {
    // Navigate to settings page
    router.push(path);
  } else {
    // Handle other potential menu clicks if needed
  }
};

</script>

<style scoped lang="scss">
.profile-view {
  max-width: 960px; // Slightly wider for tabs
  margin: 20px auto;
}

.profile-tabs {
  margin-top: 20px;
}

.profile-card {
  padding: 20px;
  // Remove margin-bottom if profile-card is now inside a tab pane
  // margin-bottom: 20px; 
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 30px; // Space between avatar and user info
  margin-bottom: 20px;
}

.avatar-uploader {
  position: relative;
  text-align: center;

  .profile-avatar {
    margin-bottom: 10px;
    cursor: default; // Default cursor for avatar itself
  }

  .avatar-upload-trigger {
    // Position the trigger text below or allow default ElUpload styling
    display: block; // Make button take full width if needed
  }
}

.user-info {
  .username {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 15px;
  }

  // Add styles for other info as needed
}

.profile-actions {
  margin-top: 20px;

  .profile-menu {
    border-right: none; // Remove default menu border

    .el-menu-item {
      height: 50px;
      line-height: 50px;

      .el-icon {
        margin-right: 10px;
      }

      &.is-disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

// Styles for the collections tab content
:deep(.el-tabs__content) {
  padding-top: 15px; // Add some space below the tab headers
}

.collections-tab-pane {
  // Style the container for the collection groups
}

.collection-group {
  margin-bottom: 30px; // Space between food and post sections
  &:last-child {
    margin-bottom: 0;
  }
}

.collection-group-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-extralight);
}
</style>