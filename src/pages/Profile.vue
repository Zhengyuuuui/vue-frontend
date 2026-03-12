<template>
  <div class="max-w-4xl mx-auto px-4">
    <!-- 未登录状态 -->
    <div v-if="!isLoggedIn" class="min-h-screen flex flex-col justify-center items-center">
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <p class="text-base text-gray-600 mb-8">请先登录后查看个人信息</p>
        <div class="space-y-4 w-full max-w-xs">
          <button 
            class="btn-primary w-full py-3 text-base"
            @click="navigateToLogin"
          >
            立即登录
          </button>
          <button 
            class="btn-secondary w-full py-3 text-base"
            @click="navigateToRegister"
          >
            注册账号
          </button>
        </div>
      </div>
    </div>

    <!-- 已登录状态 -->
    <div v-else>
      <!-- 用户信息 -->
      <div class="card mb-6">
        <div class="flex items-center gap-4 p-4">
          <!-- 【关键修复点：头像渲染 - 使用统一的头像工具函数】 -->
          <img 
            :src="fullAvatarUrl" 
            alt="用户头像" 
            class="w-16 h-16 rounded-full object-cover"
            @load="() => handleAvatarLoad(fullAvatarUrl.value)"
            @error="handleAvatarError"
          >
          <div class="flex-1">
            <h2 class="text-lg font-medium text-gray-900">{{ userStore.showNickname }}</h2>
            <p class="text-sm text-gray-500">@{{ userStore.userInfo?.username }}</p>
          </div>
          <button 
            class="btn-secondary px-4 py-2 text-sm"
            @click="openEditProfile"
          >
            编辑资料
          </button>
          <!-- 管理员入口按钮 -->
          <button 
            v-if="userStore.userInfo?.role === 'admin'"
            class="btn-primary px-4 py-2 text-sm"
            @click="navigateToAdmin"
          >
            进入管理员后台
          </button>
        </div>
        
        <!-- 退出登录按钮 -->
        <div class="p-4 border-t border-gray-100">
          <button 
            class="w-full py-3 text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
            @click="handleLogout"
          >
            退出登录
          </button>
        </div>
      </div>

      <!-- Tab切换 -->
      <div class="card mb-6">
        <div class="flex border-b border-gray-200">
          <button 
            class="flex-1 py-3 text-center text-sm" 
            :class="activeTab === 'posts' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-600'"
            @click="activeTab = 'posts'; handleTabChange()"
          >
            我的帖子
          </button>
          <button 
            class="flex-1 py-3 text-center text-sm" 
            :class="activeTab === 'comments' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-600'"
            @click="activeTab = 'comments'; handleTabChange()"
          >
            收到的评论
          </button>
        </div>

        <!-- 我的帖子 -->
        <div v-if="activeTab === 'posts'" class="py-4">
          <div v-if="loading" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
          <div v-else-if="userPosts.length === 0" class="text-center text-gray-500 py-10">
            你还没有发布任何帖子
          </div>
          <div v-else class="space-y-3">
            <div v-for="post in userPosts" :key="post.id" class="card p-4">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{{ post.tag }}</span>
                    <span class="text-xs text-gray-500">{{ formatTime(post.created_at) }}</span>
                  </div>
                  <p class="text-gray-800 mb-2 text-sm">{{ post.content }}</p>
                  <div class="flex items-center text-xs text-gray-500">
                    <span class="mr-3">{{ post.likes || 0 }} 点赞</span>
                    <span class="mr-3">{{ post.comments || post.comments_count || 0 }} 评论</span>
                    <span>{{ post.shares || 0 }} 分享</span>
                  </div>
                </div>
                <button 
                  class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  @click="deletePost(post.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 收到的评论 -->
        <div v-if="activeTab === 'comments'" class="py-4">
          <div v-if="loading" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
          <div v-else-if="userComments.length === 0" class="text-center text-gray-500 py-10">
            你还没有收到任何评论
          </div>
          <div v-else class="space-y-3">
            <div v-for="comment in userComments" :key="comment.id" class="card p-4">
              <div class="flex items-start">
                <!-- 【关键修复点2：评论头像渲染 - 同样应用路径拼接和缓存处理】 -->
                <img 
                  :src="getCommentAvatarUrl(comment.user?.avatar)" 
                  alt="用户头像" 
                  class="w-8 h-8 rounded-full object-cover mr-3"
                  @error="onAvatarError"
                >
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="font-medium text-sm">{{ comment.user?.nickname || comment.user?.username }}</h4>
                    <span class="text-xs text-gray-500">{{ formatTime(comment.created_at) }}</span>
                  </div>
                  <p class="text-gray-800 my-2 text-sm">{{ comment.content }}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">
                      评论于：{{ formatPostContent(comment.post_content) }}
                    </span>
                    <div class="flex gap-2">
                      <button 
                        class="text-primary hover:underline text-xs" 
                        @click="navigateToPost(comment.post_id)"
                      >
                        查看帖子
                      </button>
                      <button 
                        class="text-primary hover:underline text-xs" 
                        @click="replyToComment(comment)"
                      >
                        回复
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import request from '../utils/request';
import { useAvatar, handleAvatarError, handleAvatarLoad } from '../utils/avatar';

const router = useRouter();
const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isLoggedIn);
const userInfo = computed(() => userStore.userInfo);

const activeTab = ref('posts');
const userPosts = ref([]);
const userComments = ref([]);
const loading = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

// 【关键修复点：使用统一的头像工具函数】
const userAvatar = computed(() => userStore.userInfo?.avatar);
const fullAvatarUrl = useAvatar(userAvatar);

// 【关键修复点：评论头像URL处理函数】
const getCommentAvatarUrl = (avatar) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return useAvatar(computed(() => avatar), baseURL).value;
};

// 【关键修复点10：监听用户信息变化，自动刷新头像】
watch(() => userStore.userInfo, (newUserInfo) => {
  console.log('========== 用户信息变化 ==========');
  console.log('新的用户信息:', newUserInfo);
  console.log('新的avatar:', newUserInfo?.avatar);
  console.log('计算后的头像URL:', fullAvatarUrl.value);
  console.log('===================================');
}, { deep: true });

// 获取我的帖子
const fetchUserPosts = async () => {
  loading.value = true;
  try {
    const response = await request.get('/api/user/posts');
    console.log('获取我的帖子响应:', response);
    if (response && response.data) {
      userPosts.value = response.data.posts || response.data;
    }
  } catch (error) {
    console.error('获取我的帖子失败:', error);
    userPosts.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取收到的评论
const fetchUserComments = async () => {
  loading.value = true;
  try {
    const response = await request.get('/api/user/comments');
    console.log('获取收到的评论响应:', response);
    if (response && response.data) {
      userComments.value = response.data.comments || response.data;
    }
  } catch (error) {
    console.error('获取收到的评论失败:', error);
    userComments.value = [];
  } finally {
    loading.value = false;
  }
};

// 删除帖子
const deletePost = async (id) => {
  if (!confirm('确定要删除这篇帖子吗？')) return;
  
  try {
    await request.delete(`/api/posts/${id}`);
    userPosts.value = userPosts.value.filter(post => post.id !== id);
    showToastMessage('删除成功');
  } catch (error) {
    console.error('删除帖子失败:', error);
    showToastMessage('删除失败');
  }
};

// 回复评论
const replyToComment = (comment) => {
  router.push(`/post/${comment.post_id}?focusComment=true&replyTo=${comment.id}`);
};

// 跳转到帖子详情页
const navigateToPost = (id) => {
  router.push(`/post/${id}`);
};

// 跳转到登录页面
const navigateToLogin = () => {
  router.push('/login');
};

// 跳转到注册页面
const navigateToRegister = () => {
  router.push('/login?tab=register');
};

// 打开编辑资料
const openEditProfile = () => {
  router.push('/edit-profile');
};

// 导航到管理员后台
const navigateToAdmin = () => {
  router.push('/admin/dashboard');
};

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    userStore.logout();
    showToastMessage('退出登录成功');
    setTimeout(() => {
      router.push('/login');
    }, 1000);
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

// 格式化帖子内容
const formatPostContent = (content) => {
  if (!content || content.trim() === '') {
    return '已删除帖子';
  }
  if (content.length <= 10) {
    return content;
  }
  return content.substring(0, 10) + '...';
};

// 切换Tab时获取对应数据
const handleTabChange = () => {
  if (activeTab.value === 'posts') {
    fetchUserPosts();
  } else if (activeTab.value === 'comments') {
    fetchUserComments();
  }
};

// 强制拉取后端最新用户资料
const fetchLatestProfile = async () => {
  try {
    console.log('========== 拉取最新用户资料 ==========');
    const response = await request.get('/api/user/profile');
    console.log('后端返回的用户数据:', response);
    
    const userData = response.data?.user || response.user;
    if (response.success !== false && userData) {
      userStore.setUserInfo(userData);
      console.log('用户资料已强制同步:', userData);
      console.log('同步后的全局状态:', userStore.userInfo);
      console.log('计算后的头像URL:', fullAvatarUrl.value);
      console.log('====================================');
    }
  } catch (error) {
    console.error('拉取最新资料失败:', error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  if (isLoggedIn.value) {
    fetchUserPosts();
    fetchLatestProfile();
    window.addEventListener('refreshProfile', fetchLatestProfile);
  }
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('refreshProfile', fetchLatestProfile);
});
</script>
