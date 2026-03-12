<template>
  <div>
    <!-- 搜索框顶部栏 -->
    <div class="bg-[#1552ab] py-6 px-4">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <img src="../../img/logo.png" alt="智慧小警平台" class="h-12 object-contain" />
            <h1 class="text-white font-black text-2xl">智慧小警平台</h1>
          </div>
        </div>
        <div class="flex items-center w-full">
          <el-autocomplete
            v-model="searchKeyword"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="true"
            :debounce="300"
            placeholder="搜索帖子..."
            @select="handleSelect"
            @blur="handleBlur"
            @keyup.enter="searchPosts"
            class="flex-1"
            popper-class="search-autocomplete"
          >
            <template #prefix>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
            <template #suffix>
              <button 
                v-if="searchKeyword" 
                class="text-gray-400 hover:text-gray-600 mr-2"
                @click="resetSearch"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </template>
            <template #default="{ item }">
              <div class="py-2">
                <div class="text-sm text-gray-800">{{ item.content }}</div>
                <div class="text-xs text-gray-500">发布者: {{ item.nickname || item.username }}</div>
              </div>
            </template>
          </el-autocomplete>
          <button 
            class="btn-primary px-4 py-2 text-sm rounded ml-2 whitespace-nowrap"
            @click="searchPosts"
          >
            搜索
          </button>
        </div>
      </div>
    </div>
    
    <div class="max-w-4xl mx-auto mt-6">

    <!-- 公告栏 -->
    <div class="mb-6 bg-accent/10 rounded-lg p-4 overflow-hidden">
      <div class="flex items-center mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="font-medium text-accent">公告</h3>
      </div>
      <div class="relative">
        <div 
          v-if="announcements.length > 1" 
          class="overflow-hidden whitespace-nowrap"
        >
          <div 
            class="inline-block animate-marquee"
            :style="{ animationDuration: `${announcements.length * 5}s` }"
          >
            <span v-for="(announcement, index) in announcements" :key="announcement.id" class="mr-8">
              {{ announcement.content }}
            </span>
          </div>
        </div>
        <div v-else-if="announcements.length === 1" class="whitespace-normal">
          {{ announcements[0].content }}
        </div>
        <div v-else class="text-gray-400">暂无公告</div>
      </div>
    </div>

    <!-- 发帖按钮 -->
    <div class="mb-6">
      <button 
        class="btn-primary block text-center w-full py-3"
        @click="handlePostClick"
      >
        发布帖子
      </button>
    </div>

    <!-- 帖子列表 -->
    <div v-if="isSearching" class="flex justify-center py-10">
      <div class="text-gray-500">加载中...</div>
    </div>
    <div v-else-if="searchError" class="text-center text-red-500 py-10">
      {{ searchError }}
    </div>
    <div v-else-if="loading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-10">
      {{ error }}
    </div>
    <div v-else-if="posts.length === 0" class="text-center text-gray-500 py-10">
      <div v-if="searchKeyword">
        暂无匹配的帖子
      </div>
      <div v-else>
        暂无帖子，快来发布第一条吧
      </div>
    </div>
    <div v-else class="space-y-4">
      <PostCard 
        v-for="post in posts" 
        :key="post.id" 
        :post="post"
        :search-keyword="searchKeyword"
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
const announcements = ref([]);
const posts = ref([]);
const loading = ref(false);
const error = ref(null);
const searchKeyword = ref('');
const isSearching = ref(false);
const searchError = ref(null);

// 获取公告列表
const fetchAnnouncements = async () => {
  try {
    const response = await request.get('/api/announcement');
    console.log('获取公告响应:', response);
    
    // 简化响应处理逻辑
    if (response && response.success) {
      // 统一处理响应格式
      if (response.data) {
        // 优先使用response.data.list（后端实际返回的数据结构），如果没有则使用response.data
        announcements.value = response.data.list || response.data;
      } else {
        announcements.value = [];
      }
    } else {
      console.warn('获取公告失败:', response?.message || '未知错误');
      announcements.value = [];
    }
    
    console.log('公告列表:', announcements.value);
  } catch (error) {
    console.error('获取公告失败:', error);
    // 发生错误时，保持公告列表为空，不影响页面其他功能
    announcements.value = [];
  }
};

// 获取帖子列表
const fetchPosts = async () => {
  loading.value = true;
  error.value = null;
  try {
    console.log('开始获取帖子列表...');
    const response = await request.get('/api/posts');
    console.log('获取帖子响应:', response);
    
    // 简化响应处理逻辑
    if (response && response.success) {
      // 统一处理响应格式
      if (response.data) {
        // 优先使用response.data.list（后端实际返回的数据结构），如果没有则使用response.data
        posts.value = response.data.list || response.data;
        console.log('成功获取帖子列表，共', posts.value.length, '条');
      } else {
        console.warn('帖子数据为空');
        posts.value = [];
      }
    } else {
      throw new Error(response?.message || '接口请求失败');
    }
  } catch (err) {
    error.value = '获取帖子失败，请稍后重试';
    console.error('获取帖子失败:', err);
    console.error('错误详情:', err.response || err.message);
  } finally {
    loading.value = false;
    console.log('获取帖子列表完成，loading状态:', loading.value);
  }
};

// 处理发帖按钮点击
const handlePostClick = () => {
  // 检查登录状态
  const token = localStorage.getItem('token');
  if (!token) {
    if (confirm('请先登录后发布帖子，是否立即登录？')) {
      router.push('/login');
    }
    return;
  }
  
  // 已登录用户，正常跳转到发帖页面
  router.push('/post-form');
};

// 跳转到帖子详情页
const navigateToPost = (id) => {
  router.push(`/post/${id}`);
};

// 搜索帖子
const searchPosts = async () => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    resetSearch();
    return;
  }
  
  isSearching.value = true;
  searchError.value = null;
  
  try {
    const response = await request.get('/api/posts/search', {
      params: { keyword }
    });
    
    if (response && response.success) {
      posts.value = response.data?.list || response.data || [];
    } else {
      throw new Error(response?.message || '搜索失败');
    }
  } catch (err) {
    searchError.value = '搜索失败，请稍后重试';
    console.error('搜索帖子失败:', err);
  } finally {
    isSearching.value = false;
  }
};

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = '';
  searchError.value = null;
  fetchPosts();
};



// 处理搜索联想（el-autocomplete的fetch-suggestions函数）
const querySearch = async (queryString, callback) => {
  try {
    let response;
    if (queryString) {
      // 有关键词，搜索匹配的帖子
      response = await request.get('/api/posts/search', {
        params: { keyword: queryString }
      });
    } else {
      // 无关键词，获取最近发布的帖子
      response = await request.get('/api/posts');
    }
    
    if (response && response.success) {
      const posts = response.data?.list || response.data || [];
      // 处理帖子数据，限制最多10条，截取内容前20字符
      const suggestions = posts.slice(0, 10).map(post => ({
        id: post.id,
        value: post.id.toString(),
        content: post.content.length > 20 ? post.content.substring(0, 20) + '...' : post.content,
        nickname: post.nickname || post.user?.nickname,
        username: post.username || post.user?.username
      }));
      callback(suggestions);
    } else {
      callback([]);
    }
  } catch (err) {
    console.error('搜索联想失败:', err);
    callback([]);
  }
};

// 处理选择下拉项
const handleSelect = (item) => {
  // 跳转至帖子详情页
  router.push(`/post/${item.id}`);
  // 清空搜索框
  searchKeyword.value = '';
};

// 处理blur事件
const handleBlur = () => {
  // 这里可以添加blur时的处理逻辑
  // el-autocomplete会自动处理下拉框的关闭
};

// 定义事件处理函数
const handleRefreshPosts = () => {
  console.log('收到刷新帖子列表事件，重新获取帖子数据...');
  fetchPosts();
};

// 组件挂载时获取数据
onMounted(() => {
  fetchAnnouncements();
  fetchPosts();
  
  // 监听昵称修改事件，刷新帖子列表
  window.addEventListener('refreshPosts', handleRefreshPosts);
});

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('refreshPosts', handleRefreshPosts);
});
</script>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.animate-marquee {
  animation: marquee linear infinite;
}
/* 搜索下拉框样式 */
:deep(.search-autocomplete) {
  width: 100%;
  max-width: 100%;
}

:deep(.el-autocomplete) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  border-radius: 0.5rem;
}

:deep(.el-input__prefix) {
  margin-right: 0.5rem;
}

:deep(.el-input__suffix) {
  padding-right: 0.5rem;
}
</style>