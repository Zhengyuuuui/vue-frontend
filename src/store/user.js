import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: !!localStorage.getItem('token'),
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    token: localStorage.getItem('token') || ''
  }),
  getters: {
    // 全局统一昵称：有nickname显示nickname，无则显示username
    showNickname: (state) => {
      return state.userInfo?.nickname?.trim() || state.userInfo?.username || '匿名用户';
    }
  },
  actions: {
    login(userInfo, token) {
      this.isLoggedIn = true;
      this.userInfo = userInfo;
      this.token = token;
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    logout() {
      this.isLoggedIn = false;
      this.userInfo = null;
      this.token = '';
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
    updateUserInfo(info) {
      this.userInfo = info;
      localStorage.setItem('userInfo', JSON.stringify(info));
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      this.isLoggedIn = true;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    // 全量更新用户信息（核心：修改昵称后必须调用此方法）
    setUser(newUser) {
      this.userInfo = { ...this.userInfo, ...newUser };
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
    }
  }
});