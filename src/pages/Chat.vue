<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">随便说说</h1>
    
    <!-- 帖子列表 -->
    <div v-if="loading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-10">
      {{ error }}
    </div>
    <div v-else-if="posts.length === 0" class="text-center text-gray-500 py-10">
      暂无随便说说帖子
    </div>
    <div v-else class="space-y-4">
      <PostCard 
        v-for="post in posts" 
        :key="post.id" 
        :post="post"
        @click="navigateToPost(post.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PostCard from '../components/PostCard.vue';
import request from '../utils/request';

const router = useRouter();
const posts = ref([]);
const loading = ref(false);
const error = ref(null);

// 获取帖子列表
const fetchPosts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await request.get('/api/posts', { params: { tag: '随便说说' } });
    console.log('获取随便说说帖子响应:', response);
    // 根据后端返回的数据格式，帖子列表在 response.data.list 中
    if (response && response.success) {
      if (response.data) {
        // 优先使用response.data.list（后端实际返回的数据结构）
        posts.value = response.data.list || response.data.posts || response.data;
      } else {
        throw new Error('数据结构不正确');
      }
    } else {
      throw new Error('获取帖子失败');
    }
  } catch (err) {
    error.value = '获取帖子失败';
    console.error('获取帖子失败:', err);
  } finally {
    loading.value = false;
  }
};

// 跳转到帖子详情页
const navigateToPost = (id) => {
  router.push(`/post/${id}`);
};

// 组件挂载时获取数据
onMounted(() => {
  fetchPosts();
});
</script>