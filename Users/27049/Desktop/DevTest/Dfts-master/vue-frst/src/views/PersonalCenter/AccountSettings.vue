<template>
  <el-card class="account-settings-card">
    <template #header>
      <div class="card-header">
        <span>账号安全设置</span>
      </div>
    </template>

    <el-form 
      ref="passwordFormRef" 
      :model="passwordForm" 
      :rules="passwordRules" 
      label-width="100px"
      label-position="top"
      size="large"
      status-icon
      class="password-form"
    >
      <h4>修改密码</h4>
      <el-form-item label="当前密码" prop="currentPassword">
        <el-input type="password" v-model="passwordForm.currentPassword" show-password :prefix-icon="Lock"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input type="password" v-model="passwordForm.newPassword" show-password :prefix-icon="Lock"></el-input>
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input type="password" v-model="passwordForm.confirmPassword" show-password :prefix-icon="Lock"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitPasswordChange" :loading="loading">确认修改</el-button>
        <el-button @click="resetPasswordForm">重置</el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <!-- TODO: 添加其他设置，如绑定手机号、社交账号关联等 -->
    <!-- 
    <h4>账号安全</h4>
    ... 
    -->

  </el-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// import { useUserStore } from '@/store/modules/user' // 之后引入

// const userStore = useUserStore() // 之后启用
const passwordFormRef = ref(null) // 表单引用
const loading = ref(false)

// --- 修改密码逻辑 ---
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 确认密码验证器
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}

// 密码表单校验规则
const passwordRules = reactive({
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

// 提交密码修改
const submitPasswordChange = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      console.log('Submitting password change:', passwordForm)
      try {
        // TODO: Call actual API, e.g., userStore.changePassword({...})
        await new Promise(resolve => setTimeout(resolve, 500))
        ElMessage.success('密码修改成功')
        resetPasswordForm()
      } catch (error) {
         console.error('Password change failed:', error)
        // Use specific error message from API if available
        ElMessage.error('密码修改失败，请检查当前密码是否正确') 
      } finally {
         loading.value = false
      }
    } else {
      console.log('Password form validation failed')
      return false
    }
  })
}

// 重置密码表单
const resetPasswordForm = () => {
  if (!passwordFormRef.value) return
  passwordFormRef.value.resetFields()
}

// --- 其他设置逻辑 (待添加) ---

</script>

<style scoped lang="scss">
.account-settings-card {
  // Style the card itself if needed
}

.card-header {
  text-align: center;
  font-size: 1.2rem; 
  font-weight: 600;
  padding-bottom: 15px; 
  border-bottom: 1px solid var(--el-border-color-lighter); 
  margin-bottom: 20px;
}

.password-form {
  max-width: 500px;
  margin: 0 auto; // Center the form within the card

  h4 {
    text-align: left; // Align subtitle
    margin-bottom: 25px;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .el-form-item {
    margin-bottom: 25px; // Adjust spacing
  }

  // Center buttons
  .el-form-item:last-child {
    :deep(.el-form-item__content) {
      justify-content: center;
    }
    .el-button {
      margin: 0 10px;
    }
  }
}

// Styles for potential future setting groups
.setting-group {
  margin-top: 30px;
}
</style> 