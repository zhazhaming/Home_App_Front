import request from './request';
import { API_ENDPOINTS } from '../constants/api';

// 用户相关API
export const userAPI = {
  // 用户登录
  login: (data) => request.post(API_ENDPOINTS.USER.LOGIN, data),
  
  // 用户注册
  register: (data) => request.post(API_ENDPOINTS.USER.REGISTER, data),
  
  // 用户登出
  logout: () => request.post(API_ENDPOINTS.USER.LOGOUT),
  
  // 刷新token
  refreshToken: (data) => request.post(API_ENDPOINTS.USER.REFRESH, data),
  
  // 获取用户信息
  getProfile: () => request.get(API_ENDPOINTS.USER.PROFILE),
  
  // 更新用户信息
  updateProfile: (data) => request.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data),
  
  // 修改密码
  changePassword: (data) => request.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data),
  
  // 上传头像
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return request.post(API_ENDPOINTS.USER.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 获取用户设置
  getSettings: () => request.get(API_ENDPOINTS.USER.SETTINGS),
  
  // 保存用户设置
  saveSettings: (data) => request.post(API_ENDPOINTS.USER.SETTINGS, data),
  
  // 获取观看历史
  getWatchHistory: (params) => request.get(API_ENDPOINTS.USER.WATCH_HISTORY, { params }),
  
  // 删除观看记录
  deleteWatchHistory: (id) => request.delete(`${API_ENDPOINTS.USER.WATCH_HISTORY}/${id}`),
  
  // 获取预约列表
  getReservations: (params) => request.get(API_ENDPOINTS.USER.RESERVATIONS, { params }),
  
  // 取消预约
  cancelReservation: (id) => request.delete(`${API_ENDPOINTS.USER.RESERVATIONS}/${id}`),
  
  // 获取收藏列表
  getCollections: (params) => request.get(API_ENDPOINTS.USER.COLLECTIONS, { params }),
  
  // 取消收藏
  removeCollection: (id) => request.delete(`${API_ENDPOINTS.USER.COLLECTIONS}/${id}`)
};

// 电影相关API
export const movieAPI = {
  // 获取电影列表
  getMovieList: (params) => request.get(API_ENDPOINTS.MOVIE.LIST, { params }),
  
  // 获取电影详情
  getMovieDetail: (id) => request.get(`${API_ENDPOINTS.MOVIE.DETAIL}/${id}`),
  
  // 搜索电影
  searchMovies: (params) => request.get(API_ENDPOINTS.MOVIE.SEARCH, { params }),
  
  // 获取分类电影
  getCategoryMovies: (category, params) => request.get(`${API_ENDPOINTS.MOVIE.CATEGORY}/${category}`, { params }),
  
  // 获取推荐电影
  getRecommendMovies: (params) => request.get(API_ENDPOINTS.MOVIE.RECOMMEND, { params }),
  
  // 获取热门电影
  getPopularMovies: (params) => request.get(API_ENDPOINTS.MOVIE.POPULAR, { params }),
  
  // 获取最新电影
  getRecentMovies: (params) => request.get(API_ENDPOINTS.MOVIE.RECENT, { params }),
  
  // 获取热播电影
  getHotMovies: (params) => request.get(API_ENDPOINTS.MOVIE.HOT, { params }),
  
  // 电影评分
  rateMovie: (movieId, rating) => request.post(API_ENDPOINTS.MOVIE.RATING, { movieId, rating }),
  
  // 电影评论
  commentMovie: (movieId, content) => request.post(API_ENDPOINTS.MOVIE.COMMENT, { movieId, content }),
  
  // 收藏电影
  favoriteMovie: (movieId) => request.post(API_ENDPOINTS.MOVIE.FAVORITE, { movieId }),
  
  // 预约电影
  bookmarkMovie: (movieId) => request.post(API_ENDPOINTS.MOVIE.BOOKMARK, { movieId }),
  
  // 电影预约提醒
  reserveMovie: (data) => request.post(API_ENDPOINTS.MOVIE.RESERVATION, data)
};

// 文件上传API
export const uploadAPI = {
  // 上传图片
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 上传视频
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post(API_ENDPOINTS.UPLOAD.VIDEO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// 系统相关API
export const systemAPI = {
  // 获取系统配置
  getConfig: () => request.get(API_ENDPOINTS.SYSTEM.CONFIG),
  
  // 获取版本信息
  getVersion: () => request.get(API_ENDPOINTS.SYSTEM.VERSION),
  
  // 健康检查
  healthCheck: () => request.get(API_ENDPOINTS.SYSTEM.HEALTH)
};
