// 站内通知 API 服务
import axios from 'axios';
import { ENV_CONFIG } from '../config/env';

const BASE_URL = `${ENV_CONFIG.API_BASE_URL}/message`;

/**
 * 获取通知列表
 * @param {Object} params - 查询参数
 * @param {string} params.userId - 用户ID
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.pageSize - 每页大小（默认20）
 * @param {number|null} params.isRead - 是否已读（0-未读/1-已读/null-全部）
 * @returns {Promise}
 */
export const getNotificationList = (params) => {
  return axios.get(`${BASE_URL}/list`, { params });
};

/**
 * 标记单个通知为已读
 * @param {number} id - 消息ID
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export const markAsRead = (id, userId) => {
  return axios.post(`${BASE_URL}/read/${id}`, null, {
    params: { userId }
  });
};

/**
 * 一键全部已读
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export const markAllAsRead = (userId) => {
  return axios.post(`${BASE_URL}/readAll`, null, {
    params: { userId }
  });
};

/**
 * 获取未读消息数量
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export const getUnreadCount = (userId) => {
  return axios.get(`${BASE_URL}/unreadCount`, {
    params: { userId }
  });
};

