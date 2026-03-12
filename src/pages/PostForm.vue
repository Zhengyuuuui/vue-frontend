<template>
  <div class="max-w-4xl mx-auto px-4">
    <h1 class="text-xl font-bold mb-6">发布帖子</h1>
    
    <div class="card">
      <!-- 帖子内容 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">内容</label>
        <textarea 
          v-model="form.content" 
          placeholder="请输入帖子内容" 
          class="input-field w-full resize-none text-sm" 
          rows="6"
          :class="{ 'border-red-500': errors.content }"
        ></textarea>
        <p v-if="errors.content" class="text-red-500 text-xs mt-1">{{ errors.content }}</p>
      </div>

      <!-- 标签选择 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">标签（必选）</label>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="tag in tags" 
            :key="tag"
            class="px-3 py-2 rounded-full text-xs transition-colors"
            :class="form.tag === tag ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            @click="form.tag = tag"
          >
            {{ tag }}
          </button>
        </div>
        <p v-if="errors.tag" class="text-red-500 text-xs mt-1">{{ errors.tag }}</p>
      </div>

      <!-- 图片上传 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">图片（可选，最多4张）</label>
        <div class="flex flex-wrap gap-2">
          <!-- 已选图片 -->
          <div v-for="(image, index) in form.images" :key="index" class="relative w-20 h-20">
            <img :src="image" alt="预览图" class="w-full h-full object-cover rounded-lg">
            <button 
              class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs" 
              @click="removeImage(index)"
            >
              ×
            </button>
          </div>
          
          <!-- 上传按钮 -->
          <div v-if="form.images.length < 4" class="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
            <input type="file" accept="image/*" multiple @change="handleImageUpload" class="hidden" ref="fileInput">
            <button type="button" class="flex flex-col items-center text-gray-500" @click="$refs.fileInput.click()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-xs mt-1">添加</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 发布按钮 -->
      <div class="flex justify-end">
        <button 
          class="btn-primary px-6 py-2 text-sm" 
          @click="submitPost"
          :disabled="loading || !isLoggedIn"
          :class="{ 'opacity-50 cursor-not-allowed': !isLoggedIn }"
        >
          <span v-if="!isLoggedIn" class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            请先登录
          </span>
          <span v-else-if="loading">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            发布中...
          </span>
          <span v-else>发布</span>
        </button>
      </div>
    </div>

    <!-- 登录提示 -->
    <div v-if="showLoginPrompt" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
        <h3 class="text-lg font-medium mb-2">请先登录</h3>
        <p class="text-gray-600 mb-4">登录后才能发布帖子</p>
        <div class="flex gap-3">
          <button class="btn-secondary flex-1 text-sm" @click="showLoginPrompt = false">取消</button>
          <button class="btn-primary flex-1 text-sm" @click="navigateToLogin">去登录</button>
        </div>
      </div>
    </div>

    <!-- 提示 -->
    <div 
      v-if="showToast" 
      class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg z-50 text-sm"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import request from '../utils/request';

const router = useRouter();
const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isLoggedIn);

const form = ref({
  content: '',
  tag: '',
  images: []
});

const errors = ref({
  content: '',
  tag: ''
});

const loading = ref(false);
const showToast = ref(false);
const showLoginPrompt = ref(false);
const toastMessage = ref('');
const tags = ['失物招领', '随便说说', '捞人', '出闲置'];

// 表单校验
const validateForm = () => {
  errors.value.content = '';
  errors.value.tag = '';
  
  let isValid = true;
  
  if (!form.value.content.trim()) {
    errors.value.content = '内容不能为空';
    isValid = false;
  } else if (form.value.content.trim().length < 5) {
    errors.value.content = '内容至少需要5个字符';
    isValid = false;
  }
  
  if (!form.value.tag) {
    errors.value.tag = '请选择标签';
    isValid = false;
  }
  
  return isValid;
};

// 处理图片上传
const handleImageUpload = (event) => {
  const files = event.target.files;
  if (files.length === 0) return;
  
  // 限制最多上传4张图片
  const remainingSlots = 4 - form.value.images.length;
  const filesToProcess = Array.from(files).slice(0, remainingSlots);
  
  filesToProcess.forEach(file => {
    // 检查文件大小（限制2MB）
    if (file.size > 2 * 1024 * 1024) {
      showToastMessage('图片大小不能超过2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.images.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
  
  // 清空文件输入，以便可以重复选择同一文件
  event.target.value = '';
};

// 移除图片
const removeImage = (index) => {
  form.value.images.splice(index, 1);
};

// 提交帖子
const submitPost = async () => {
  // 检查登录状态
  if (!isLoggedIn.value) {
    showLoginPrompt.value = true;
    return;
  }
  
  // 表单校验
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  try {
    const response = await request.post('/api/posts', form.value);
    
    if (response.success) {
      showToastMessage('发布成功！');
      // 清空表单
      form.value = {
        content: '',
        tag: '',
        images: []
      };
      // 延迟跳转到首页
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      showToastMessage(response.message || '发布失败');
    }
  } catch (error) {
    console.error('发布帖子失败:', error);
    const errorMessage = error.response?.data?.message || '发布失败，请重试';
    showToastMessage(errorMessage);
  } finally {
    loading.value = false;
  }
};

// 跳转到登录页面
const navigateToLogin = () => {
  showLoginPrompt.value = false;
  router.push('/login');
};

// 显示提示消息
const showToastMessage = (message) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 2000);
};
</script>