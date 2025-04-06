<template>
  <div class="default-layout">
    <header class="header">
      <!-- Use a wrapper div for flex layout -->
      <div class="nav-container">
        <!-- Left Items (No el-menu) -->
        <div class="left-items">
          <router-link to="/" class="left-nav-link">首页</router-link>
          <router-link to="/discover" class="left-nav-link">发现</router-link>
          <router-link to="/community" class="left-nav-link">社区</router-link>
        </div>

        <!-- Right Items -->
        <div class="right-items">
          <template v-if="isLoggedIn">
            <router-link to="/profile" class="profile-link">
              <el-avatar :size="30" :src="userInfo?.avatar || defaultAvatar" />
              <span>{{ userInfo?.username || '个人中心' }}</span>
            </router-link>
            <!-- Optional: Add Logout Button Here -->
            <!-- <el-button type="text" @click="logout">退出登录</el-button> -->
          </template>
          <template v-else>
            <router-link to="/auth/login" class="nav-link">登录</router-link>
            <router-link to="/auth/register" class="nav-link">注册</router-link>
          </template>
        </div>
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>
    <footer class="footer">
      <p>© 2025 美食推荐平台</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';
import { useUserStore } from '@/store/modules/user';
import defaultAvatar from '@/assets/images/default-avatar.png';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const userInfo = computed(() => userStore.userInfo);

onMounted(() => {
  if (isLoggedIn.value && !userInfo.value) {
    userStore.fetchUserInfo().catch(err => {
      console.error('Failed to fetch user info for layout:', err);
    });
  }
});

// Optional: Add logout function if needed
// const logout = () => {
//   authStore.logout();
//   router.push('/');
// };
</script>

<style scoped lang="scss">
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  border-bottom: 1px solid #e0e0e0;
}

// New container for flex layout
.nav-container {
  display: flex;
  justify-content: space-between; // Push left and right items apart
  align-items: center;
  height: 60px;
  padding: 0 20px;
  max-width: 1200px; // Optional: constrain width
  margin: 0 auto; // Center the container
}

// Styles for the left-side items container
.left-items {
  display: flex;
  align-items: center;
  gap: 20px; // Adjust gap as needed
  height: 100%; // Ensure links can align correctly
}

// Styles for individual left-side links
.left-nav-link {
  display: inline-flex; // Use inline-flex for vertical alignment
  align-items: center;
  height: 100%;
  padding: 0 10px;
  text-decoration: none;
  color: var(--el-text-color-primary);
  font-size: 14px;
  border-bottom: 2px solid transparent; // Placeholder for active state
  transition: color 0.3s, border-color 0.3s;

  &:hover {
    color: var(--el-color-primary);
  }

  // Active state styling (using Vue Router's default class)
  &.router-link-exact-active {
    color: var(--el-color-primary);
    border-bottom-color: var(--el-color-primary);
  }
}

// Styles for the right-side items
.right-items {
  display: flex;
  align-items: center;
  gap: 20px; // Space between login/register or profile
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--el-text-color-primary);
  font-size: 14px;
  cursor: pointer;

  .el-avatar {
    flex-shrink: 0;
  }

  &:hover {
    color: var(--el-color-primary);
  }
}

.nav-link {
  text-decoration: none;
  color: var(--el-text-color-primary);
  font-size: 14px;
  padding: 0 5px; // Add some padding

  &:hover {
    color: var(--el-color-primary);
  }
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: var(--el-bg-color-page);
}

.footer {
  text-align: center;
  padding: 10px;
  color: #999;
  background-color: #f8f8f8;
  border-top: 1px solid #e0e0e0;
}

// Remove obsolete styles
/*
.header .el-menu--horizontal .el-sub-menu__icon-more {
  display: none !important;
}
.profile-menu-item { ... }
*/
</style>