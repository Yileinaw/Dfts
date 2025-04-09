<template>
  <el-dialog
    :model-value="visible"
    title="发布新分享"
    width="600px"
    @update:model-value="$emit('update:visible', $event)"
    @closed="resetForm"
    draggable
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="postForm"
      :rules="rules"
      label-position="top"
      status-icon
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="postForm.title" placeholder="给你的分享起个标题吧" maxlength="50" show-word-limit />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input
          v-model="postForm.content"
          type="textarea"
          :rows="5"
          placeholder="分享你的美食故事、食谱或心得..."
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>
      <!-- TODO: Add image upload functionality -->
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">取消</el-button>
        <el-button type="primary" @click="submitPost" :loading="isLoading">
          发布
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { PostService } from '@/services/PostService';

// Props & Emits
const props = defineProps<{ visible: boolean }>();
const emit = defineEmits(['update:visible', 'post-created']);

// State
const formRef = ref<FormInstance | null>(null);
const isLoading = ref(false);
const postForm = reactive({
  title: '',
  content: '',
});

// Rules
const rules = reactive<FormRules>({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  // 可以为 content 添加规则，如果需要的话
});

// Reset form when dialog closes
const resetForm = () => {
    formRef.value?.resetFields();
};

// Submit post logic
const submitPost = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      isLoading.value = true;
      try {
        await PostService.createPost(postForm);
        ElMessage.success('发布成功！');
        emit('update:visible', false); // Close dialog
        emit('post-created'); // Notify parent component
        // resetForm() 会在 @closed 时调用
      } catch (error: any) {
        console.error('Failed to create post:', error);
        const message = error.response?.data?.message || '发布失败，请稍后再试';
        ElMessage.error(message);
      } finally {
        isLoading.value = false;
      }
    } else {
      console.log('Post form validation failed');
    }
  });
};

// Watch for visibility change to potentially reset form (alternative to @closed)
// watch(() => props.visible, (newValue) => {
//   if (!newValue) {
//     resetForm();
//   }
// });

</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style> 