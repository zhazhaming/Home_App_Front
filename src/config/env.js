// 环境配置管理
export const ENV_CONFIG = {
  // 应用信息
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'MY HOME',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // API配置
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://120.78.1.49:8100',
  // API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  
  // 环境判断
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  
  // 文件上传配置
  MAX_FILE_SIZE: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024,
  UPLOAD_URL: import.meta.env.VITE_UPLOAD_URL || 'http://120.78.1.49:8100//api/files/uploadPic',
  // UPLOAD_URL: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:8100//api/files/uploadPic',
  
  // 缓存配置
  CACHE_PREFIX: import.meta.env.VITE_CACHE_PREFIX || 'my_home_',
  CACHE_EXPIRE: Number(import.meta.env.VITE_CACHE_EXPIRE) || 86400000,
  
  // 主题配置
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'light',
  THEME_COLOR: import.meta.env.VITE_THEME_COLOR || '#409eff',
  
  // 分页配置
  DEFAULT_PAGE_SIZE: Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10,
  MAX_PAGE_SIZE: Number(import.meta.env.VITE_MAX_PAGE_SIZE) || 100
};

// 开发环境特殊配置
if (ENV_CONFIG.IS_DEV) {
  console.log('🚀 开发环境配置:', ENV_CONFIG);
}

// 生产环境特殊配置
if (ENV_CONFIG.IS_PROD) {
  // 生产环境可以添加特殊配置
  console.log('🏭 生产环境');
}
