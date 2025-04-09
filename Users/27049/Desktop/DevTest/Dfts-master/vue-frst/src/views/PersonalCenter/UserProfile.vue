<template>
  <el-card class="user-profile-card">
    <template #header>
      <div class="card-header">
        <span>个人信息管理</span>
      </div>
    </template>

    <div class="profile-header">
      <el-avatar :size="100" :src="userStore.userAvatar || defaultAvatar" />
      <el-button type="primary" link class="change-avatar-btn">更换头像</el-button>
      <!-- TODO: Implement avatar upload functionality -->
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="info">
         <el-descriptions :column="1" border class="info-descriptions">
            <el-descriptions-item label="用户ID">{{ userStore.currentUser?.id || 'N/A' }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ userStore.currentUser?.nickname || 'N/A' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userStore.currentUser?.email || 'N/A' }}</el-descriptions-item>
            <!-- Add more user info fields if available -->
          </el-descriptions>
      </el-tab-pane>
      
      <el-tab-pane label="编辑资料" name="edit">
         <el-form :model="profileForm" label-width="80px" class="edit-form">
            <el-form-item label="昵称">
              <el-input v-model="profileForm.nickname"></el-input>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="profileForm.email" disabled></el-input>
            </el-form-item>
            <!-- Add more editable fields if needed -->
            <el-form-item>
              <el-button type="primary" @click="updateProfile" :loading="loading">保存修改</el-button>
            </el-form-item>
          </el-form>
      </el-tab-pane>
    </el-tabs>

  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/modules/user' // 引入 User Store
import defaultAvatar from '@/assets/images/default-avatar.png' // 引入默认头像
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const loading = ref(false)
const activeTab = ref('info') // Default to info tab

const profileForm = reactive({
  nickname: '',
  email: ''
})

// 在组件挂载时，用当前用户信息填充表单
onMounted(() => {
  if (userStore.currentUser) {
    profileForm.nickname = userStore.currentUser.nickname
    profileForm.email = userStore.currentUser.email
  }
})

// 更新个人信息 (模拟)
const updateProfile = async () => {
  loading.value = true
  console.log('Updating profile:', profileForm)
  try {
    // TODO: Call actual API to update profile, e.g., userStore.updateProfile({ nickname: profileForm.nickname })
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
    
    // Update store state after successful API call (assuming API returns updated info or we manually update)
    // This part needs adjustment based on actual API response/logic
     if (userStore.currentUser) { // Check if currentUser exists
        const updatedUserInfo = { ...userStore.currentUser, nickname: profileForm.nickname };
        userStore.setLoginInfo(userStore.token, updatedUserInfo); // Update store and localStorage
     }

    ElMessage.success('个人信息更新成功')
    activeTab.value = 'info' // Switch back to info tab after saving
  } catch (error) {
    console.error('Profile update failed:', error)
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.user-profile-card {
  // Card styles if needed, or rely on global card styles
}

.card-header {
   text-align: center;
   font-size: 1.2rem; // Adjust header size
   font-weight: 600;
   padding-bottom: 15px; // Add some space below header
   border-bottom: 1px solid var(--el-border-color-lighter); // Separator
   margin-bottom: 20px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;

  .el-avatar {
    margin-bottom: 15px;
    border: 2px solid var(--el-color-primary-light-5); // Add a border to avatar
  }
  .change-avatar-btn {
      font-size: 0.9rem;
  }
}

.el-tabs {
  // Style for tabs if needed
}

.info-descriptions {
  margin-top: 20px;
}

.edit-form {
  margin-top: 20px;
  max-width: 500px; // Limit form width
}
</style> 