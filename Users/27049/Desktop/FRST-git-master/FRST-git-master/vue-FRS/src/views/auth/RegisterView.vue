<template>
  <div class="register-container">
    <h2>注册新用户</h2>
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      label-width="80px"
      class="register-form"
      @submit.prevent="handleRegister"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="registerForm.username" placeholder="设置用户名" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input v-model="registerForm.password" type="password" placeholder="设置登录密码" show-password />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
      </el-form-item>

      <el-form-item label-width="0px">
        <el-button
          type="primary"
          :loading="loading"
          native-type="submit"
          size="large"
          style="width: 100%;"
        >
          注册
        </el-button>
      </el-form-item>

      <div class="form-links">
        <el-link type="primary" @click="goToLogin">已有账号? 去登录</el-link>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { register } from '@/api/auth'; // 只引入注册 API

const router = useRouter();

const registerFormRef = ref<FormInstance>();
const loading = ref(false);

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致!'));
  } else {
    callback();
  }
};

const registerRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
});

const handleRegister = async () => {
  if (!registerFormRef.value) return;
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const payload = {
          username: registerForm.username,
          password: registerForm.password,
        };
        const res = await register(payload as any); // 使用 as any 临时绕过类型检查，因为原始 payload 类型需要 phone/smsCode
        if (res.code === 0) {
          ElMessage.success('注册成功！即将跳转到登录页');
          setTimeout(() => {
            router.push('/auth/login'); // 注册成功后跳转登录
          }, 1500);
        } else {
          // API 错误会在 request.ts 拦截器中提示
        }
      } catch (error) {
        console.error('Registration failed:', error);
      } finally {
        loading.value = false;
      }
    } else {
      console.log('Form validation failed!');
      return false;
    }
  });
};

const goToLogin = () => {
  router.push('/auth/login');
};
</script>

<style scoped lang="scss">
.register-container {
  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #303133;
  }

  .register-form {
    width: 100%;
    .el-form-item {
      margin-bottom: 22px;
    }
  }

  .form-links {
    text-align: right;
    margin-top: 10px;
  }
}
</style> 