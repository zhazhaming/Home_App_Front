import axios from 'axios';
import { useUserStore } from '../stores/userStore';
import { ElMessage } from 'element-plus';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || 'http://localhost:8100',
  timeout: 15000
});

// 是否正在刷新token
let isRefreshing = false;
// 重试队列，每一项将是一个待执行的函数形式
let retryRequests = [];

// 请求拦截器
service.interceptors.request.use(
  config => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data;
  },
  async error => {
    // 如果响应状态码是401（未授权）或者响应中包含token过期的信息
    if (error.response && (error.response.status === 401 || 
        (error.response.data && error.response.data.code === 401))) {
      
      const userStore = useUserStore();
      const originalRequest = error.config;
      
      // 如果没有refresh_token，直接登出
      if (!userStore.refresh_token) {
        userStore.logout();
        ElMessage.error('登录已过期，请重新登录');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // 如果不是刷新token的请求，并且还没有正在刷新
      if (!originalRequest._retry && !isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
          // 尝试使用refresh_token获取新的token
          const response = await axios.post('http://localhost:8100/user/refresh?id='+userStore.id, {
            refresh_token: userStore.refresh_token
          });
          
          if (response.data.code === 200) {
            // 更新token
            const newToken = response.data.data.token;
            userStore.token = newToken;
            localStorage.setItem('user_token', newToken);
            
            // 更新当前请求的Authorization头
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            
            // 执行队列中的请求
            retryRequests.forEach(cb => cb(newToken));
            // 清空队列
            retryRequests = [];
            
            // 重试当前请求
            return service(originalRequest);
          } else {
            // 刷新token失败，登出
            userStore.logout();
            ElMessage.error('登录已过期，请重新登录');
            window.location.href = '/login';
            return Promise.reject(error);
          }
        } catch (refreshError) {
          // 刷新token出错，登出
          userStore.logout();
          ElMessage.error('登录已过期，请重新登录');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (isRefreshing) {
        // 将请求加入队列
        return new Promise((resolve) => {
          retryRequests.push((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(service(originalRequest));
          });
        });
      }
    }
    
    // 其他错误直接返回
    return Promise.reject(error);
  }
);

export default service;