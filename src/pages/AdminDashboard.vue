<template>
  <div class="max-w-4xl mx-auto px-4">
    <!-- 顶部导航 -->
    <div class="flex justify-between items-center mb-6 pt-4">
      <h1 class="text-xl font-bold text-gray-900">管理员后台</h1>
      <button 
        class="btn-secondary px-4 py-2 text-sm"
        @click="navigateToProfile"
      >
        返回管理员主页
      </button>
    </div>

    <!-- 管理员功能卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 帖子管理 -->
      <div class="card p-6 cursor-pointer hover:shadow-md transition-shadow" @click="navigateToPosts">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">帖子管理</h3>
            <p class="text-sm text-gray-500">查看和管理所有帖子</p>
          </div>
        </div>
      </div>

      <!-- 公告管理 -->
      <div class="card p-6 cursor-pointer hover:shadow-md transition-shadow" @click="navigateToAnnouncements">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">公告管理</h3>
            <p class="text-sm text-gray-500">发布和管理公告</p>
          </div>
        </div>
      </div>

      <!-- 用户管理 -->
      <div class="card p-6 cursor-pointer hover:shadow-md transition-shadow" @click="navigateToUsers">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">用户管理</h3>
            <p class="text-sm text-gray-500">查看和管理用户</p>
          </div>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="card p-6 cursor-pointer hover:shadow-md transition-shadow" @click="navigateToStats">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">统计数据</h3>
            <p class="text-sm text-gray-500">查看平台统计信息</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

// 导航到个人中心
const navigateToProfile = () => {
  router.push('/profile');
};

// 导航到帖子管理
const navigateToPosts = () => {
  router.push('/admin');
};

// 导航到公告管理
const navigateToAnnouncements = () => {
  router.push('/admin');
};

// 导航到用户管理
const navigateToUsers = () => {
  router.push('/admin');
};

// 导航到统计数据
const navigateToStats = () => {
  router.push('/admin');
};
</script>

<style scoped>
.card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}
</style>
