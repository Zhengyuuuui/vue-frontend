import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: '', // 使用相对路径，通过Vite代理转发到后端
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器（可以在这里添加token）
request.interceptors.request.use(
  config => {
    // 打印最终请求URL
    console.log('实际请求URL：', config.url)
    
    // 从本地存储获取token，如果有就添加到请求头
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
    // 网络错误处理
    if (!error.response) {
      console.error('网络错误：无法连接到后端服务，请检查服务是否运行');
    }
    return Promise.reject(error)
  }
)

export default request