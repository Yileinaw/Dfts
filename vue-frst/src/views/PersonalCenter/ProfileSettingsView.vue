<template>
  <div class="profile-settings-view">
    <h2>个人资料设置</h2>
    <div v-if="userStore.currentUser" class="settings-content">
      
      <!-- Current Avatar - Make it clickable -->
      <div class="setting-item current-avatar">
        <label>当前头像</label>
        <div class="avatar-container" @click="openAvatarDialog">
          <el-avatar :size="100" :src="userStore.resolvedAvatarUrl" /> 
          <div class="edit-icon-overlay">
             <el-icon><EditPen /></el-icon>
          </div>
        </div>
      </div>

      <!-- Avatar Upload - Keep outside modal for simplicity -->
      <div class="setting-item avatar-upload">
         <label>上传新头像</label>
         <el-upload
            class="avatar-uploader"
            :action="uploadUrl" 
            :show-file-list="false"
            :headers="uploadHeaders"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            name="avatar" 
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 jpg/png 文件，且不超过 5MB
              </div>
            </template>
          </el-upload>
      </div>
      
      <!-- Profile Form -->
      <div class="setting-item profile-form">
         <label>修改昵称</label>
         <el-input v-model="editableName" placeholder="输入新昵称"></el-input>
         <el-button type="primary" @click="updateName" :loading="isUpdatingName">保存昵称</el-button>
      </div>

    </div>
    <el-empty v-else description="无法加载用户信息" />

    <!-- Avatar Edit Dialog -->
    <el-dialog v-model="avatarDialogVisible" title="修改头像" width="500px" class="avatar-dialog">
        <div class="dialog-content">
            <!-- Preview of pending avatar -->
            <div class="preview-section">
                <label>预览</label>
                <el-avatar :size="120" :src="resolveStaticAssetUrl(pendingAvatarUrl)" />
            </div>

            <!-- Default Avatars Selection - Moved inside dialog -->
            <div class="setting-item default-avatars">
                <label>选择预设头像</label>
                <div class="avatar-options">
                    <el-avatar 
                    v-for="preset in defaultAvatars" 
                    :key="preset" 
                    :size="60" 
                    :src="resolveStaticAssetUrl(preset)" 
                    @click="pendingAvatarUrl = preset"  
                    class="preset-avatar"
                    :class="{ 'selected': pendingAvatarUrl === preset }"
                    />
                    <el-button text @click="pendingAvatarUrl = null" class="preset-avatar remove-avatar-btn" :class="{ 'selected': pendingAvatarUrl === null }">移除头像</el-button>
                </div>
            </div>
        </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="avatarDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAvatarSelection">保存</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/modules/user';
import { ElAvatar, ElUpload, ElButton, ElInput, ElMessage, ElEmpty, ElDialog } from 'element-plus';
import type { UploadProps, UploadRawFile } from 'element-plus'
import { UserService } from '@/services/UserService';
import http from '@/http'; // 导入 http 实例以获取 baseUrl
import { Edit, EditPen } from '@element-plus/icons-vue';

const userStore = useUserStore();

const editableName = ref('');
const isUpdatingName = ref(false);
const avatarDialogVisible = ref(false);
const pendingAvatarUrl = ref<string | null>(null);

// --- 使用您截图中的实际文件名 --- 
const defaultAvatars = ref([
    '/avatars/defaults/1.jpg', 
    '/avatars/defaults/2.jpg',
    '/avatars/defaults/3.jpg',
    '/avatars/defaults/4.jpg',
    '/avatars/defaults/5.jpg',
    // ... 根据您实际拥有的文件添加更多 ...
]);
// --- 结束修改 ---

// 计算上传 URL
const uploadUrl = computed(() => UserService.getUploadAvatarUrl());
        
// 获取上传请求头（携带 token）
const uploadHeaders = computed(() => ({
     Authorization: `Bearer ${userStore.token}`
}));

// Function to resolve static asset URLs (like presets or uploaded avatars)
const resolveStaticAssetUrl = (url: string | null | undefined): string => {
    console.log(`[resolveStaticAssetUrl] Resolving URL: ${url}`);
    if (!url) {
        console.log('[resolveStaticAssetUrl] URL is null or undefined, returning empty string.');
        return ''; 
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
        console.log('[resolveStaticAssetUrl] URL is absolute, returning as is:', url);
        return url;
    }
    
    const apiBaseUrl = http.defaults.baseURL || '';
    const staticBaseUrl = apiBaseUrl.replace(/\/api\/?$/, ''); 
    const relativeUrl = url.startsWith('/') ? url : '/' + url;
    const finalUrl = `${staticBaseUrl}${relativeUrl}`;
    console.log(`[resolveStaticAssetUrl] Original: ${url}, API Base: ${apiBaseUrl}, Static Base: ${staticBaseUrl}, Final URL: ${finalUrl}`);
    return finalUrl;
};

// 挂载时和用户信息变化时同步输入框名字
const syncName = () => {
    if (userStore.currentUser) {
        editableName.value = userStore.currentUser.name || '';
    }
};

onMounted(syncName);
watch(() => userStore.currentUser?.name, syncName); // Watch for changes in user name

// Watch the resolved avatar URL from the store for debugging
watch(() => userStore.resolvedAvatarUrl, (newUrl) => {
  console.log('[ProfileSettingsView] Resolved Avatar URL in Store:', newUrl);
}, { immediate: true });

// 上传成功处理
const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  console.log('[ProfileSettingsView] Avatar Upload Success Response:', response);
  if (response && response.avatarUrl) {
    userStore.updateAvatarUrl(response.avatarUrl);
    ElMessage.success('头像上传成功!');
  } else {
     ElMessage.error(response?.message || '头像上传失败，响应无效');
  }
}

// 上传前检查
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  const isImage = rawFile.type.startsWith('image/');
  const isLt5M = rawFile.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!');
  }
  return isImage && isLt5M;
}

// Open avatar dialog
const openAvatarDialog = () => {
  pendingAvatarUrl.value = userStore.currentUser?.avatarUrl || null;
  avatarDialogVisible.value = true;
};

// Save avatar selection
const saveAvatarSelection = async () => {
  const currentStoredUrl = userStore.currentUser?.avatarUrl || null;
  
  if (pendingAvatarUrl.value === currentStoredUrl) {
    avatarDialogVisible.value = false;
    return;
  }
  
  console.log('[ProfileSettingsView] Saving avatar selection:', pendingAvatarUrl.value);
  try {
    const response = await UserService.updateUserProfile({ avatarUrl: pendingAvatarUrl.value });
    console.log('[ProfileSettingsView] Update Profile Response (Dialog Save):', response);
    userStore.updateUserInfo(response.user);
    avatarDialogVisible.value = false;
    ElMessage.success('头像更新成功!');
  } catch (error: any) {
     console.error('[ProfileSettingsView] Error saving avatar selection:', error);
     ElMessage.error(error.response?.data?.message || '头像更新失败');
  }
};

// Update name
const updateName = async () => {
    if (!userStore.currentUser || !editableName.value.trim() || editableName.value === userStore.currentUser.name) {
         return; 
    }
    isUpdatingName.value = true;
    try {
         const response = await UserService.updateUserProfile({ name: editableName.value });
         console.log('[ProfileSettingsView] Update Profile Response (Name):', response);
         userStore.updateUserInfo(response.user);
         ElMessage.success('昵称更新成功!');
     } catch (error: any) {
         console.error('[ProfileSettingsView] Error updating name:', error);
         ElMessage.error(error.response?.data?.message || '昵称更新失败');
     } finally {
        isUpdatingName.value = false;
     }
 };

</script>

<style scoped>
.profile-settings-view {
  padding: 20px;
}

h2 {
    margin-bottom: 30px;
    text-align: center;
    color: #303133;
}

.settings-content {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 30px; /* Spacing between setting items */
}

.setting-item {
    display: flex;
    flex-direction: column; /* Stack label and control vertically */
    gap: 10px; /* Spacing between label and control */
}

.setting-item label {
    font-weight: bold;
    color: #606266;
    margin-bottom: 5px; /* Space below label */
}

.current-avatar .el-avatar {
    border: 1px solid #dcdfe6;
}

.avatar-options {
  display: flex;
  flex-wrap: wrap; 
  gap: 15px; 
  align-items: center;
}

.preset-avatar {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 50%;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.preset-avatar:hover {
  border-color: #a0cfff; /* Lighter blue on hover */
}

 .preset-avatar.selected {
     border-color: #409eff;
     box-shadow: 0 0 5px rgba(64, 158, 255, 0.5);
 }

 /* Style for the remove button */
 .remove-avatar-btn {
    border-radius: 4px;
    height: 64px; 
    width: 64px;
    border: 1px dashed #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 12px;
    background-color: #f9f9f9;
 }

 .remove-avatar-btn:hover {
     border-color: #c0c4cc;
     color: #606266;
     background-color: #f4f4f5;
 }


 .profile-form .el-input {
    margin-bottom: 10px;
    /* max-width: 300px; Keep it full width within the container */
 }

 .avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-upload__tip {
    font-size: 12px;
    color: #909399;
    margin-top: 7px;
}

/* Ensure button is next to input */
.profile-form {
    display: flex;
    flex-direction: column; /* Stack label, input, button */
}

.profile-form .el-input + .el-button {
    margin-top: 10px; /* Add space between input and button */
    align-self: flex-start; /* Align button to the start */
}

.avatar-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
  width: 100px;
  height: 100px;
}

/* New Edit Icon Overlay */
.edit-icon-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6); /* Darker background for icon visibility */
  color: white;
  border-radius: 50%;
  padding: 5px; /* Adjust padding */
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0; /* Hidden by default */
  transition: opacity 0.3s ease;
  pointer-events: none; /* Pass clicks through by default */
  line-height: 1; /* Prevent extra space */
}

.avatar-container:hover .edit-icon-overlay {
  opacity: 1; /* Show on hover */
  pointer-events: auto; /* Make clickable on hover */
}

.edit-icon-overlay .el-icon {
  font-size: 16px; /* Adjust icon size */
}

.avatar-dialog {
  /* Add any necessary styles for the dialog */
}

.dialog-content {
  /* Add any necessary styles for the dialog content */
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  min-height: 150px;
}

.preview-section label {
  font-weight: bold;
  color: #606266;
  margin-bottom: 10px;
}

.avatar-dialog .default-avatars label {
  text-align: center;
  width: 100%;
  margin-bottom: 15px;
}

.avatar-dialog .avatar-options {
  justify-content: center;
}

.dialog-footer {
  margin-top: 10px;
}
</style> 