<template>
  <div>
    <div class="bg-[#1552ab] py-6 px-4">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-3">
          <img src="../../img/logo.png" alt="智慧小警平台" class="h-12 object-contain" />
          <h1 class="text-white font-black text-2xl">智慧小警平台</h1>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto mt-6 pb-24">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">热门帖子</h2>
        <p class="text-gray-500">点赞数超过10的热门内容</p>
      </div>

      <div v-if="loading" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
      <div v-else-if="error" class="text-center text-red-500 py-10">
        <div class="flex flex-col items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>{{ error }}</div>
          <button 
            class="btn-primary px-4 py-2 rounded"
            @click="fetchHotPosts"
          >
            重新加载
          </button>
        </div>
      </div>
      <div v-else-if="posts.length === 0" class="text-center py-10">
        <div class="flex flex-col items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div class="text-gray-500">暂无热门帖子</div>
          <div class="text-sm text-gray-400">点赞数超过10的帖子会显示在这里</div>
        </div>
      </div>
      <div v-else class="space-y-4 pb-8">
        <PostCard 
          v-for="post in posts" 
          :key="post.id" 
          :post="post"
          :is-hot="true"
          @click="navigateToPost(post.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import PostCard from '../components/PostCard.vue';
import request from '../utils/request';

const router = useRouter();
const posts = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchHotPosts = async () => {
  loading.value = true;
  error.value = null;
  try {
    console.log('开始获取热门帖子列表...');
    const response = await request.get('/api/posts/hot');
    console.log('获取热门帖子响应:', response);
    
    if (response && response.success) {
      if (response.data) {
        posts.value = response.data.list || response.data;
        console.log('成功获取热门帖子列表，共', posts.value.length, '条');
      } else {
        console.warn('热门帖子数据为空');
        posts.value = [];
      }
    } else {
      throw new Error(response?.message || '接口请求失败');
    }
  } catch (err) {
    error.value = '获取热门帖子失败，请稍后重试';
    console.error('获取热门帖子失败:', err);
    console.error('错误详情:', err.response || err.message);
  } finally {
    loading.value = false;
    console.log('获取热门帖子列表完成，loading状态:', loading.value);
  }
};

const navigateToPost = (id) => {
  router.push(`/post/${id}`);
};

const handleRefreshPosts = () => {
  console.log('收到刷新帖子列表事件，重新获取热门帖子数据...');
  fetchHotPosts();
};

onMounted(() => {
  fetchHotPosts();
  
  window.addEventListener('refreshPosts', handleRefreshPosts);
});

onUnmounted(() => {
  window.removeEventListener('refreshPosts', handleRefreshPosts);
});
</script>

<style scoped>
.hot-page {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>
