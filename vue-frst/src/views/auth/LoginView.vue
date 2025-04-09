<template>
  <div class="login-view">
    <el-card class="login-card">
      <template #header>
        <!-- TODO: Add logo? -->
        <div class="card-header">
          <!-- TODO: Add logo? -->
          <span>用户登录</span>
        </div>
      </template>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        size="large"
        status-icon
        @keyup.enter="submitLogin"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱"
            :prefix-icon="User"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
          ></el-input>
        </el-form-item>
        <el-form-item class="login-btn-item">
          <el-button type="primary" @click="submitLogin" :loading="loading" class="login-button">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="extra-links">
        <el-link type="primary" :underline="false" @click="goToRegister">没有账号？立即注册</el-link>
        <!-- TODO: Add forgot password link? -->
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { AuthService } from '@/services/AuthService'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<FormInstance | null>(null)
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
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

// 校验规则
const loginRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 位', trigger: 'blur' },
  ]
})

// 提交登录
const submitLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        // 直接调用 AuthService.login
        const response = await AuthService.login({
          email: loginForm.email,
          password: loginForm.password
        });

        // 登录成功，处理返回的数据
        const { token, user } = response;

        // 调用 Pinia Store 来存储 token 和用户信息
        userStore.setToken(token); // 假设 store 有 setToken 方法
        userStore.setUser(user);   // 假设 store 有 setUser 方法

        ElMessage.success('登录成功');
        // 登录成功后跳转到首页
        router.push('/');
      } catch (error: any) {
        let errorMessage = '登录失败，请稍后再试';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        ElMessage.error(`登录失败: ${errorMessage}`);
      } finally {
        loading.value = false
      }
    } else {
      console.log('登录表单校验失败')
    }
  })
}

// 跳转注册
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped lang="scss">
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  width: 400px;
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
    margin-bottom: 25px;
  }

  .login-btn-item {
     margin-bottom: 15px;
    .el-form-item__content {
       justify-content: center;
    }
    .login-button {
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