<template>
  <el-dialog
    :title="isBinding ? '绑定手机号' : '换绑手机号'"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="500px"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-form
      ref="phoneFormRef"
      :model="phoneForm"
      :rules="phoneRules"
      label-width="100px"
    >
      <el-form-item v-if="!isBinding" label="当前手机号">
        <span>{{ currentPhone || '-' }}</span>
      </el-form-item>
      <el-form-item label="新手机号" prop="phone">
        <el-input v-model="phoneForm.phone" placeholder="请输入新的手机号" />
      </el-form-item>
      <el-form-item label="验证码" prop="smsCode">
        <el-row :gutter="10">
          <el-col :span="16">
            <el-input v-model="phoneForm.smsCode" placeholder="输入短信验证码" />
          </el-col>
          <el-col :span="8">
            <el-button
              :disabled="isSmsSent || !phoneForm.phone"
              :loading="smsLoading"
              @click="sendSmsCode"
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
        <el-button type="primary" @click="submitBindPhone" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { bindPhone } from '@/api/user';
import { getSmsCode } from '@/api/auth'; // 复用获取验证码接口
import { useUserStore } from '@/store/modules/user';

const props = defineProps<{ modelValue: boolean; currentPhone?: string }>();
const emit = defineEmits(['update:modelValue']);
const userStore = useUserStore();

const phoneFormRef = ref<FormInstance>();
const loading = ref(false);
const smsLoading = ref(false);
const countdown = ref(0);
const timer = ref<NodeJS.Timeout | null>(null);

const phoneForm = reactive({
  phone: '',
  smsCode: '',
});

const isBinding = computed(() => !props.currentPhone);

const phoneRules = reactive<FormRules>({
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' },
  ],
  smsCode: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }],
});

const isSmsSent = computed(() => countdown.value > 0);
const smsButtonText = computed(() => {
  return isSmsSent.value ? `${countdown.value}s 后重发` : '获取验证码';
});

// 重置表单和倒计时
const resetForm = () => {
  phoneFormRef.value?.resetFields();
  if (timer.value) clearInterval(timer.value);
  countdown.value = 0;
};

// 监听关闭
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});

// 发送短信验证码
const sendSmsCode = async () => {
  if (isSmsSent.value || !phoneForm.phone) return;
  // 校验手机号
  const phoneField = phoneFormRef.value?.fields.find(f => f.prop === 'phone');
  if (phoneField) {
    try {
      await phoneField.validate('blur');
    } catch (error) { return; }
  }

  smsLoading.value = true;
  try {
    // 根据是绑定还是换绑，可能需要不同的验证码类型 (type)
    const smsType = isBinding.value ? 'bindPhone' : 'changePhone'; // 假设后端支持这两种 type
    const res = await getSmsCode({ phone: phoneForm.phone, type: smsType as any }); // type 需要根据后端调整
    if (res.code === 0) {
      ElMessage.success('验证码已发送');
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
    console.error('Failed to send SMS code:', error);
  } finally {
    smsLoading.value = false;
  }
};

// 提交绑定/换绑
const submitBindPhone = async () => {
  if (!phoneFormRef.value) return;
  await phoneFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const res = await bindPhone(phoneForm);
        if (res.code === 0) {
          ElMessage.success(isBinding.value ? '手机号绑定成功!' : '手机号换绑成功!');
          // 更新 store 中的用户信息
          userStore.setUser({ ...userStore.userInfo, phone: phoneForm.phone } as any);
          emit('update:modelValue', false);
        } else {
          // ElMessage.error(res.message || '操作失败');
        }
      } catch (error) {
        console.error('Failed to bind phone:', error);
      } finally {
        loading.value = false;
      }
    } else {
      console.log('Phone form validation failed!');
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