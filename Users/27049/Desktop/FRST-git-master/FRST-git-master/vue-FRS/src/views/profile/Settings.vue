<template>
    <div class="settings-view">
        <h1>账户设置</h1>

        <el-card shadow="never" class="setting-card">
            <template #header>
                <div class="card-header">
                    <span>修改用户名</span>
                </div>
            </template>
            <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="80px"
                @submit.prevent="handleUpdateProfile">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="profileForm.username" placeholder="请输入新的用户名"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleUpdateProfile" :loading="isUpdatingProfile">保存更改</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card shadow="never" class="setting-card">
            <template #header>
                <div class="card-header">
                    <span>修改密码</span>
                </div>
            </template>
            <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px"
                @submit.prevent="handleUpdatePassword">
                <el-form-item label="当前密码" prop="current">
                    <el-input type="password" v-model="passwordForm.current" placeholder="请输入当前密码"
                        show-password></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="new">
                    <el-input type="password" v-model="passwordForm.new" placeholder="请输入至少6位的新密码"
                        show-password></el-input>
                </el-form-item>
                <el-form-item label="确认新密码" prop="confirm">
                    <el-input type="password" v-model="passwordForm.confirm" placeholder="请再次输入新密码"
                        show-password></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleUpdatePassword"
                        :loading="isUpdatingPassword">确认修改</el-button>
                </el-form-item>
            </el-form>
        </el-card>

    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { ElCard, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

const userStore = useUserStore();

// --- Profile Form ---
const profileFormRef = ref<FormInstance>();
const isUpdatingProfile = ref(false);
const profileForm = reactive({
    username: ''
});

const profileRules = reactive<FormRules>({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ]
});

onMounted(() => {
    // Initialize username from store
    profileForm.username = userStore.userInfo?.username || '';
});

const handleUpdateProfile = async () => {
    if (!profileFormRef.value) return;
    await profileFormRef.value.validate(async (valid) => {
        if (valid) {
            isUpdatingProfile.value = true;
            try {
                await userStore.updateUserProfile({ username: profileForm.username });
                // Message handled in store
            } catch (error) {
                // Error handled in store
                console.error('Component error updating profile:', error);
            } finally {
                isUpdatingProfile.value = false;
            }
        }
    });
};

// --- Password Form ---
const passwordFormRef = ref<FormInstance>();
const isUpdatingPassword = ref(false);
const passwordForm = reactive({
    current: '',
    new: '',
    confirm: ''
});

// Custom validator for confirming password
const validatePassConfirm = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请再次输入新密码'));
    } else if (value !== passwordForm.new) {
        callback(new Error('两次输入的新密码不一致!'));
    } else {
        callback();
    }
};

const passwordRules = reactive<FormRules>({
    current: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
    new: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
    ],
    confirm: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        { validator: validatePassConfirm, trigger: 'blur' }
    ]
});

const handleUpdatePassword = async () => {
    if (!passwordFormRef.value) return;
    await passwordFormRef.value.validate(async (valid) => {
        if (valid) {
            isUpdatingPassword.value = true;
            try {
                const success = await userStore.updatePassword({
                    current: passwordForm.current,
                    new: passwordForm.new
                });
                if (success) {
                    // Reset form on success
                    passwordFormRef.value?.resetFields();
                }
            } catch (error) {
                // Error handled in store
                console.error('Component error updating password:', error);
            } finally {
                isUpdatingPassword.value = false;
            }
        }
    });
};

</script>

<style scoped lang="scss">
.settings-view {
    max-width: 600px; // Adjust width for forms
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    gap: 20px; // Space between cards
}

.setting-card {
    // No specific styles needed unless overriding defaults
}

.card-header {
    font-weight: 600;
}
</style>