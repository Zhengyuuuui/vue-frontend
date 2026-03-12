<template>
  <div class="max-w-4xl mx-auto">
    <!-- 返回按钮 -->
    <div class="mb-4">
      <button 
        class="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
        @click="router.push('/')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>返回首页</span>
      </button>
    </div>
    
    <!-- 帖子详情 -->
    <div v-if="loading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-10">
      {{ error }}
    </div>
    <div v-else-if="!post" class="text-center text-gray-500 py-10">
      帖子不存在
    </div>
    <div v-else class="card mb-6">
      <!-- 帖子头部 -->
      <div class="flex items-start mb-4">
        <img 
          :src="fullPostUserAvatarUrl" 
          alt="头像" 
          class="w-10 h-10 rounded-full mr-3"
          @load="() => handleAvatarLoad(fullPostUserAvatarUrl)"
          @error="handleAvatarError"
        >
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <div>
              <h3 class="font-medium text-gray-900">{{ postUserNickname || post.username || post.user?.username || '匿名用户' }}</h3>
              <p class="text-sm text-gray-500">@{{ post.username || post.user?.username || 'anonymous' }}</p>
            </div>
            <span class="text-xs text-gray-500">{{ formatTime(post.created_at) }}</span>
          </div>
          <div class="mt-1">
            <span class="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{{ post.tag }}</span>
          </div>
        </div>
      </div>

      <!-- 帖子内容 -->
      <div class="mb-4">
        <p>{{ post.content }}</p>
      </div>

      <!-- 帖子图片 -->
      <div v-if="post.images && post.images.length > 0" class="mb-4 grid grid-cols-2 gap-2">
        <img 
          v-for="(image, index) in post.images" 
          :key="index" 
          :src="image" 
          alt="帖子图片" 
          class="w-full h-48 object-cover rounded-lg"
        >
      </div>

      <!-- 帖子操作 -->
      <div class="flex justify-around pt-4 border-t border-gray-100">
        <button 
          class="flex items-center gap-1 transition-colors" 
          :class="post.is_liked ? 'text-red-500' : 'text-gray-600 hover:text-primary'"
          @click="handleLike"
          :disabled="likeLoading"
        >
          <svg v-if="likeLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{{ post.likes }}</span>
        </button>
        <button class="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{{ post.comments || post.comments_count || 0 }}</span>
        </button>
        <button class="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors" @click="showSharePanel = true">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{{ post.shares }}</span>
        </button>
      </div>
    </div>

    <!-- 评论区 -->
    <div v-if="post" class="mb-6">
      <h2 class="text-lg font-medium mb-4">评论 ({{ comments.length }})</h2>

      <!-- 评论输入框 -->
      <div class="card mb-4">
        <textarea 
          v-model="commentContent" 
          placeholder="写下你的评论..." 
          class="w-full border-none focus:outline-none resize-none" 
          rows="3"
        ></textarea>
        <div class="flex justify-end pt-2 border-t border-gray-100">
          <button 
            class="btn-primary text-sm flex items-center gap-2" 
            @click="postComment"
            :disabled="!commentContent.trim() || commentLoading"
          >
            <svg v-if="commentLoading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ commentLoading ? '发布中...' : '发布评论' }}</span>
          </button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div v-if="commentsLoading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
      <div v-else-if="comments.length === 0" class="text-center text-gray-500 py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-sm">暂无评论，快来第一条评论吧</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="comment in comments" :key="comment.id" class="card">
          <div class="flex items-start">
            <img 
              :src="getCommentAvatarUrl(comment)" 
              alt="头像" 
              class="w-8 h-8 rounded-full mr-3"
              @load="() => handleAvatarLoad(getCommentAvatarUrl(comment))"
              @error="handleAvatarError"
            >
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-sm text-gray-900">{{ comment.nickname || comment.user?.nickname || comment.username || comment.user?.username || '匿名用户' }}</h4>
                  <p class="text-xs text-gray-500">@{{ comment.username || comment.user?.username || 'anonymous' }}</p>
                </div>
                <span class="text-xs text-gray-500">{{ formatTime(comment?.created_at) }}</span>
              </div>
              <p class="text-sm mt-1">{{ comment.content }}</p>
              <div class="flex items-center mt-2 text-xs text-gray-500">
                <button class="hover:text-primary mr-4" @click="replyToComment(comment)">回复</button>
                <button class="hover:text-primary">点赞</button>
              </div>
              
              <!-- 回复输入框 -->
              <div v-if="replyingTo === comment.id" class="mt-2">
                <textarea 
                  v-model="replyContent" 
                  :placeholder="'回复 @' + (comment.nickname || comment.user?.nickname || comment.username || comment.user?.username || '匿名用户') + '...'" 
                  class="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none" 
                  rows="2"
                ></textarea>
                <div class="flex justify-end mt-2">
                  <button class="btn-primary text-sm" @click="postReply(comment.id)">发布回复</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分享面板 -->
    <div v-if="showSharePanel" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showSharePanel = false">
      <div class="bg-white rounded-lg p-6 w-80" @click.stop>
        <h3 class="text-lg font-medium mb-4">分享帖子</h3>
        <div class="space-y-3">
          <button class="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" @click="copyLink">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>复制链接</span>
          </button>
        </div>
        <button class="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 transition-colors" @click="showSharePanel = false">
          取消
        </button>
      </div>
    </div>

    <!-- 提示 -->
    <div v-if="showToast" class="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import request from '../utils/request';
import { getAvatarUrl, handleAvatarError, handleAvatarLoad } from '../utils/avatar';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const postId = computed(() => route.params.id);

const post = ref(null);
const comments = ref([]);
const loading = ref(false);
const error = ref(null);
const commentsLoading = ref(false);
const commentContent = ref('');
const replyContent = ref('');
const replyingTo = ref(null);
const showSharePanel = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const likeLoading = ref(false);
const commentLoading = ref(false);

// 【关键修复点1：使用统一的头像工具函数 + 从全局状态获取最新用户信息】
const postUserAvatar = computed(() => {
  const postUserId = post.value?.user?.id;
  const currentUser = userStore.userInfo;
  
  // 【关键修复点2：如果帖子作者就是当前登录用户，优先使用全局状态中的最新头像】
  // 使用宽松相等（==）比较，避免字符串和数字类型不匹配
  if (postUserId && currentUser && String(currentUser.id) === String(postUserId)) {
    console.log('========== PostDetail.vue 使用全局状态中的用户头像 ==========');
    console.log('帖子作者ID:', postUserId, '类型:', typeof postUserId);
    console.log('当前登录用户ID:', currentUser.id, '类型:', typeof currentUser.id);
    console.log('全局状态中的头像:', currentUser.avatar);
    console.log('===========================================');
    return currentUser.avatar;
  }
  
  // 否则使用帖子接口返回的头像（优先使用post.avatar，兼容不同的数据结构）
  const avatar = post.value?.avatar || post.value?.user?.avatar;
  console.log('========== PostDetail.vue 使用帖子接口返回的用户头像 ==========');
  console.log('帖子作者ID:', postUserId, '类型:', typeof postUserId);
  console.log('post.avatar:', post.value?.avatar);
  console.log('post.user.avatar:', post.value?.user?.avatar);
  console.log('最终使用的头像:', avatar);
  console.log('===========================================');
  return avatar;
});

const fullPostUserAvatarUrl = computed(() => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return getAvatarUrl(postUserAvatar.value, baseURL);
});

// 【关键修复点3：昵称也优先使用全局状态中的最新昵称】
const postUserNickname = computed(() => {
  const postUserId = post.value?.user?.id;
  const currentUser = userStore.userInfo;
  
  // 如果帖子作者就是当前登录用户，优先使用全局状态中的最新昵称
  if (postUserId && currentUser && String(currentUser.id) === String(postUserId)) {
    console.log('========== PostDetail.vue 使用全局状态中的用户昵称 ==========');
    console.log('帖子作者ID:', postUserId, '类型:', typeof postUserId);
    console.log('当前登录用户ID:', currentUser.id, '类型:', typeof currentUser.id);
    console.log('全局状态中的昵称:', currentUser.nickname);
    console.log('===========================================');
    return currentUser.nickname;
  }
  
  // 否则使用帖子接口返回的昵称（优先使用post.nickname，兼容不同的数据结构）
  const nickname = post.value?.nickname || post.value?.user?.nickname;
  console.log('========== PostDetail.vue 使用帖子接口返回的用户昵称 ==========');
  console.log('帖子作者ID:', postUserId, '类型:', typeof postUserId);
  console.log('post.nickname:', post.value?.nickname);
  console.log('post.user.nickname:', post.value?.user?.nickname);
  console.log('最终使用的昵称:', nickname);
  console.log('===========================================');
  return nickname;
});

const getCommentAvatarUrl = (comment) => {
  const avatar = comment?.avatar || comment?.user?.avatar;
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return getAvatarUrl(avatar, baseURL);
};

// 获取帖子详情
const fetchPostDetail = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await request.get(`/api/posts/${postId.value}`);
    if (response && response.success) {
      // 兼容不同的响应格式
      if (response.data) {
        post.value = response.data.data || response.data;
        
        // 【关键修复点6：如果帖子作者就是当前登录用户，用全局状态中的最新用户信息覆盖】
        const currentUser = userStore.userInfo;
        const postUserId = post.value?.user?.id;
        
        if (postUserId && currentUser && String(currentUser.id) === String(postUserId)) {
          console.log('========== PostDetail.vue fetchPostDetail 检测到帖子作者是当前登录用户 ==========');
          console.log('帖子作者ID:', postUserId, '类型:', typeof postUserId);
          console.log('当前登录用户ID:', currentUser.id, '类型:', typeof currentUser.id);
          console.log('帖子接口返回的头像:', post.value?.user?.avatar);
          console.log('全局状态中的头像:', currentUser.avatar);
          console.log('帖子接口返回的昵称:', post.value?.user?.nickname);
          console.log('全局状态中的昵称:', currentUser.nickname);
          console.log('用全局状态中的用户信息覆盖帖子详情中的用户信息...');
          
          // 用全局状态中的最新用户信息覆盖帖子详情中的用户信息
          post.value.user = {
            ...post.value.user,
            avatar: currentUser.avatar,
            nickname: currentUser.nickname
          };
          
          // 同时更新post.avatar和post.nickname字段，确保与首页数据结构一致
          post.value.avatar = currentUser.avatar;
          post.value.nickname = currentUser.nickname;
          
          console.log('覆盖完成，帖子详情中的用户信息已更新');
          console.log('更新后的头像:', post.value.user.avatar);
          console.log('更新后的昵称:', post.value.user.nickname);
          console.log('更新后的post.avatar:', post.value.avatar);
          console.log('更新后的post.nickname:', post.value.nickname);
          console.log('===========================================');
        }
      } else {
        error.value = '帖子不存在';
      }
    } else {
      error.value = '帖子不存在';
    }
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = '帖子不存在';
    } else {
      error.value = '获取帖子详情失败';
    }
    console.error('获取帖子详情失败:', err);
  } finally {
    loading.value = false;
  }
};

// 获取评论列表
const fetchComments = async () => {
  commentsLoading.value = true;
  try {
    const response = await request.get(`/api/posts/${postId.value}/comments`);
    if (response && response.success) {
      // 兼容不同的响应格式
      let commentsData = [];
      if (response.data) {
        commentsData = response.data.data || response.data.list || response.data || [];
      }
      
      // 按创建时间正序排列（新评论在最下方）
      commentsData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      comments.value = commentsData;
    }
  } catch (err) {
    console.error('获取评论失败:', err);
    showToastMessage('加载评论失败，请刷新重试');
  } finally {
    commentsLoading.value = false;
  }
};

// 发布评论
const postComment = async () => {
  // 检查登录状态
  const token = localStorage.getItem('token');
  if (!token) {
    showToastMessage('请先登录后评论');
    setTimeout(() => {
      if (confirm('是否立即登录？')) {
        router.push('/login');
      }
    }, 500);
    return;
  }
  
  // 校验评论内容
  if (!commentContent.value.trim()) {
    showToastMessage('评论内容不能为空');
    return;
  }
  
  // 防止重复点击
  if (commentLoading.value) return;
  
  commentLoading.value = true;
  
  try {
    const response = await request.post(`/api/posts/${postId.value}/comments`, {
      content: commentContent.value.trim()
    });
    
    if (response && response.success) {
      // 清空输入框
      commentContent.value = '';
      
      // 刷新评论列表
      await fetchComments();
      
      // 更新帖子评论数
      if (post.value) {
        if ('comments' in post.value) {
          post.value.comments = (post.value.comments || 0) + 1;
        } else {
          post.value.comments_count = (post.value.comments_count || 0) + 1;
        }
      }
      
      showToastMessage('评论发布成功');
    } else {
      // 根据后端返回的具体原因提示
      const errorMessage = response?.message || '评论发布失败';
      if (errorMessage.includes('不存在')) {
        showToastMessage('帖子不存在');
      } else if (errorMessage.includes('违规') || errorMessage.includes('敏感')) {
        showToastMessage('评论内容包含违规信息');
      } else if (errorMessage.includes('频繁')) {
        showToastMessage('评论发布过于频繁，请稍后再试');
      } else {
        showToastMessage(errorMessage);
      }
    }
  } catch (err) {
    console.error('发布评论失败:', err);
    
    if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
      showToastMessage('网络异常，请稍后重试');
    } else if (err.response?.status === 401) {
      showToastMessage('请先登录后评论');
    } else if (err.response?.status === 404) {
      showToastMessage('帖子不存在');
    } else if (err.response?.status === 400) {
      const errorMessage = err.response?.data?.message || '评论发布失败';
      if (errorMessage.includes('违规')) {
        showToastMessage('评论内容包含违规信息');
      } else {
        showToastMessage(errorMessage);
      }
    } else {
      showToastMessage('评论发布失败，请稍后重试');
    }
  } finally {
    commentLoading.value = false;
  }
};

// 回复评论
const replyToComment = (comment) => {
  replyingTo.value = comment.id;
  replyContent.value = `@${comment?.nickname || comment?.user?.nickname || comment?.username || comment?.user?.username || '匿名用户'} `;
};

// 发布回复
const postReply = async (commentId) => {
  // 检查登录状态
  const token = localStorage.getItem('token');
  if (!token) {
    if (confirm('请先登录后回复，是否立即登录？')) {
      router.push('/login');
    }
    return;
  }
  
  if (!replyContent.value.trim()) {
    showToastMessage('回复内容不能为空');
    return;
  }
  
  try {
    const response = await request.post(`/api/posts/${postId.value}/comments`, {
      content: replyContent.value,
      parent_id: commentId
    });
    
    if (response && response.data) {
      const newComment = response.data.data || response.data;
      comments.value.unshift(newComment);
      replyContent.value = '';
      replyingTo.value = null;
      
      // 更新帖子评论数
      if (post.value) {
        if ('comments' in post.value) {
          post.value.comments = (post.value.comments || 0) + 1;
        } else {
          post.value.comments_count = (post.value.comments_count || 0) + 1;
        }
      }
      
      showToastMessage('回复发布成功');
    } else {
      showToastMessage('回复发布失败');
    }
  } catch (err) {
    console.error('发布回复失败:', err);
    if (err.response?.status === 401) {
      showToastMessage('请先登录后回复');
    } else {
      showToastMessage('回复发布失败，请重试');
    }
  }
};

// 处理点赞
const handleLike = async () => {
  // 检查登录状态
  const token = localStorage.getItem('token');
  if (!token) {
    showToastMessage('请先登录后点赞');
    setTimeout(() => {
      if (confirm('是否立即登录？')) {
        router.push('/login');
      }
    }, 500);
    return;
  }
  
  // 防止重复点击
  if (likeLoading.value) return;
  
  // 记录原始状态
  const wasLiked = post.value.is_liked;
  const originalLikes = post.value.likes;
  
  // 立即更新UI（乐观更新）
  if (wasLiked) {
    // 取消点赞
    post.value.likes = Math.max(0, post.value.likes - 1);
    post.value.is_liked = false;
  } else {
    // 点赞
    post.value.likes++;
    post.value.is_liked = true;
  }
  
  likeLoading.value = true;
  
  try {
    const response = await request.post(`/api/posts/${postId.value}/like`);
    
    if (response && response.success) {
      // 请求成功，显示相应提示
      if (wasLiked) {
        showToastMessage('取消点赞成功');
      } else {
        showToastMessage('点赞成功');
      }
    } else {
      // 请求失败，回滚状态
      post.value.likes = originalLikes;
      post.value.is_liked = wasLiked;
      
      // 根据后端返回的具体原因提示
      const errorMessage = response?.message || '操作失败';
      if (errorMessage.includes('已点赞')) {
        showToastMessage('您已经点赞过此帖子');
      } else if (errorMessage.includes('不存在')) {
        showToastMessage('帖子不存在');
      } else {
        showToastMessage(errorMessage);
      }
    }
  } catch (err) {
    console.error('点赞操作失败:', err);
    
    // 网络错误，回滚状态
    post.value.likes = originalLikes;
    post.value.is_liked = wasLiked;
    
    if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
      showToastMessage('网络异常，请稍后重试');
    } else if (err.response?.status === 401) {
      showToastMessage('请先登录后点赞');
    } else if (err.response?.status === 404) {
      showToastMessage('帖子不存在');
    } else if (err.response?.status === 400) {
      const errorMessage = err.response?.data?.message || '操作失败';
      showToastMessage(errorMessage);
    } else {
      showToastMessage('操作失败，请稍后重试');
    }
  } finally {
    likeLoading.value = false;
  }
};

// 复制链接
const copyLink = async () => {
  try {
    const url = `${window.location.origin}/post/${postId.value}`;
    await navigator.clipboard.writeText(url);
    showToastMessage('链接已复制');
    showSharePanel.value = false;
    
    // 调用分享接口
    try {
      const response = await request.post(`/api/posts/${postId.value}/share`);
      if (response && response.success && post.value) {
        post.value.shares++;
      }
    } catch (err) {
      console.error('记录分享失败:', err);
    }
  } catch (err) {
    console.error('复制链接失败:', err);
    showToastMessage('复制链接失败');
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
  const date = new Date(time);
  return date.toLocaleString();
};

// 【关键修复点4：监听postId变化，路由参数更新后重新拉取数据】
watch(postId, (newPostId, oldPostId) => {
  console.log('========== PostDetail.vue postId变化 ==========');
  console.log('旧的postId:', oldPostId);
  console.log('新的postId:', newPostId);
  console.log('===========================================');
  
  if (newPostId && newPostId !== oldPostId) {
    fetchPostDetail();
    fetchComments();
  }
});

// 【关键修复点5：监听全局用户信息更新，触发后重新计算头像/昵称】
watch(() => userStore.userInfo, (newUserInfo, oldUserInfo) => {
  console.log('========== PostDetail.vue 用户信息更新 ==========');
  console.log('旧的用户信息:', oldUserInfo);
  console.log('新的用户信息:', newUserInfo);
  console.log('帖子作者ID:', post.value?.user?.id, '类型:', typeof post.value?.user?.id);
  console.log('当前登录用户ID:', newUserInfo?.id, '类型:', typeof newUserInfo?.id);
  console.log('===========================================');
  
  // 如果帖子作者就是当前登录用户，用户信息更新后自动刷新
  // 使用宽松相等（==）比较，避免字符串和数字类型不匹配
  if (post.value?.user?.id && newUserInfo && String(newUserInfo.id) === String(post.value.user.id)) {
    console.log('帖子作者就是当前登录用户，用户信息已更新');
    console.log('更新帖子详情中的用户信息...');
    
    // 用全局状态中的最新用户信息覆盖帖子详情中的用户信息
    post.value.user = {
      ...post.value.user,
      avatar: newUserInfo.avatar,
      nickname: newUserInfo.nickname
    };
    
    // 同时更新post.avatar和post.nickname字段，确保与首页数据结构一致
    post.value.avatar = newUserInfo.avatar;
    post.value.nickname = newUserInfo.nickname;
    
    console.log('更新完成，帖子详情中的用户信息已更新');
    console.log('更新后的头像:', post.value.user.avatar);
    console.log('更新后的昵称:', post.value.user.nickname);
    console.log('更新后的post.avatar:', post.value.avatar);
    console.log('更新后的post.nickname:', post.value.nickname);
    console.log('===========================================');
  }
}, { deep: true });

// 定义事件处理函数
const handleRefreshPosts = () => {
  console.log('收到刷新帖子事件，重新获取帖子详情...');
  if (postId.value) {
    fetchPostDetail();
  }
};

const handleRefreshProfile = () => {
  console.log('收到刷新用户资料事件，重新获取帖子数据...');
  if (postId.value) {
    fetchPostDetail();
    fetchComments();
  }
};

// 组件挂载时获取数据
onMounted(() => {
  if (postId.value) {
    fetchPostDetail();
    fetchComments();
  } else {
    error.value = '帖子ID不存在';
    loading.value = false;
  }
  
  // 监听昵称修改事件，刷新帖子详情
  window.addEventListener('refreshPosts', handleRefreshPosts);
  // 监听用户资料更新事件，刷新帖子详情
  window.addEventListener('refreshProfile', handleRefreshProfile);
});

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('refreshPosts', handleRefreshPosts);
  window.removeEventListener('refreshProfile', handleRefreshProfile);
});
</script>