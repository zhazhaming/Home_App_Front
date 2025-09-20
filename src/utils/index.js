// 通用工具函数集合

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 相对时间格式化
 * @param {Date|string|number} date - 日期
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diff = now - target;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`;
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`;
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`;
  } else {
    return `${Math.floor(diff / year)}年前`;
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 深拷贝
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 生成唯一ID
 * @param {number} length - ID长度
 * @returns {string} 唯一ID
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
export function isValidPhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {boolean} 是否有效
 */
export function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {object} 验证结果
 */
export function validatePassword(password) {
  const result = {
    isValid: false,
    score: 0,
    message: ''
  };
  
  if (password.length < 8) {
    result.message = '密码长度至少8位';
    return result;
  }
  
  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  result.score = score;
  result.isValid = score >= 3;
  
  if (score < 2) {
    result.message = '密码强度太弱';
  } else if (score < 3) {
    result.message = '密码强度一般';
  } else if (score < 4) {
    result.message = '密码强度较强';
  } else {
    result.message = '密码强度很强';
  }
  
  return result;
}

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @param {string} url - URL字符串，默认使用当前页面URL
 * @returns {string|null} 参数值
 */
export function getUrlParam(name, url = window.location.href) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get(name);
}

/**
 * 设置URL参数
 * @param {string} name - 参数名
 * @param {string} value - 参数值
 * @param {string} url - URL字符串，默认使用当前页面URL
 * @returns {string} 新的URL
 */
export function setUrlParam(name, value, url = window.location.href) {
  const urlObj = new URL(url);
  urlObj.searchParams.set(name, value);
  return urlObj.toString();
}

/**
 * 删除URL参数
 * @param {string} name - 参数名
 * @param {string} url - URL字符串，默认使用当前页面URL
 * @returns {string} 新的URL
 */
export function removeUrlParam(name, url = window.location.href) {
  const urlObj = new URL(url);
  urlObj.searchParams.delete(name);
  return urlObj.toString();
}

/**
 * 存储到localStorage
 * @param {string} key - 键名
 * @param {any} value - 值
 * @param {number} expire - 过期时间（毫秒）
 */
export function setStorage(key, value, expire = null) {
  const data = {
    value,
    expire: expire ? Date.now() + expire : null
  };
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * 从localStorage获取
 * @param {string} key - 键名
 * @returns {any} 值
 */
export function getStorage(key) {
  const data = localStorage.getItem(key);
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    if (parsed.expire && Date.now() > parsed.expire) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return data;
  }
}

/**
 * 从localStorage删除
 * @param {string} key - 键名
 */
export function removeStorage(key) {
  localStorage.removeItem(key);
}

/**
 * 清空localStorage
 */
export function clearStorage() {
  localStorage.clear();
}

/**
 * 数组去重
 * @param {Array} arr - 数组
 * @param {string} key - 去重的键名（对象数组时使用）
 * @returns {Array} 去重后的数组
 */
export function uniqueArray(arr, key = null) {
  if (!key) {
    return [...new Set(arr)];
  }
  
  const seen = new Set();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * 数组分组
 * @param {Array} arr - 数组
 * @param {string|Function} key - 分组的键名或函数
 * @returns {Object} 分组后的对象
 */
export function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

/**
 * 数字格式化
 * @param {number} num - 数字
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的数字
 */
export function formatNumber(num, decimals = 0) {
  if (isNaN(num)) return '0';
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 扩展名
 */
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * 检查是否为图片文件
 * @param {string} filename - 文件名
 * @returns {boolean} 是否为图片
 */
export function isImageFile(filename) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const ext = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

/**
 * 检查是否为视频文件
 * @param {string} filename - 文件名
 * @returns {boolean} 是否为视频
 */
export function isVideoFile(filename) {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  const ext = getFileExtension(filename).toLowerCase();
  return videoExtensions.includes(ext);
}
