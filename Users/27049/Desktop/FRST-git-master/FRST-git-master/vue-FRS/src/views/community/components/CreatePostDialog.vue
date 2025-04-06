<template>
  <el-dialog
    title="发布新动态"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="600px"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-form ref="postFormRef" :model="postForm" :rules="postRules" label-position="top">
      <el-form-item prop="content">
        <el-input
          v-model="postForm.content"
          type="textarea"
          :rows="4"
          placeholder="分享你的新鲜事..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="添加图片 (可选)">
        <el-upload
          v-model:file-list="fileList"
          action="/api/upload/media" 
          list-type="picture-card"
          :headers="uploadHeaders"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleUploadSuccess"
          :before-upload="beforeImageUpload"
          :limit="9" 
          accept="image/jpeg, image/png"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <div class="el-upload__tip">最多上传9张图片，仅支持 JPG/PNG 格式，单张不超过 5MB</div>
      </el-form-item>

      <el-form-item label="添加位置 (可选)">
        <el-input v-model="postForm.location" placeholder="你在哪里？" :prefix-icon="Location" />
      </el-form-item>

      <el-form-item label="添加标签 (可选)">
        <el-tag
          v-for="tag in postForm.tags"
          :key="tag"
          closable
          :disable-transitions="false"
          @close="handleTagClose(tag)"
          style="margin-right: 5px; margin-bottom: 5px;"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="InputRef"
          v-model="inputValue"
          class="tag-input"
          size="small"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else class="button-new-tag ml-1" size="small" @click="showInput">
          + 添加标签
        </el-button>
        <div class="el-upload__tip">最多添加5个标签，每个标签不超过10个字符</div>
      </el-form-item>

    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="submitPost" :loading="loading">发布</el-button>
      </span>
    </template>

    <!-- 图片预览弹窗 -->
    <el-dialog v-model="dialogVisible" title="图片预览" append-to-body>
      <img w-full :src="dialogImageUrl" alt="Preview Image" style="width: 100%" />
    </el-dialog>

  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, computed } from 'vue';
import type { FormInstance, FormRules, UploadProps, UploadUserFile, UploadRawFile } from 'element-plus';
import { ElMessage, ElInput } from 'element-plus';
import { Plus, Location } from '@element-plus/icons-vue';
import { createPost } from '@/api/post'; // 引入创建帖子 API
// import { uploadMedia } from '@/api/post'; // 假设有独立的上传 API
import { useAuthStore } from '@/store/modules/auth';
import type { CreatePostPayload } from '@/types/api';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue', 'success']);

const authStore = useAuthStore();
const postFormRef = ref<FormInstance>();
const loading = ref(false);

const postForm = reactive<CreatePostPayload>({
  content: '',
  images: [],
  location: '',
  tags: [],
});

const postRules = reactive<FormRules>({
  content: [{ required: true, message: '分享内容不能为空', trigger: 'blur' }, { min: 1, max: 500, message: '内容长度在 1 到 500 个字符', trigger: 'blur'}],
});

// --- 图片上传相关 ---
const fileList = ref<UploadUserFile[]>([]);
const dialogImageUrl = ref('');
const dialogVisible = ref(false);

// 需要设置请求头带 Token
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.getToken()}`,
}));

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  console.log('remove', uploadFile, uploadFiles);
  // 从 postForm.images 中移除对应的 URL
  const urlToRemove = uploadFile.response?.data?.mediaUrl || uploadFile.url; // 获取 URL
  if (urlToRemove) {
    postForm.images = postForm.images?.filter(url => url !== urlToRemove);
  }
};

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};

const handleUploadSuccess: UploadProps['onSuccess'] = (response, uploadFile, uploadFiles) => {
  console.log('success', response, uploadFile, uploadFiles);
  if (response.code === 0 && response.data.mediaUrl) {
    // 将上传成功的图片 URL 添加到 postForm.images
    if (!postForm.images) postForm.images = [];
    postForm.images.push(response.data.mediaUrl);
  } else {
    ElMessage.error(response.message || '图片上传失败');
    // 从 fileList 中移除失败的文件
    const index = fileList.value.findIndex(file => file.uid === uploadFile.uid);
    if (index > -1) {
      fileList.value.splice(index, 1);
    }
  }
};

const beforeImageUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  const isJPG = rawFile.type === 'image/jpeg';
  const isPNG = rawFile.type === 'image/png';
  const isLt5M = rawFile.size / 1024 / 1024 < 5;

  if (!isJPG && !isPNG) {
    ElMessage.error('图片只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!');
    return false;
  }
  return true;
};

// --- 标签相关 ---
const inputValue = ref('');
const inputVisible = ref(false);
const InputRef = ref<InstanceType<typeof ElInput>>();

const handleTagClose = (tag: string) => {
  postForm.tags?.splice(postForm.tags.indexOf(tag), 1);
};

const showInput = () => {
  if (postForm.tags && postForm.tags.length >= 5) {
    ElMessage.warning('最多添加5个标签');
    return;
  }
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value!.input!.focus();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value && inputValue.value.length <= 10) {
    if (!postForm.tags) postForm.tags = [];
    // 检查标签是否重复
    if (!postForm.tags.includes(inputValue.value)) {
       postForm.tags.push(inputValue.value);
    } else {
      ElMessage.warning('标签已存在');
    }
  }
  inputVisible.value = false;
  inputValue.value = '';
};

// --- 表单提交与重置 ---
const resetForm = () => {
  postFormRef.value?.resetFields();
  postForm.images = [];
  postForm.location = '';
  postForm.tags = [];
  fileList.value = []; // 清空上传列表
};

const submitPost = async () => {
  if (!postFormRef.value) return;
  await postFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const payload: CreatePostPayload = {
          content: postForm.content,
          images: postForm.images?.length ? postForm.images : undefined,
          location: postForm.location || undefined,
          tags: postForm.tags?.length ? postForm.tags : undefined,
        };
        const res = await createPost(payload);
        if (res.code === 0) {
          ElMessage.success('发布成功!');
          emit('success'); // 通知父组件发布成功
          emit('update:modelValue', false); // 关闭弹窗
        } else {
          // ElMessage.error(res.message || '发布失败');
        }
      } catch (error) {
        console.error('Failed to create post:', error);
      } finally {
        loading.value = false;
      }
    } else {
      console.log('Post form validation failed!');
      return false;
    }
  });
};

</script>

<style scoped lang="scss">
.tag-input {
  width: 100px; // 调整标签输入框宽度
}

.el-upload__tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style> 