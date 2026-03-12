<template>
  <div class="max-w-6xl mx-auto px-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-bold">管理员后台</h1>
      <button 
        class="btn-secondary px-4 py-2 text-sm"
        @click="navigateToProfile"
      >
        返回“我的”
      </button>
    </div>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 class="text-gray-600 mb-2 text-sm">帖子总数量</h3>
        <p class="text-3xl font-bold text-blue-600">{{ totalPosts }}</p>
        <p class="text-xs text-gray-500 mt-1">平台累计发布的帖子总数</p>
      </div>
      <div class="card p-6 bg-gradient-to-r from-green-50 to-teal-50">
        <h3 class="text-gray-600 mb-2 text-sm">总用户数量</h3>
        <p class="text-3xl font-bold text-green-600">{{ totalUsers }}</p>
        <p class="text-xs text-gray-500 mt-1">平台累计注册的用户总数</p>
      </div>
    </div>
    
    <!-- 公告管理模块 -->
    <div class="card mb-6">
      <h2 class="text-lg font-medium mb-4">公告管理</h2>
      
      <!-- 发布公告表单 -->
      <div class="mb-6">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">公告内容</label>
          <textarea 
            v-model="announcementForm.content" 
            placeholder="请输入公告内容" 
            class="input-field w-full resize-none text-sm" 
            rows="4"
            :class="{ 'border-red-500': announcementErrors.content }"
          ></textarea>
          <p v-if="announcementErrors.content" class="text-red-500 text-xs mt-1">{{ announcementErrors.content }}</p>
        </div>
        <div class="flex justify-end">
          <button 
            class="btn-primary px-6 py-2 text-sm" 
            @click="publishAnnouncement"
            :disabled="announcementLoading"
          >
            <span v-if="announcementLoading">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              发布中...
            </span>
            <span v-else>发布公告</span>
          </button>
        </div>
      </div>
      
      <!-- 公告列表 -->
      <div>
        <h3 class="text-md font-medium mb-3">已发布公告</h3>
        <div v-if="announcementsLoading" class="flex justify-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
        </div>
        <div v-else-if="announcements.length === 0" class="text-center text-gray-500 py-6">
          暂无公告
        </div>
        <div v-else class="space-y-3">
          <div v-for="announcement in announcements" :key="announcement.id" class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-gray-800 text-sm mb-2">{{ announcement.content }}</p>
                <p class="text-xs text-gray-500">{{ formatTime(announcement.created_at) }}</p>
              </div>
              <button 
                class="text-red-500 hover:text-red-700 ml-4"
                @click="deleteAnnouncement(announcement.id)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 帖子管理列表 -->
    <div class="card">
      <h2 class="text-lg font-medium mb-4">帖子管理</h2>
      
      <div v-if="loading" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
      <div v-else-if="posts.length === 0" class="text-center text-gray-500 py-10">
        暂无帖子
      </div>
      <div v-else class="space-y-3">
        <div v-for="post in posts" :key="post.id" class="border border-gray-200 rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{{ post.tag }}</span>
                <span class="text-xs text-gray-500">ID: {{ post.id }}</span>
                <span class="text-xs text-gray-500">{{ formatTime(post.created_at) }}</span>
              </div>
              <p class="text-gray-800 text-sm mb-2">{{ post.content }}</p>
              <p class="text-xs text-gray-500">发布者: {{ post.username || post.user?.username || '匿名用户' }}</p>
            </div>
            <button 
              class="text-red-500 hover:text-red-700 ml-4"
              @click="deletePost(post.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import request from '../utils/request';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const posts = ref([]);
const totalPosts = ref(0);
const totalUsers = ref(0);

const announcements = ref([]);
const announcementsLoading = ref(false);
const announcementForm = ref({
  content: ''
});
const announcementErrors = ref({
  content: ''
});
const announcementLoading = ref(false);

const showToast = ref(false);
const toastMessage = ref('');

// 检查权限
const checkPermission = () => {
  if (!userStore.isLoggedIn) {
    showToastMessage('请先登录');
    router.push('/');
    return false;
  }
  
  if (userStore.userInfo?.role !== 'admin') {
    showToastMessage('无管理员权限');
    router.push('/');
    return false;
  }
  
  return true;
};

// 导航到“我的”页面
const navigateToProfile = () => {
  router.push('/profile');
};

// 公告表单校验
const validateAnnouncement = () => {
  announcementErrors.value.content = '';
  
  if (!announcementForm.value.content.trim()) {
    announcementErrors.value.content = '公告内容不能为空';
    return false;
  }
  
  return true;
};

// 发布公告
const publishAnnouncement = async () => {
  if (!validateAnnouncement()) {
    return;
  }
  
  announcementLoading.value = true;
  try {
    const response = await request.post('/api/admin/announcements', {
      content: announcementForm.value.content.trim()
    });
    
    if (response.success) {
      showToastMessage('公告发布成功');
      announcementForm.value.content = '';
      // 刷新公告列表
      await fetchAnnouncements();
    } else {
      // 根据后端返回的具体原因提示
      const errorMessage = response.message || '发布失败';
      if (errorMessage.includes('无管理员权限')) {
        showToastMessage('无管理员权限，无法发布公告');
      } else if (errorMessage.includes('服务器错误')) {
        showToastMessage('服务器错误，请稍后重试');
      } else {
        showToastMessage(errorMessage);
      }
    }
  } catch (error) {
    console.error('发布公告失败:', error);
    
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      showToastMessage('网络异常，请稍后重试');
    } else if (error.response?.status === 401) {
      showToastMessage('请先登录');
    } else if (error.response?.status === 403) {
      showToastMessage('无管理员权限');
    } else if (error.response?.status === 500) {
      showToastMessage('服务器错误，请稍后重试');
    } else {
      const errorMessage = error.response?.data?.message || '发布失败，请重试';
      showToastMessage(errorMessage);
    }
  } finally {
    announcementLoading.value = false;
  }
};

// 获取公告列表
const fetchAnnouncements = async () => {
  announcementsLoading.value = true;
  try {
    const response = await request.get('/api/admin/announcements');
    if (response && response.data) {
      announcements.value = response.data.announcements || response.data;
    }
  } catch (error) {
    console.error('获取公告列表失败:', error);
  } finally {
    announcementsLoading.value = false;
  }
};

// 删除公告
const deleteAnnouncement = async (id) => {
  if (!confirm('确定要删除这条公告吗？')) return;
  
  try {
    const response = await request.delete(`/api/admin/announcements/${id}`);
    if (response.success) {
      announcements.value = announcements.value.filter(announcement => announcement.id !== id);
      showToastMessage('删除成功');
    }
  } catch (error) {
    console.error('删除公告失败:', error);
    showToastMessage('删除失败');
  }
};

// 显示提示消息
const showToastMessage = (message) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 2000);
};

// 格式化时间
const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString();
};

// 获取统计数据
const fetchStats = async () => {
  try {
    // 获取帖子总数
    const postsResponse = await request.get('/api/admin/posts/count');
    if (postsResponse && postsResponse.success) {
      // 兼容不同的响应格式
      totalPosts.value = postsResponse.data?.count || postsResponse.data?.total || postsResponse.data || 0;
    } else {
      // 如果接口不存在或失败，显示默认值
      totalPosts.value = 0;
    }
    
    // 获取用户总数
    const usersResponse = await request.get('/api/admin/users/count');
    if (usersResponse && usersResponse.success) {
      // 兼容不同的响应格式
      totalUsers.value = usersResponse.data?.count || usersResponse.data?.total || usersResponse.data || 0;
    } else {
      // 如果接口不存在或失败，显示默认值
      totalUsers.value = 0;
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
    totalPosts.value = 0;
    totalUsers.value = 0;
  }
};

// 获取所有帖子
const fetchAllPosts = async () => {
  loading.value = true;
  try {
    const response = await request.get('/api/admin/posts');
    if (response && response.success) {
      if (response.data && response.data.posts) {
        posts.value = response.data.posts;
      } else if (response.data) {
        posts.value = response.data;
      }
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    if (error.response?.status === 403) {
      showToastMessage('无管理员权限');
    } else {
      showToastMessage('获取帖子列表失败，请重试');
    }
  } finally {
    loading.value = false;
  }
};

// 删除帖子
const deletePost = async (id) => {
  // 参数校验
  if (!id || isNaN(id) || parseInt(id) <= 0) {
    showToastMessage('帖子ID非法，无法删除');
    return;
  }
  
  if (!confirm('确定要删除这条帖子吗？删除后不可恢复。')) return;
  
  try {
    const response = await request.delete(`/api/admin/posts/${parseInt(id)}`);
    if (response && response.success) {
      posts.value = posts.value.filter(post => post.id !== id);
      showToastMessage('帖子删除成功');
      fetchStats();
    } else {
      // 根据后端返回的信息提示具体错误
      const errorMessage = response?.message || '删除失败';
      showToastMessage(`删除失败：${errorMessage}`);
    }
  } catch (error) {
    console.error('删除帖子失败:', error);
    if (error.response?.status === 403) {
      showToastMessage('删除失败：您无管理员权限');
    } else if (error.response?.status === 404) {
      showToastMessage(`删除失败：帖子ID=${id} 不存在`);
    } else if (error.response?.status === 500) {
      showToastMessage('删除失败：服务器内部错误，请稍后重试');
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
      showToastMessage('删除失败：服务器无响应，请检查后端服务是否启动');
    } else {
      const errorMessage = error.response?.data?.message || '删除失败，请重试';
      showToastMessage(`删除失败：${errorMessage}`);
    }
  }
};

// 组件挂载时
onMounted(() => {
  if (checkPermission()) {
    fetchStats();
    fetchAllPosts();
    fetchAnnouncements();
  }
});
</script>