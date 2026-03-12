<template>
  <div class="card cursor-pointer relative overflow-hidden" @click="$emit('click')" :data-post-id="post.id">
    <!-- 热门标识 -->
    <div v-if="isHot" class="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-0">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      热门
    </div>
    
    <!-- 帖子头部 -->
    <div class="flex items-start justify-between">
      <div class="flex items-start gap-3">
        <!-- 【关键修复点：用户头像渲染 - 使用统一的头像工具函数】 -->
        <img 
          :src="fullUserAvatarUrl" 
          alt="用户头像" 
          class="w-10 h-10 rounded-full object-cover"
          @load="() => handleAvatarLoad(fullUserAvatarUrl.value)"
          @error="handleAvatarError"
        >
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <div>
              <h3 class="font-semibold text-gray-900">{{ post.nickname || post.user?.nickname || post.username || post.user?.username || '匿名用户' }}</h3>
              <p class="text-sm text-gray-500">@{{ post.username || post.user?.username || 'anonymous' }}</p>
            </div>
            <span class="text-xs text-gray-500">{{ formatTime(post.created_at) }}</span>
          </div>
          <div class="mt-1">
            <span class="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {{ post.tag }}
            </span>
          </div>
        </div>
      </div>
      <button class="p-2 rounded-full hover:bg-gray-100 transition-colors" @click.stop>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-gray-600">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
    
    <!-- 帖子内容 -->
    <div class="mt-4">
      <p class="text-gray-800" v-html="highlightKeyword(post.content)"></p>
      
      <!-- 图片展示 -->
      <div v-if="post.images && post.images.length > 0" class="mt-3">
        <div v-if="post.images.length === 1" class="aspect-video rounded-lg overflow-hidden">
          <img :src="post.images[0]" alt="帖子图片" class="w-full h-full object-cover">
        </div>
        <div v-else-if="post.images.length === 2" class="grid grid-cols-2 gap-2">
          <div v-for="(image, index) in post.images" :key="index" class="aspect-square rounded-lg overflow-hidden">
            <img :src="image" alt="帖子图片" class="w-full h-full object-cover">
          </div>
        </div>
        <div v-else class="grid grid-cols-3 gap-2">
          <div v-for="(image, index) in post.images" :key="index" class="aspect-square rounded-lg overflow-hidden">
            <img :src="image" alt="帖子图片" class="w-full h-full object-cover">
          </div>
        </div>
      </div>
    </div>
    
    <!-- 互动数据 -->
    <div class="mt-4 pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between text-sm text-gray-500">
        <div class="flex items-center gap-6">
          <span class="flex items-center gap-1 like-count">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {{ post.likes }}
          </span>
          <span class="flex items-center gap-1">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {{ post.comments || post.comments_count || 0 }}
          </span>
          <span class="flex items-center gap-1">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {{ post.shares }}
          </span>
        </div>
        <span>{{ post.views }} 浏览</span>
      </div>
      
      <!-- 互动按钮 -->
      <div class="mt-4 flex items-center justify-around">
        <button 
          class="flex items-center justify-center gap-2 flex-1 py-2 rounded-lg hover:bg-gray-100 transition-colors like-button"
          :class="likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-600'"
          @click.stop="handleLike(post.id)"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>点赞</span>
        </button>
        <button 
          class="flex items-center justify-center gap-2 flex-1 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          @click.stop="handleComment(post.id)"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>评论</span>
        </button>
        <button 
          class="flex items-center justify-center gap-2 flex-1 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          @click.stop="handleShare(post.id)"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>分享</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import request from '../utils/request';
import { useAvatar, handleAvatarError, handleAvatarLoad } from '../utils/avatar';

const router = useRouter();

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  isHot: {
    type: Boolean,
    default: false
  },
  searchKeyword: {
    type: String,
    default: ''
  }
})

defineEmits(['click', 'like', 'comment', 'share'])

// 点赞状态管理
const likedPosts = ref(new Set());
const likeLoading = ref(new Map());

// 初始化点赞状态
if (props.post.is_liked) {
  likedPosts.value.add(props.post.id);
}

// 【关键修复点：使用统一的头像工具函数】
// 优先使用post.user.avatar，如果没有则使用post.avatar（兼容不同的数据结构）
const userAvatar = computed(() => props.post.user?.avatar || props.post.avatar);
const fullUserAvatarUrl = useAvatar(userAvatar);

// 处理点赞
const handleLike = async (postId) => {
  // 检查登录状态
  const token = localStorage.getItem('token');
  if (!token) {
    if (confirm('请先登录后点赞，是否立即登录？')) {
      router.push('/login');
    }
    return;
  }
  
  // 防止重复点击
  if (likeLoading.value.get(postId)) {
    return;
  }
  
  // 记录原始状态
  const wasLiked = likedPosts.value.has(postId);
  const postElement = document.querySelector(`[data-post-id="${postId}"]`);
  const likeCountElement = postElement?.querySelector('.like-count');
  const likeButtonElement = postElement?.querySelector('.like-button');
  const originalLikeCount = likeCountElement ? parseInt(likeCountElement.textContent) || 0 : 0;
  
  // 立即更新UI（乐观更新）
  if (wasLiked) {
    // 取消点赞
    likedPosts.value.delete(postId);
    if (likeButtonElement) {
      likeButtonElement.classList.remove('text-red-500');
      likeButtonElement.classList.add('text-gray-600');
    }
    if (likeCountElement) {
      likeCountElement.textContent = Math.max(0, originalLikeCount - 1);
    }
  } else {
    // 点赞
    likedPosts.value.add(postId);
    if (likeButtonElement) {
      likeButtonElement.classList.add('text-red-500');
      likeButtonElement.classList.remove('text-gray-600');
    }
    if (likeCountElement) {
      likeCountElement.textContent = originalLikeCount + 1;
    }
  }
  
  // 设置加载状态
  likeLoading.value.set(postId, true);
  
  try {
    const response = await request.post(`/api/posts/${postId}/like`);
    if (!response || !response.success) {
      // 请求失败，回滚状态
      if (wasLiked) {
        likedPosts.value.add(postId);
        if (likeButtonElement) {
          likeButtonElement.classList.add('text-red-500');
          likeButtonElement.classList.remove('text-gray-600');
        }
        if (likeCountElement) {
          likeCountElement.textContent = originalLikeCount;
        }
      } else {
        likedPosts.value.delete(postId);
        if (likeButtonElement) {
          likeButtonElement.classList.remove('text-red-500');
          likeButtonElement.classList.add('text-gray-600');
        }
        if (likeCountElement) {
          likeCountElement.textContent = originalLikeCount;
        }
      }
      alert(response?.message || '操作失败');
    }
  } catch (err) {
    console.error('点赞操作失败:', err);
    // 网络错误，回滚状态
    if (wasLiked) {
      likedPosts.value.add(postId);
      if (likeButtonElement) {
        likeButtonElement.classList.add('text-red-500');
        likeButtonElement.classList.remove('text-gray-600');
      }
      if (likeCountElement) {
        likeCountElement.textContent = originalLikeCount;
      }
    } else {
      likedPosts.value.delete(postId);
      if (likeButtonElement) {
        likeButtonElement.classList.remove('text-red-500');
        likeButtonElement.classList.add('text-gray-600');
      }
      if (likeCountElement) {
        likeCountElement.textContent = originalLikeCount;
      }
    }
    if (err.response?.status === 401) {
      alert('请先登录后操作');
    } else {
      alert('网络错误，请重试');
    }
  } finally {
    // 清除加载状态
    likeLoading.value.delete(postId);
  }
};

// 处理评论
const handleComment = (postId) => {
  router.push(`/post/${postId}`);
};

// 处理分享
const handleShare = async (postId) => {
  try {
    const url = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(url);
    alert('链接已复制到剪贴板');
    
    // 调用分享接口
    try {
      await request.post(`/api/posts/${postId}/share`);
    } catch (err) {
      console.error('记录分享失败:', err);
    }
  } catch (err) {
    console.error('复制链接失败:', err);
    alert('复制链接失败');
  }
};

// 格式化时间
const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString();
};

// 高亮关键词
const highlightKeyword = (text) => {
  if (!text || !props.searchKeyword) {
    return text;
  }
  
  const keyword = props.searchKeyword.trim();
  if (!keyword) {
    return text;
  }
  
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<span class="bg-yellow-200">$1</span>');
};
</script>

<style scoped>
.card {
  position: relative;
}
</style>
