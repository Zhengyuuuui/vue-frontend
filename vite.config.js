import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 判断当前环境：development（本地开发）/ production（线上生产）
  const isDev = mode === 'development'
  
  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          // 本地开发时 proxy 指向 localhost:3000（保留原有功能），线上不生效
          target: isDev ? 'http://localhost:3000' : '',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api') // 保留原有 rewrite 规则
        }
      }
    },
    // 定义全局环境变量，供 request.js 读取（核心：生产环境指向 Render 后端）
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(
        isDev ? '' : 'https://campus-wall-backend.onrender.com'
      )
    }
  }
})