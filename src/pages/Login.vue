<template>
  <div class="max-w-md mx-auto">
    <div class="card p-6">
      <h1 class="text-2xl font-bold mb-6 text-center">{{ isLogin ? '登录' : '注册' }}</h1>
      
      <!-- 登录表单 -->
      <div v-if="isLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input 
            type="text" 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            class="input-field w-full"
          />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input 
            type="password" 
            v-model="loginForm.password" 
            placeholder="请输入密码" 
            class="input-field w-full"
          />
        </div>
        <button 
          class="btn-primary w-full" 
          @click="handleLogin"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <div class="text-center mt-4">
          <span class="text-gray-600">还没有账号？</span>
          <button 
            class="text-primary hover:underline ml-1" 
            @click="isLogin = false"
          >
            立即注册
          </button>
        </div>
      </div>
      
      <!-- 注册表单 -->
      <div v-else>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input 
            type="text" 
            v-model="registerForm.username" 
            placeholder="请输入用户名（仅支持数字和字母）" 
            class="input-field w-full"
            :class="{ 'border-red-500': usernameError }"
            @input="checkUsername"
          />
          <p v-if="usernameError" class="text-red-500 text-xs mt-1">{{ usernameErrorMsg }}</p>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input 
            type="password" 
            v-model="registerForm.password" 
            placeholder="请输入密码" 
            class="input-field w-full"
          />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
          <input 
            type="password" 
            v-model="registerForm.confirmPassword" 
            placeholder="请再次输入密码" 
            class="input-field w-full"
          />
        </div>
        <button 
          class="btn-primary w-full" 
          @click="handleRegister"
          :disabled="loading"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <div class="text-center mt-4">
          <span class="text-gray-600">已有账号？</span>
          <button 
            class="text-primary hover:underline ml-1" 
            @click="isLogin = true"
          >
            立即登录
          </button>
        </div>
      </div>
    </div>
    
    <!-- 提示 -->
    <div v-if="showToast" class="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import request from '../utils/request';

const router = useRouter();
const userStore = useUserStore();
const isLogin = ref(true);
const loading = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

// 登录表单
const loginForm = ref({
  username: '',
  password: ''
});

// 注册表单
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
});

// 用户名校验状态
const usernameError = ref(false);
const usernameErrorMsg = ref('');

// 用户名正则：仅数字和字母（大小写）
const usernameReg = /^[a-zA-Z0-9]+$/;

// 实时输入校验
const checkUsername = () => {
  const val = registerForm.value.username.trim();
  // 清空错误
  usernameError.value = false;
  usernameErrorMsg.value = '';

  if (!val) {
    usernameError.value = true;
    usernameErrorMsg.value = '用户名不能为空';
  } else if (!usernameReg.test(val)) {
    usernameError.value = true;
    usernameErrorMsg.value = '用户名仅支持数字和字母';
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

// 处理登录
const handleLogin = async () => {
  // 校验
  if (!loginForm.value.username.trim()) {
    showToastMessage('请输入用户名');
    return;
  }
  if (!loginForm.value.password) {
    showToastMessage('请输入密码');
    return;
  }
  
  loading.value = true;
  try {
    const response = await request.post('/api/auth/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    });
    
    if (response.success) {
      // 存储token和用户信息
      localStorage.setItem('token', response.data.token);
      userStore.setUserInfo(response.data.user);
      showToastMessage('登录成功！');
      // 根据用户角色跳转到不同页面
      const redirectPath = response.data.user.role === 'admin' ? '/admin' : '/';
      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    } else {
      showToastMessage(response.message || '登录失败');
    }
  } catch (error) {
    console.error('登录失败:', error);
    showToastMessage('登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};

// 处理注册
const handleRegister = async () => {
  // 先执行用户名校验
  checkUsername();
  
  // 密码校验
  if (!registerForm.value.password) {
    showToastMessage('请输入密码');
    return;
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    showToastMessage('两次输入的密码不一致');
    return;
  }
  
  // 若有用户名错误，阻止提交
  if (usernameError.value) {
    showToastMessage(usernameErrorMsg.value);
    return;
  }
  
  loading.value = true;
  try {
    const response = await request.post('/api/auth/register', {
      username: registerForm.value.username,
      password: registerForm.value.password
    });
    
    if (response.success) {
      showToastMessage('注册成功，请登录！');
      // 跳转到登录页
      setTimeout(() => {
        isLogin.value = true;
      }, 1500);
    } else {
      showToastMessage(response.message || '注册失败');
    }
  } catch (error) {
    console.error('注册失败:', error);
    showToastMessage('注册失败，用户名可能已被占用');
  } finally {
    loading.value = false;
  }
};
</script>