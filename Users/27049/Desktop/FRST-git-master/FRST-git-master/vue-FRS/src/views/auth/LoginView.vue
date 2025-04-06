<template>
  <div class="login-container">
    <h2>登录美食推荐平台</h2>
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      label-width="0px"  class="login-form"
      @submit.prevent="handleLogin" 
    >
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="用户名/手机号/邮箱"
          size="large"
          prefix-icon="User"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="密码"
          size="large"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>

      <!-- 可以添加验证码输入框 -->
      <!-- <el-form-item prop="captcha"> ... </el-form-item> -->

      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          native-type="submit"
          size="large"
          style="width: 100%;"
        >
          登录
        </el-button>
      </el-form-item>

      <div class="form-links">
        <el-link type="primary" @click="goToRegister">立即注册</el-link>
        <el-link type="info">忘记密码?</el-link>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue'; // 引入图标
import { useAuthStore } from '@/store/modules/auth';
import { useUserStore } from '@/store/modules/user';
import { loginByPassword } from '@/api/auth'; // 引入登录 API

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
  loginType: 'password' as const, // 明确登录类型
});

const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名/手机号/邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码长度至少为6位', trigger: 'blur' }],
  // captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // -------- START: 模拟登录修改 --------
        console.log('模拟登录: 跳过 API 调用');

        // 1. 设置假的 Token
        const fakeToken = 'fake-local-dev-token-' + Date.now();
        authStore.setToken(fakeToken);
        console.log('模拟登录: 设置 Token ->', fakeToken);

        // 2. 设置假的用户信息 (可以根据需要自定义)
        const fakeUserInfo = {
          id: 999,
          username: loginForm.username || 'local-test-user',
          nickname: '本地测试用户',
          avatar: '', // 可以放一个默认头像 URL
          roles: ['user'], // 模拟用户角色
        };
        userStore.setUser(fakeUserInfo as any); // 使用 as any 绕过严格类型检查
        console.log('模拟登录: 设置用户信息 ->', fakeUserInfo);

        ElMessage.success('模拟登录成功!');
        router.push('/'); // 跳转到首页

        // -------- END: 模拟登录修改 --------

        /* -------- START: 原始 API 调用代码 (已注释) --------
        const res = await loginByPassword(loginForm); // 调用密码登录 API
        if (res.code === 0 && res.data) { // 登录成功
          authStore.setToken(res.data.token);
          userStore.setUser(res.data.userInfo);
          ElMessage.success('登录成功!');
          router.push('/'); // 跳转到首页
        } else {
          // API 报错已在 request.ts 中处理，这里可以不处理或根据需要细化
          // ElMessage.error(res.message || '登录失败');
        }
        -------- END: 原始 API 调用代码 -------- */

      } catch (error) {
        // 在模拟登录模式下，通常不会执行到这里，除非上面的代码出错
        console.error('模拟登录过程中发生错误:', error);
        ElMessage.error('模拟登录失败，请查看控制台');
      } finally {
        loading.value = false;
      }
    } else {
      console.log('表单校验失败!');
      return false;
    }
  });
};

const goToRegister = () => {
  router.push('/auth/register');
};
</script>

<style scoped lang="scss">
.login-container {
  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #303133;
  }

  .login-form {
    width: 100%;
  }

  .form-links {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
}
</style> 