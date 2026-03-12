import axios from 'axios'

// 创建axios实例
const request = axios.create({
  // 核心修改：本地开发用空字符串（走Vite proxy），生产环境用Render后端地址
  baseURL: import.meta.env.VITE_BACKEND_URL || '', 
  timeout: 10000, // 请求超时时间（保留原有配置）
  headers: {
    'Content-Type': 'application/json' // 保留原有请求头
  }
})

// 请求拦截器（可以在这里添加token）
request.interceptors.request.use(
  config => {
    // 打印最终请求URL（保留原有打印逻辑）
    console.log('实际请求URL：', config.url)
    
    // 从本地存储获取token，如果有就添加到请求头（保留原有token逻辑）
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器（统一处理返回结果）
request.interceptors.response.use(
  response => {
    return response.data // 保留原有响应处理
  },
  error => {
    console.error('请求错误:', error);
    // 网络错误处理（保留原有错误逻辑）
    if (!error.response) {
      console.error('网络错误：无法连接到后端服务，请检查服务是否运行');
    }
    return Promise.reject(error)
  }
)

export default request