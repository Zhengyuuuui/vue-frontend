import { defineStore } from 'pinia';
import request from '../utils/request';

export const usePostStore = defineStore('post', {
  state: () => ({
    posts: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchPosts(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request.get('/api/posts', { params });
        this.posts = response.data.data;
        return response.data.data;
      } catch (error) {
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    async fetchHotPosts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await request.get('/api/posts/hot');
        this.posts = response.data.data;
        return response.data.data;
      } catch (error) {
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    addPost(post) {
      this.posts.unshift(post);
    },
    updatePost(id, updates) {
      const index = this.posts.findIndex(post => post.id === id);
      if (index !== -1) {
        this.posts[index] = { ...this.posts[index], ...updates };
      }
    },
    deletePost(id) {
      this.posts = this.posts.filter(post => post.id !== id);
    }
  }
});