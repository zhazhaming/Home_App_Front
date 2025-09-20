// API接口常量配置
export const API_ENDPOINTS = {
  // 用户相关
  USER: {
    LOGIN: '/user/login',
    REGISTER: '/user/register',
    LOGOUT: '/user/logout',
    REFRESH: '/user/refresh',
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    UPLOAD_AVATAR: '/user/upload-avatar',
    SETTINGS: '/user/settings',
    WATCH_HISTORY: '/user/watch-history',
    RESERVATIONS: '/user/reservations',
    COLLECTIONS: '/user/collections'
  },
  
  // 电影相关
  MOVIE: {
    LIST: '/movie/list',
    DETAIL: '/movie/detail',
    SEARCH: '/movie/search',
    CATEGORY: '/movie/category',
    RECOMMEND: '/movie/recommend',
    RATING: '/movie/rating',
    COMMENT: '/movie/comment',
    FAVORITE: '/movie/favorite',
    BOOKMARK: '/movie/bookmark'
  },
  
  // 文件上传
  UPLOAD: {
    IMAGE: '/upload/image',
    VIDEO: '/upload/video',
    AVATAR: '/upload/avatar'
  },
  
  // 系统相关
  SYSTEM: {
    CONFIG: '/system/config',
    VERSION: '/system/version',
    HEALTH: '/system/health'
  }
};

// API响应状态码
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// 错误消息映射
export const ERROR_MESSAGES = {
  [API_STATUS.BAD_REQUEST]: '请求参数错误',
  [API_STATUS.UNAUTHORIZED]: '未授权，请先登录',
  [API_STATUS.FORBIDDEN]: '权限不足',
  [API_STATUS.NOT_FOUND]: '请求的资源不存在',
  [API_STATUS.CONFLICT]: '数据冲突',
  [API_STATUS.VALIDATION_ERROR]: '数据验证失败',
  [API_STATUS.SERVER_ERROR]: '服务器内部错误',
  [API_STATUS.SERVICE_UNAVAILABLE]: '服务暂时不可用',
  NETWORK_ERROR: '网络连接失败',
  TIMEOUT_ERROR: '请求超时',
  UNKNOWN_ERROR: '未知错误'
};

// 请求方法
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
};

// 请求头
export const HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent'
};

// 内容类型
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded'
};
