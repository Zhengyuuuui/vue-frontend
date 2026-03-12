import axios from 'axios'

// 创建axios实例
const request = axios.create({
  // ✅ 核心修复：生产环境直接写死 Render 后端地址
  // 本地开发时，你可以临时注释掉这行，换回 '' 走 proxy
  baseURL: 'https://campus-wall-backend.onrender.com', 
  timeout: 10000, // 请求超时时间（保留原有）
  headers: {
    'Content-Type': 'application/json' // 保留原有
  }
})

// 👇 下面的拦截器代码完全不动，原样保留
// 请求拦截器（可以在这里添加token）
request.interceptors.request.use(
  config => {
    console.log('实际请求URL：', config.url)
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
    return response.data
  },
  error => {
    console.error('请求错误:', error);
    if (!error.response) {
      console.error('网络错误：无法连接到后端服务，请检查服务是否运行');
    }
    return Promise.reject(error)
  }
)

export default request