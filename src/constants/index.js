// 应用常量配置
export const APP_CONFIG = {
  // 应用信息
  APP_NAME: 'MY HOME',
  APP_VERSION: '1.0.0',
  
  // API配置
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://120.78.1.49:8100',
  API_TIMEOUT: 15000,
  
  // 分页配置
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // 文件上传配置
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // 缓存配置
  CACHE_PREFIX: 'my_home_',
  TOKEN_KEY: 'user_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_INFO_KEY: 'user_info',
  
  // 默认头像
  DEFAULT_AVATAR: 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg',
  
  // 路由配置
  LOGIN_PATH: '/login',
  HOME_PATH: '/',
  USER_CENTER_PATH: '/user/center',
  
  // 响应状态码
  HTTP_STATUS: {
    SUCCESS: 200,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  }
};

// 用户相关常量
export const USER_CONSTANTS = {
  // 用户状态
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BANNED: 'banned'
  },
  
  // 用户角色
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    VIP: 'vip'
  },
  
  // 登录方式
  LOGIN_METHODS: {
    PASSWORD: 'password',
    WECHAT: 'wechat',
    QQ: 'qq',
    ALIPAY: 'alipay'
  }
};

// 电影相关常量
export const MOVIE_CONSTANTS = {
  // 电影类型
  MOVIE_TYPES: {
    ACTION: 'action',
    COMEDY: 'comedy',
    DRAMA: 'drama',
    HORROR: 'horror',
    ROMANCE: 'romance',
    SCI_FI: 'sci_fi',
    THRILLER: 'thriller',
    ANIMATION: 'animation'
  },
  
  // 清晰度选项
  QUALITY_OPTIONS: [
    { label: '自动', value: 'auto' },
    { label: '1080P', value: '1080p' },
    { label: '720P', value: '720p' },
    { label: '480P', value: '480p' }
  ],
  
  // 播放速度选项
  PLAYBACK_SPEED_OPTIONS: [
    { label: '0.5x', value: '0.5' },
    { label: '0.75x', value: '0.75' },
    { label: '1.0x', value: '1.0' },
    { label: '1.25x', value: '1.25' },
    { label: '1.5x', value: '1.5' },
    { label: '2.0x', value: '2.0' }
  ],
  
  // 时间范围选项
  TIME_RANGE_OPTIONS: [
    { label: '一周内', value: 'week' },
    { label: '更早', value: 'earlier' }
  ]
};

// 消息类型
export const MESSAGE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// 正则表达式
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^1[3-9]\d{9}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
};

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: APP_CONFIG.TOKEN_KEY,
  REFRESH_TOKEN: APP_CONFIG.REFRESH_TOKEN_KEY,
  USER_INFO: APP_CONFIG.USER_INFO_KEY,
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'user_settings'
};

// 事件名称
export const EVENT_NAMES = {
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_UPDATE: 'user:update',
  THEME_CHANGE: 'theme:change',
  LANGUAGE_CHANGE: 'language:change'
};
