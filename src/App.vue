<template>
  <div class="min-h-screen flex flex-col">
    <!-- 电脑端侧边栏导航 -->
    <aside class="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4">
      <div class="flex items-center justify-center mb-8">
        <h1 class="text-2xl font-bold text-primary">校园墙</h1>
      </div>
      <nav>
        <router-link to="/" class="nav-item mb-2" :class="{ active: $route.path === '/' }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>首页</span>
        </router-link>
        <router-link to="/lost-found" class="nav-item mb-2" :class="{ active: $route.path === '/lost-found' }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>失物招领</span>
        </router-link>
        <router-link to="/chat" class="nav-item mb-2" :class="{ active: $route.path === '/chat' }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>随便说说</span>
        </router-link>
        <router-link to="/meet-people" class="nav-item mb-2" :class="{ active: $route.path === '/meet-people' }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>捞人</span>
        </router-link>
        <router-link to="/second-hand" class="nav-item mb-2" :class="{ active: $route.path === '/second-hand' }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>出闲置</span>
        </router-link>
        <router-link to="/hot" class="nav-item mb-2" :class="{ active: $route.path === '/hot' }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>热门</span>
        </router-link>
        <div v-if="isLoggedIn" class="nav-item mb-2" @click="navigateToProfile">
          <img 
            :src="fullUserAvatarUrl" 
            alt="用户头像" 
            class="w-5 h-5 rounded-full object-cover"
            @load="() => handleAvatarLoad(fullUserAvatarUrl.value)"
            @error="handleAvatarError"
          >
          <span>{{ userInfo?.nickname || userInfo?.username }}</span>
        </div>
        <router-link v-if="isLoggedIn && userInfo?.role === 'admin'" to="/admin" class="nav-item mb-2" :class="{ active: $route.path === '/admin' }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>管理员后台</span>
        </router-link>
        <router-link v-else to="/login" class="nav-item mb-2" :class="{ active: $route.path === '/login' }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>登录/注册</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主内容区域 -->
    <main class="flex-1 lg:ml-64 p-4 md:p-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 手机端底部导航 -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
      <router-link to="/" class="flex flex-col items-center py-2" :class="{ active: $route.path === '/' }">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs mt-1">首页</span>
      </router-link>
      
      <!-- 分类下拉菜单 -->
        <div class="relative" ref="categoryMenuRef">
          <button @click="showCategoryMenu = !showCategoryMenu" class="flex flex-col items-center py-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span class="text-xs mt-1">分类</span>
          </button>
          
          <!-- 分类菜单 -->
          <div v-if="showCategoryMenu" class="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl p-3 w-52 z-50 border border-gray-200">
            <router-link 
              to="/lost-found" 
              class="category-option block px-4 py-3 rounded-lg border border-gray-200 bg-white hover:border-primary hover:shadow-lg hover:scale-105 transition-all duration-200" 
              @click.native="showCategoryMenu = false"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="font-medium text-gray-800">失物招领</span>
              </div>
            </router-link>
            <router-link 
              to="/chat" 
              class="category-option block px-4 py-3 rounded-lg border border-gray-200 bg-white hover:border-primary hover:shadow-lg hover:scale-105 transition-all duration-200" 
              @click.native="showCategoryMenu = false"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <span class="font-medium text-gray-800">随便说说</span>
              </div>
            </router-link>
            <router-link 
              to="/meet-people" 
              class="category-option block px-4 py-3 rounded-lg border border-gray-200 bg-white hover:border-primary hover:shadow-lg hover:scale-105 transition-all duration-200" 
              @click.native="showCategoryMenu = false"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span class="font-medium text-gray-800">捞人</span>
              </div>
            </router-link>
            <router-link 
              to="/second-hand" 
              class="category-option block px-4 py-3 rounded-lg border border-gray-200 bg-white hover:border-primary hover:shadow-lg hover:scale-105 transition-all duration-200" 
              @click.native="showCategoryMenu = false"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span class="font-medium text-gray-800">出闲置</span>
              </div>
            </router-link>
          </div>
        </div>
      
      <router-link to="/hot" class="flex flex-col items-center py-2" :class="{ active: $route.path === '/hot' }">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span class="text-xs mt-1">热门</span>
      </router-link>
      
      <router-link to="/profile" class="flex flex-col items-center py-2" :class="{ active: $route.path === '/profile' }">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs mt-1">我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './store/user';
import { useAvatar, handleAvatarError, handleAvatarLoad } from './utils/avatar';
import { useClickOutside } from './hooks/useClickOutside';

const router = useRouter();
const userStore = useUserStore();
const showCategoryMenu = ref(false);
const categoryMenuRef = ref(null);

// 【关键修复点：使用useClickOutside Hook实现点击外部关闭下拉菜单】
useClickOutside(categoryMenuRef, () => {
  showCategoryMenu.value = false;
});

// 计算属性：用户是否登录
const isLoggedIn = computed(() => userStore.isLoggedIn);
// 计算属性：用户信息
const userInfo = computed(() => userStore.userInfo);

// 【关键修复点：使用统一的头像工具函数】
const userAvatar = computed(() => userInfo.value?.avatar);
const fullUserAvatarUrl = useAvatar(userAvatar);

// 导航到个人中心
const navigateToProfile = () => {
  router.push('/profile');
};

// 定义事件处理函数
const handleRefreshProfile = () => {
  console.log('收到用户信息更新事件，刷新用户头像...');
  // 强制刷新用户信息，创建新对象触发响应式更新
  userStore.setUser({ ...userStore.userInfo });
};

// 组件挂载时，从localStorage加载用户信息
onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    // 这里可以添加获取用户信息的逻辑
    // 暂时先使用store中的默认值
  }
  
  // 监听用户信息更新事件
  window.addEventListener('refreshProfile', handleRefreshProfile);
});

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('refreshProfile', handleRefreshProfile);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.nav-item {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors;
}

.nav-item.active {
  @apply bg-primary/10 text-primary font-medium;
}

nav a.active {
  @apply text-primary font-medium;
}

.category-option {
  @apply relative overflow-hidden;
}

.category-option:hover {
  @apply transform scale-105;
}

.category-option:active {
  @apply transform scale-95;
}

.category-option .w-8 {
  @apply transition-transform duration-300;
}

.category-option:hover .w-8 {
  @apply transform scale-110 rotate-3;
}
</style>