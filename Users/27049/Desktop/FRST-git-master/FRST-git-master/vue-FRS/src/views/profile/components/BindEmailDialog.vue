<template>
  <el-dialog
    :title="isBinding ? '绑定邮箱' : '换绑邮箱'"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="500px"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-form
      ref="emailFormRef"
      :model="emailForm"
      :rules="emailRules"
      label-width="100px"
    >
      <el-form-item v-if="!isBinding" label="当前邮箱">
        <span>{{ currentEmail || '-' }}</span>
      </el-form-item>
      <el-form-item label="新邮箱" prop="email">
        <el-input v-model="emailForm.email" placeholder="请输入新的邮箱地址" />
      </el-form-item>
      <el-form-item label="验证码" prop="smsCode"> 
        <el-row :gutter="10">
          <el-col :span="16">
            <el-input v-model="emailForm.smsCode" placeholder="输入邮箱验证码" />
          </el-col>
          <el-col :span="8">
            <el-button
              :disabled="isSmsSent || !emailForm.email" 
              :loading="smsLoading"
              @click="sendEmailCode"
              style="width: 100%;"
            >
              {{ smsButtonText }}
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="submitBindEmail" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { bindEmail } from '@/api/user';
import { getSmsCode } from '@/api/auth'; // 复用获取验证码接口，假设后端支持发送到邮箱
import { useUserStore } from '@/store/modules/user';
import { isValidEmail } from '@/utils/validators'; // 引入邮箱校验

const props = defineProps<{ modelValue: boolean; currentEmail?: string }>();
const emit = defineEmits(['update:modelValue']);
const userStore = useUserStore();

const emailFormRef = ref<FormInstance>();
const loading = ref(false);
const smsLoading = ref(false);
const countdown = ref(0);
const timer = ref<NodeJS.Timeout | null>(null);

const emailForm = reactive({
  email: '',
  smsCode: '', // 这里字段名可能需要后端确认，是 emailCode 还是 smsCode
});

const isBinding = computed(() => !props.currentEmail);

const emailRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (!isValidEmail(value)) {
          callback(new Error('请输入有效的邮箱地址'));
        } else {
          callback();
        }
      }, trigger: 'blur' },
  ],
  smsCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
});

const isSmsSent = computed(() => countdown.value > 0);
const smsButtonText = computed(() => {
  return isSmsSent.value ? `${countdown.value}s 后重发` : '获取验证码';
});

// 重置表单和倒计时
const resetForm = () => {
  emailFormRef.value?.resetFields();
  if (timer.value) clearInterval(timer.value);
  countdown.value = 0;
};

// 监听关闭
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});

// 发送邮箱验证码 (复用 getSmsCode，假设后端支持 email 字段)
const sendEmailCode = async () => {
  if (isSmsSent.value || !emailForm.email) return;
  // 校验邮箱
  const emailField = emailFormRef.value?.fields.find(f => f.prop === 'email');
  if (emailField) {
    try {
      await emailField.validate('blur');
    } catch (error) { return; }
  }

  smsLoading.value = true;
  try {
    const emailType = isBinding.value ? 'bindEmail' : 'changeEmail'; // 假设后端支持
    const res = await getSmsCode({ email: emailForm.email, type: emailType as any });
    if (res.code === 0) {
      ElMessage.success('验证码已发送至您的邮箱');
      countdown.value = 60;
      timer.value = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          if (timer.value) clearInterval(timer.value);
        }
      }, 1000);
    } else {
      // ElMessage.error(res.message || '发送失败');
    }
  } catch (error) {
    console.error('Failed to send email code:', error);
  } finally {
    smsLoading.value = false;
  }
};

// 提交绑定/换绑
const submitBindEmail = async () => {
  if (!emailFormRef.value) return;
  await emailFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const res = await bindEmail(emailForm);
        if (res.code === 0) {
          ElMessage.success(isBinding.value ? '邮箱绑定成功!' : '邮箱换绑成功!');
          userStore.setUser({ ...userStore.userInfo, email: emailForm.email } as any);
          emit('update:modelValue', false);
        } else {
          // ElMessage.error(res.message || '操作失败');
        }
      } catch (error) {
        console.error('Failed to bind email:', error);
      } finally {
        loading.value = false;
      }
    } else {
      console.log('Email form validation failed!');
      return false;
    }
  });
};

// 组件卸载时清除定时器
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
});

</script> 