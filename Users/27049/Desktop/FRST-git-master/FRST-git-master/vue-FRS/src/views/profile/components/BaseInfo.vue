<template>
  <div class="base-info">
    <el-form ref="baseInfoFormRef" :model="baseInfoForm" :rules="baseInfoRules" label-width="80px">
      <el-form-item label="头像" prop="avatar">
        <el-upload
          class="avatar-uploader"
          action="/api/user/avatar" 
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="baseInfoForm.avatar" :src="baseInfoForm.avatar" class="avatar" alt="avatar"/>
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="el-upload__tip">点击上传头像，仅支持 JPG/PNG 格式，大小不超过 2MB</div>
      </el-form-item>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="baseInfoForm.username" disabled /> 
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="baseInfoForm.nickname" placeholder="设置你的昵称" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="baseInfoForm.gender">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="0">女</el-radio>
          <el-radio :label="2">保密</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="简介" prop="bio">
        <el-input type="textarea" v-model="baseInfoForm.bio" placeholder="介绍一下自己吧" :rows="3" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">保存修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import type { FormInstance, FormRules, UploadProps, UploadRawFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/modules/user';
import { useAuthStore } from '@/store/modules/auth';
import { updateUserProfile, getUserProfile } from '@/api/user';
import type { UserInfo, UpdateProfilePayload } from '@/types/api';

const userStore = useUserStore();
const authStore = useAuthStore();
const loading = ref(false);
const baseInfoFormRef = ref<FormInstance>();

// 使用 reactive 包裹表单数据
const baseInfoForm = reactive<Partial<UserInfo & { nickname?: string; gender?: number; bio?: string }>>({
  username: '',
  avatar: '',
  nickname: '',
  gender: 2, // 默认为保密
  bio: '',
});

// 表单校验规则
const baseInfoRules = reactive<FormRules>({
  nickname: [{ max: 20, message: '昵称长度不能超过 20 个字符', trigger: 'blur' }],
  bio: [{ max: 100, message: '简介长度不能超过 100 个字符', trigger: 'blur' }],
});

// 上传头像相关
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.getToken()}`,
}));

const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  if (response.code === 0 && response.data.avatarUrl) {
    baseInfoForm.avatar = response.data.avatarUrl;
    userStore.setUser({ ...userStore.userInfo, avatar: response.data.avatarUrl } as UserInfo);
    ElMessage.success('头像上传成功!');
  } else {
    ElMessage.error(response.message || '头像上传失败');
  }
};

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  const isJPG = rawFile.type === 'image/jpeg';
  const isPNG = rawFile.type === 'image/png';
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isJPG && !isPNG) {
    ElMessage.error('头像图片只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 获取初始用户信息
onMounted(async () => {
  // 尝试从 store 获取
  let currentUserInfo = userStore.getUserInfo();
  if (!currentUserInfo) {
    // 如果 store 没有，尝试调用 API 获取
    try {
      const res = await getUserProfile();
      if (res.code === 0 && res.data) {
        currentUserInfo = res.data;
        userStore.setUser(currentUserInfo);
      } else {
        ElMessage.error('获取用户信息失败');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch user profile on mount:', error);
      return;
    }
  }

  // 用获取到的用户信息填充表单
  if (currentUserInfo) {
    Object.assign(baseInfoForm, {
      username: currentUserInfo.username,
      avatar: currentUserInfo.avatar,
      // 后端可能没有 nickname, gender, bio 字段，需要兼容
      nickname: (currentUserInfo as any).nickname || '',
      gender: (currentUserInfo as any).gender ?? 2, // 如果没有 gender，默认为保密
      bio: (currentUserInfo as any).bio || '',
    });
  }
});

// 提交表单
const submitForm = async () => {
  if (!baseInfoFormRef.value) return;
  await baseInfoFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 准备提交的数据，只包含需要更新的字段
        const payload: UpdateProfilePayload = {
          avatar: baseInfoForm.avatar,
          nickname: baseInfoForm.nickname,
          gender: baseInfoForm.gender,
          bio: baseInfoForm.bio,
        };
        const res = await updateUserProfile(payload);
        if (res.code === 0 && res.data) {
          // 更新 store 中的用户信息
          userStore.setUser(res.data);
          ElMessage.success('资料保存成功!');
        } else {
          // ElMessage.error(res.message || '保存失败');
        }
      } catch (error) {
        console.error('Failed to update profile:', error);
      } finally {
        loading.value = false;
      }
    } else {
      console.log('Form validation failed!');
      return false;
    }
  });
};
</script>

<style scoped lang="scss">
.base-info {
  max-width: 600px;
  margin: auto;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
}

.el-upload__tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>

<style>
/* 单独设置 uploader 的样式 */
.avatar-uploader .el-upload {
  border-radius: 50% !important;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 