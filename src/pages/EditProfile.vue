<template>
  <div class="max-w-4xl mx-auto px-4">
    <h1 class="text-xl font-bold mb-6">编辑资料</h1>
    
    <div class="card">
      <!-- 头像上传 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">头像</label>
        <div class="flex items-center gap-4">
          <div class="relative">
            <img 
              :src="avatarPreview || defaultAvatar" 
              alt="头像预览" 
              class="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
            >
            <button 
              v-if="avatarPreview || form.avatar"
              class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              @click="removeAvatar"
            >
              ×
            </button>
          </div>
          <div class="flex-1">
            <!-- 【关键修复点1：文件选择器配置】 -->
            <!-- accept限制文件类型，确保只允许jpg/png/gif/webp -->
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/gif,image/webp" 
              @change="handleAvatarUpload" 
              class="hidden" 
              ref="avatarInput"
            >
            <button 
              class="btn-secondary px-4 py-2 text-sm"
              @click="triggerFileSelect"
            >
              选择图片
            </button>
            <p class="text-xs text-gray-500 mt-1">支持 JPG、PNG、GIF、WebP 格式，大小不超过 5MB</p>
          </div>
        </div>
      </div>

      <!-- 用户名 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
        <input 
          v-model="form.username" 
          type="text" 
          placeholder="请输入用户名" 
          disabled
          class="input-field w-full text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
          :class="{ 'border-red-500': errors.username }"
        >
        <p class="text-gray-500 text-xs mt-1">用户名作为唯一账号，不可修改</p>
        <p v-if="errors.username" class="text-red-500 text-xs mt-1">{{ errors.username }}</p>
      </div>

      <!-- 昵称 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">昵称</label>
        <input 
          v-model="form.nickname" 
          type="text" 
          placeholder="请输入昵称" 
          class="input-field w-full text-sm"
        >
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <button 
          class="btn-secondary flex-1 text-sm"
          @click="cancelEdit"
        >
          取消
        </button>
        <button 
          class="btn-primary flex-1 text-sm"
          @click="saveProfile"
          :disabled="loading"
        >
          <span v-if="loading">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            保存中...
          </span>
          <span v-else>保存</span>
        </button>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import request from '../utils/request';
import axios from 'axios';
import defaultAvatar from '../assets/images/default-avatar.png';

const router = useRouter();
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

// 表单数据
const form = ref({
  username: '',
  nickname: '',
  avatar: ''
});

// 【关键修复点2：保存原始File对象】
// 直接保存原生File对象，不转换为base64
const selectedFile = ref(null);
// 头像预览URL
const avatarPreview = ref('');

const errors = ref({
  username: ''
});

const loading = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

// 表单校验
const validateForm = () => {
  errors.value.username = '';
  return true;
};

// 【关键修复点3：触发文件选择】
// 支持重复选择同一文件
const triggerFileSelect = () => {
  const input = document.querySelector('input[type="file"]');
  if (input) {
    // 先清空value，确保重复选择同一文件也能触发change事件
    input.value = '';
    input.click();
  }
};

// 【关键修复点4：处理文件选择】
// 正确获取原生File对象，并创建预览URL
const handleAvatarUpload = (event) => {
  const file = event.target.files[0];
  console.log('文件选择事件触发，文件对象:', file);
  
  if (!file) return;
  
  // 【关键修复点5：前置校验 - 文件类型】
  // 限制文件类型：仅允许jpg/png/gif/webp
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showToastMessage('请选择 JPG、PNG、GIF 或 WebP 格式的图片');
    // 清空文件选择器
    event.target.value = '';
    return;
  }
  
  // 【关键修复点6：前置校验 - 文件大小】
  // 限制文件大小：最大5MB
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showToastMessage('图片大小不能超过5MB');
    // 清空文件选择器
    event.target.value = '';
    return;
  }
  
  // 【关键修复点7：保存原始File对象】
  // 直接保存原生File对象，不转换为base64
  selectedFile.value = file;
  console.log('已保存File对象到selectedFile:', selectedFile.value);
  
  // 【关键修复点8：创建预览URL】
  // 使用URL.createObjectURL()创建预览URL，性能更好
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value);
  }
  avatarPreview.value = URL.createObjectURL(file);
  
  showToastMessage('图片选择成功');
  
  // 清空文件选择器，支持重复选择同一文件
  event.target.value = '';
};

// 移除头像
const removeAvatar = () => {
  selectedFile.value = null;
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value);
    avatarPreview.value = '';
  }
  form.value.avatar = '';
  showToastMessage('头像已移除');
};

// 【关键修复点9：上传头像到服务器】
// 直接使用原始File对象，不进行转换
const uploadAvatar = async () => {
  // 【关键修复点10：二次校验】
  // 确保存在File对象，避免无效请求
  if (!selectedFile.value) {
    console.warn('没有选择文件，跳过上传');
    return form.value.avatar;
  }
  
  try {
    console.log('========== 开始上传头像 ==========');
    console.log('selectedFile.value:', selectedFile.value);
    console.log('文件详细信息:', {
      name: selectedFile.value.name,
      type: selectedFile.value.type,
      size: selectedFile.value.size,
      lastModified: selectedFile.value.lastModified
    });
    
    // 【关键修复点11：FormData组装】
    // 字段名必须和后端multer.single('avatar')的字段名一致（固定为'avatar'）
    // 仅传入原生File对象，不传入文件名/路径字符串
    const formData = new FormData();
    formData.append('avatar', selectedFile.value);
    
    // 调试：检查FormData内容
    console.log('FormData avatar字段:', formData.get('avatar'));
    console.log('FormData所有键:', Array.from(formData.keys()));
    console.log('FormData所有值:', Array.from(formData.values()));
    
    // 【关键修复点12：请求配置】
    // 【重要】Vite代理在转发FormData时可能存在问题，导致后端无法正确解析multipart数据
    // 解决方案：绕过Vite代理，直接使用axios请求后端
    // 【重要】禁止手动设置Content-Type
    // axios会自动设置Content-Type为multipart/form-data，并自动添加boundary
    // 手动设置会导致boundary丢失，后端无法正确解析multipart数据，这是导致400错误的主要原因
    console.log('准备发送请求到: http://localhost:3000/api/user/avatar (绕过Vite代理)');
    
    // 创建专门的axios实例用于头像上传，直接请求后端
    const uploadRequest = axios.create({
      baseURL: 'http://localhost:3000',
      timeout: 30000,
      withCredentials: true
    });
    
    // 添加token
    const token = localStorage.getItem('token');
    if (token) {
      uploadRequest.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    const uploadResponse = await uploadRequest.post('/api/user/avatar', formData);
    
    console.log('头像上传响应:', uploadResponse);
    console.log('头像上传响应类型:', typeof uploadResponse);
    console.log('头像上传响应.data:', uploadResponse.data);
    console.log('头像上传响应.data.data:', uploadResponse.data?.data);
    console.log('头像上传响应.data.data完整内容:', JSON.stringify(uploadResponse.data?.data, null, 2));
    
    // 兼容不同的响应格式
    // 后端返回结构: {success: true, message: '头像上传成功', data: {avatarUrl: '...'}}
    // 或者: {success: true, data: {avatarUrl: '...'}}
    const responseData = uploadResponse.data;
    const avatarUrl = responseData?.data?.avatarUrl || 
                     responseData?.data?.url || 
                     responseData?.avatarUrl || 
                     responseData?.url;
    
    console.log('解析出的avatarUrl:', avatarUrl);
    console.log('avatarUrl类型:', typeof avatarUrl);
    
    if (!avatarUrl) {
      console.error('无法从响应中解析出avatarUrl，完整响应:', JSON.stringify(uploadResponse.data, null, 2));
      throw new Error('头像上传成功，但无法获取头像URL');
    }
    
    return avatarUrl;
  } catch (error) {
    console.error('========== 上传头像失败 ==========');
    console.error('上传头像失败:', error);
    
    // 【关键修复点13：错误捕获优化】
    // 打印详细错误信息到控制台
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应数据:', error.response.data);
      console.error('错误响应头:', error.response.headers);
    } else if (error.request) {
      console.error('无响应:', error.request);
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    // 根据不同的错误类型提供友好的用户提示
    let errorMessage = '头像上传失败';
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 500) {
        // 500错误：服务器内部错误
        if (data && data.message) {
          errorMessage = `服务器错误: ${data.message}`;
        } else if (data && data.error) {
          errorMessage = `服务器错误: ${data.error}`;
        } else {
          errorMessage = '服务器内部错误，请稍后重试';
        }
      } else if (status === 413) {
        // 413错误：文件过大
        errorMessage = '文件过大，请选择小于5MB的图片';
      } else if (status === 415) {
        // 415错误：不支持的媒体类型
        errorMessage = '不支持的图片格式，请选择JPG、PNG、GIF或WebP';
      } else if (status === 401) {
        // 401错误：未授权
        errorMessage = '请先登录后再上传头像';
      } else if (status === 400) {
        // 400错误：请求参数错误
        errorMessage = data?.message || '上传参数错误，请重试';
        console.error('400错误详情，请检查后端multer配置和FormData字段名是否匹配');
      } else {
        // 其他错误
        errorMessage = data?.message || `上传失败(${status})`;
      }
    } else if (error.code === 'ECONNABORTED') {
      // 请求超时
      errorMessage = '上传超时，请检查网络连接后重试';
    } else if (error.message) {
      // 其他错误
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

// 保存资料
const saveProfile = async () => {
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  try {
    // 上传头像（如果需要）
    let avatarUrl = form.value.avatar;
    if (selectedFile.value) {
      try {
        showToastMessage('正在上传头像...');
        avatarUrl = await uploadAvatar();
        showToastMessage('头像上传成功');
      } catch (error) {
        showToastMessage(`头像上传失败: ${error.message || '未知错误'}`);
        return;
      }
    }
    
    // 保存用户资料
    const saveData = {
      nickname: form.value.nickname?.trim() || '',
      avatar: avatarUrl
    };
    
    console.log('前端发送的保存数据:', saveData);
    
    const response = await request.put('/api/user/profile', saveData);
    
    console.log('后端返回的响应:', response);
    
    if (response.success) {
      showToastMessage('资料修改成功');
      
      console.log('========== 开始更新全局状态 ==========');
      console.log('当前用户信息:', userStore.userInfo);
      console.log('表单中的昵称:', form.value.nickname);
      console.log('上传的头像URL:', avatarUrl);
      
      // 更新全局状态
      const currentUser = userStore.userInfo || {};
      const updatedUser = {
        ...currentUser,
        nickname: form.value.nickname?.trim() || '',
        avatar: avatarUrl
      };
      console.log('准备更新的用户信息:', updatedUser);
      userStore.setUser(updatedUser);
      console.log('全局状态已更新:', userStore.userInfo);
      console.log('localStorage中的userInfo:', JSON.parse(localStorage.getItem('userInfo') || 'null'));
      
      // 强制拉取最新数据确保一致性
      console.log('开始拉取最新用户数据...');
      await fetchLatestProfileForForm();
      console.log('拉取完成，当前用户信息:', userStore.userInfo);
      
      // 通知父组件刷新
      window.dispatchEvent(new CustomEvent('refreshProfile'));
      window.dispatchEvent(new CustomEvent('refreshPosts'));
      
      // 延迟返回上一页
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      showToastMessage(response.message || '保存失败');
    }
  } catch (error) {
    console.error('保存资料失败:', error);
    const errorMessage = error.response?.data?.message || error.message || '保存失败，请重试';
    
    if (errorMessage.includes('用户名') || errorMessage.includes('重复')) {
      errors.value.username = errorMessage;
    } else {
      showToastMessage(errorMessage);
    }
  } finally {
    loading.value = false;
  }
};

// 取消编辑
const cancelEdit = () => {
  router.back();
};

// 显示提示消息
const showToastMessage = (message) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 2000);
};

// 强制拉取后端最新用户资料初始化表单
const fetchLatestProfileForForm = async () => {
  loading.value = true;
  
  try {
    const response = await request.get('/api/user/profile');
    
    console.log('后端返回的用户数据:', response);
    
    if (response.success) {
      const user = response.user || response.data || {};
      
      form.value = {
        username: user.username?.trim() || '',
        nickname: user.nickname?.trim() || (user.username || ''),
        avatar: user.avatar || ''
      };
      // 同步更新全局状态
      userStore.setUserInfo(user);
      console.log('表单已从后端最新数据初始化:', form.value);
    } else {
      initForm();
    }
  } catch (error) {
    console.error('拉取最新资料失败:', error);
    showToastMessage('加载资料失败，请重试');
    initForm();
  } finally {
    loading.value = false;
  }
};

// 初始化表单数据（兜底逻辑）
const initForm = () => {
  const user = userStore.userInfo || {};
  form.value = {
    username: user.username || '',
    nickname: user.nickname || (user.username || ''),
    avatar: user.avatar || ''
  };
  console.log('表单已从全局状态初始化:', form.value);
};

// 组件卸载时清理预览URL
onUnmounted(() => {
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value);
  }
});

// 组件挂载时初始化
onMounted(() => {
  fetchLatestProfileForForm();
});
</script>
