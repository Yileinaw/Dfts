<template>
  <el-dialog
    title="修改密码"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="500px"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordRules"
      label-width="100px"
    >
      <!-- 如果后端要求验证旧密码 -->
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码 (至少6位)" />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
      </el-form-item>
      <!-- 或者使用短信验证码修改 -->
      <!-- <el-form-item label="手机号" prop="phone"> ... </el-form-item> -->
      <!-- <el-form-item label="验证码" prop="smsCode"> ... </el-form-item> -->
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="submitChangePassword" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { changePassword } from '@/api/user';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);

const passwordFormRef = ref<FormInstance>();
const loading = ref(false);
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  // smsCode: ''
});

// 校验确认密码
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致!'));
  } else {
    callback();
  }
};

const passwordRules = reactive<FormRules>({
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }], // 如果需要验证旧密码
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
  // smsCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
});

// 重置表单
const resetForm = () => {
  passwordFormRef.value?.resetFields();
};

// 监听弹窗关闭事件来重置表单
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});

// 提交修改密码
const submitChangePassword = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 准备提交的数据
        const payload = {
          oldPassword: passwordForm.oldPassword, // 如果需要
          newPassword: passwordForm.newPassword,
          // smsCode: passwordForm.smsCode // 如果使用验证码
        };
        const res = await changePassword(payload);
        if (res.code === 0) {
          ElMessage.success('密码修改成功！下次登录请使用新密码。');
          emit('update:modelValue', false); // 关闭弹窗
          // 可能需要用户重新登录，或清除 token
          // useAuthStore().clearAuth();
          // useRouter().push('/auth/login');
        } else {
          // ElMessage.error(res.message || '修改失败');
        }
      } catch (error) {
        console.error('Failed to change password:', error);
      } finally {
        loading.value = false;
      }
    } else {
      console.log('Password form validation failed!');
      return false;
    }
  });
};
</script> 