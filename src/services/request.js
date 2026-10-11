import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/userStore';
import { ENV_CONFIG } from '../config/env';
import { API_STATUS, ERROR_MESSAGES } from '../constants/api';

// 创建axios实例
const service = axios.create({
  baseURL: ENV_CONFIG.API_BASE_URL,
  timeout: ENV_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 是否正在刷新token
let isRefreshing = false;
// 重试队列
let retryRequests = [];

// 判断是否为登录过期错误（后端登录过期返回业务码509，HTTP状态同样是509）
function isAuthExpiredError(error) {
  const status = error.response?.status;
  const code = error.response?.data?.code;
  return status === API_STATUS.UNAUTHORIZED || code === API_STATUS.UNAUTHORIZED ||
         status === 509 || code === 509;
}

// 请求拦截器
service.interceptors.request.use(
  config => {
    const userStore = useUserStore();
    
    // 添加认证头
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`;
    }
    
    // 添加请求时间戳（防止缓存）
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    // 开发环境打印请求信息
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log('🚀 API Request:', {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data
      });
    }
    
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 开发环境打印响应信息
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    
    return response.data;
  },
  async error => {
    const userStore = useUserStore();
    const originalRequest = error.config;
    
    // 处理登录过期（401或后端509）
    if (isAuthExpiredError(error)) {

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
          // 后端/user/refresh使用@RequestParam接收id，必须以query参数传递
          const response = await axios.post(`${ENV_CONFIG.API_BASE_URL}/user/refresh`, null, {
            params: { id: userStore.user_id }
          });

          if (response.data.code === API_STATUS.SUCCESS && response.data.data?.token) {
            // 更新token（setUserInfo内部会同步localStorage）
            userStore.setUserInfo({
              user_id: userStore.user_id,
              username: userStore.username,
              email: userStore.email,
              token: response.data.data.token,
              refresh_token: response.data.data.refreshToken || userStore.refresh_token,
              avatar: userStore.avatar
            });
            const newToken = response.data.data.token;

            // 更新当前请求的Authorization头
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

            // 执行队列中的请求
            retryRequests.forEach(cb => cb(newToken));
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
          // 刷新token出错（如长效token也已失效），登出并回到登录页
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
    
    // 处理其他错误
    const errorMessage = getErrorMessage(error);
    ElMessage.error(errorMessage);
    
    return Promise.reject(error);
  }
);

// 获取错误消息
function getErrorMessage(error) {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.msg;
    
    if (message) {
      return message;
    }
    
    return ERROR_MESSAGES[status] || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  
  if (error.request) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

export default service;
