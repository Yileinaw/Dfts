<template>
  <div class="account-security">
    <el-descriptions title="安全信息" :column="1" border>
      <el-descriptions-item label="登录密码">
        <el-link type="primary" @click="showChangePasswordDialog = true">修改密码</el-link>
      </el-descriptions-item>
      <el-descriptions-item label="绑定手机">
        <span v-if="userInfo?.phone">{{ userInfo.phone }}</span>
        <span v-else>未绑定</span>
        <el-link type="primary" style="margin-left: 10px;" @click="showBindPhoneDialog = true">
          {{ userInfo?.phone ? '换绑' : '绑定' }}
        </el-link>
        <!-- 可以添加解绑链接 -->
      </el-descriptions-item>
      <el-descriptions-item label="绑定邮箱">
        <span v-if="userInfo?.email">{{ userInfo.email }}</span>
        <span v-else>未绑定</span>
        <el-link type="primary" style="margin-left: 10px;" @click="showBindEmailDialog = true">
          {{ userInfo?.email ? '换绑' : '绑定' }}
        </el-link>
        <!-- 可以添加解绑链接 -->
      </el-descriptions-item>
      <!-- 可以添加其他安全设置项，如登录设备管理、第三方账号绑定等 -->
    </el-descriptions>

    <!-- 修改密码弹窗 -->
    <ChangePasswordDialog v-model="showChangePasswordDialog" />
    <!-- 绑定/换绑手机弹窗 -->
    <BindPhoneDialog v-model="showBindPhoneDialog" :current-phone="userInfo?.phone" />
    <!-- 绑定/换绑邮箱弹窗 -->
    <BindEmailDialog v-model="showBindEmailDialog" :current-email="userInfo?.email" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/modules/user';
import ChangePasswordDialog from './ChangePasswordDialog.vue';
import BindPhoneDialog from './BindPhoneDialog.vue';
import BindEmailDialog from './BindEmailDialog.vue';

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

const showChangePasswordDialog = ref(false);
const showBindPhoneDialog = ref(false);
const showBindEmailDialog = ref(false);

// 可以在这里 onMounted 获取用户信息，但 BaseInfo 组件也会获取，注意优化

</script>

<style scoped lang="scss">
.account-security {
  max-width: 800px;
  margin: auto;
}
</style> 