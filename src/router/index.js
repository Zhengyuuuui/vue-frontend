import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue')
  },
  {
    path: '/lost-found',
    name: 'LostFound',
    component: () => import('../pages/LostFound.vue')
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../pages/Chat.vue')
  },
  {
    path: '/meet-people',
    name: 'MeetPeople',
    component: () => import('../pages/MeetPeople.vue')
  },
  {
    path: '/second-hand',
    name: 'SecondHand',
    component: () => import('../pages/SecondHand.vue')
  },
  {
    path: '/hot',
    name: 'Hot',
    component: () => import('../pages/Hot.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: () => import('../pages/PostDetail.vue')
  },
  {
    path: '/post-form',
    name: 'PostForm',
    component: () => import('../pages/PostForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: () => import('../pages/EditProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../pages/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../pages/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !token) {
    // 未登录用户访问需要登录的页面
    if (to.path !== '/login') {
      // 显示提示消息（通过URL参数传递）
      next({ 
        path: '/login', 
        query: { redirect: to.fullPath, message: '请先登录' } 
      });
      return;
    }
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && userInfo.role !== 'admin') {
    // 非管理员用户访问管理员页面
    next({ 
      path: '/', 
      query: { message: '无管理员权限' } 
    });
    return;
  }
  
  next();
});

export default router;