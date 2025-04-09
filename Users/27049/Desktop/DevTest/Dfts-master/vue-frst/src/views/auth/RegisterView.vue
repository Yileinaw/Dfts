<template>
  <div class="register-view">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <span>新用户注册</span>
        </div>
      </template>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-position="top"
        size="large"
        status-icon
        @keyup.enter="submitRegister"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="registerForm.nickname"
            placeholder="请输入昵称"
            :prefix-icon="User" 
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            :prefix-icon="Message" 
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="registerForm.password"
            placeholder="请输入至少 6 位密码"
            show-password
            :prefix-icon="Lock"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            type="password"
            v-model="registerForm.confirmPassword"
            placeholder="请再次输入密码"
            show-password
            :prefix-icon="Lock"
          ></el-input>
        </el-form-item>
        <el-form-item class="register-btn-item">
          <el-button type="primary" @click="submitRegister" :loading="loading" class="register-button">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="extra-links">
         <el-link type="primary" :underline="false" @click="goToLogin">已有账号？直接登录</el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { AuthService } from '@/services/AuthService';

const router = useRouter()
const userStore = useUserStore()
const registerFormRef = ref<FormInstance | null>(null);
const loading = ref(false)

const registerForm = reactive({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 邮箱校验
const validateEmail = (rule: any, value: any, callback: any) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  if (!value) {
    return callback(new Error('请输入邮箱地址'))
  }
  if (!emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

// 确认密码校验
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 校验规则
const registerRules = reactive<FormRules>({
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

// 提交注册
const submitRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
         // 直接调用 AuthService.register
        await AuthService.register({
          name: registerForm.nickname,
          email: registerForm.email,
          password: registerForm.password
        });

        ElMessage.success('注册成功，请登录');
        // 注册成功后跳转到登录页
        router.push('/login');
      } catch (error: any) {
        let errorMessage = '注册失败，请稍后再试';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        ElMessage.error(`注册失败: ${errorMessage}`);
      } finally {
        loading.value = false
      }
    } else {
      console.log('注册表单校验失败')
    }
  })
}

// 跳转登录
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped lang="scss">
.register-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px 0;
  background-color: #f0f2f5;
}

.register-card {
  width: 450px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.card-header {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.el-form {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .register-btn-item {
     margin-bottom: 10px;
    .el-form-item__content {
       justify-content: center;
    }
    .register-button {
      width: 100%;
    }
  }
}

.extra-links {
  margin-top: 10px;
  text-align: center;
  .el-link {
    font-size: 0.9rem;
  }
}
</style> 