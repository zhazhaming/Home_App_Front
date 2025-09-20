// 表单验证工具函数

import { REGEX_PATTERNS } from '../constants';

/**
 * 验证规则类型
 */
export const VALIDATION_RULES = {
  REQUIRED: 'required',
  EMAIL: 'email',
  PHONE: 'phone',
  USERNAME: 'username',
  PASSWORD: 'password',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern',
  CUSTOM: 'custom'
};

/**
 * 验证器类
 */
export class Validator {
  constructor() {
    this.rules = new Map();
    this.messages = new Map();
  }

  /**
   * 添加验证规则
   * @param {string} field - 字段名
   * @param {Array} rules - 规则数组
   * @param {Object} messages - 错误消息
   */
  addRule(field, rules, messages = {}) {
    this.rules.set(field, rules);
    this.messages.set(field, messages);
  }

  /**
   * 验证单个字段
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   * @returns {Object} 验证结果
   */
  validateField(field, value) {
    const rules = this.rules.get(field) || [];
    const messages = this.messages.get(field) || {};

    for (const rule of rules) {
      const result = this.validateRule(rule, value, messages);
      if (!result.valid) {
        return result;
      }
    }

    return { valid: true };
  }

  /**
   * 验证规则
   * @param {Object} rule - 规则对象
   * @param {any} value - 值
   * @param {Object} messages - 错误消息
   * @returns {Object} 验证结果
   */
  validateRule(rule, value, messages) {
    const { type, value: ruleValue, message } = rule;

    switch (type) {
      case VALIDATION_RULES.REQUIRED:
        if (!value || (typeof value === 'string' && !value.trim())) {
          return {
            valid: false,
            message: message || messages.required || '此字段为必填项'
          };
        }
        break;

      case VALIDATION_RULES.EMAIL:
        if (value && !REGEX_PATTERNS.EMAIL.test(value)) {
          return {
            valid: false,
            message: message || messages.email || '请输入有效的邮箱地址'
          };
        }
        break;

      case VALIDATION_RULES.PHONE:
        if (value && !REGEX_PATTERNS.PHONE.test(value)) {
          return {
            valid: false,
            message: message || messages.phone || '请输入有效的手机号码'
          };
        }
        break;

      case VALIDATION_RULES.USERNAME:
        if (value && !REGEX_PATTERNS.USERNAME.test(value)) {
          return {
            valid: false,
            message: message || messages.username || '用户名只能包含字母、数字和下划线，长度3-20位'
          };
        }
        break;

      case VALIDATION_RULES.PASSWORD:
        if (value) {
          const passwordResult = validatePassword(value);
          if (!passwordResult.isValid) {
            return {
              valid: false,
              message: message || messages.password || passwordResult.message
            };
          }
        }
        break;

      case VALIDATION_RULES.MIN_LENGTH:
        if (value && value.length < ruleValue) {
          return {
            valid: false,
            message: message || messages.minLength || `最少需要${ruleValue}个字符`
          };
        }
        break;

      case VALIDATION_RULES.MAX_LENGTH:
        if (value && value.length > ruleValue) {
          return {
            valid: false,
            message: message || messages.maxLength || `最多允许${ruleValue}个字符`
          };
        }
        break;

      case VALIDATION_RULES.PATTERN:
        if (value && !ruleValue.test(value)) {
          return {
            valid: false,
            message: message || messages.pattern || '格式不正确'
          };
        }
        break;

      case VALIDATION_RULES.CUSTOM:
        if (ruleValue && typeof ruleValue === 'function') {
          const result = ruleValue(value);
          if (result !== true) {
            return {
              valid: false,
              message: message || messages.custom || result || '验证失败'
            };
          }
        }
        break;
    }

    return { valid: true };
  }

  /**
   * 验证整个表单
   * @param {Object} data - 表单数据
   * @returns {Object} 验证结果
   */
  validate(data) {
    const errors = {};
    let isValid = true;

    for (const [field, rules] of this.rules) {
      const value = data[field];
      const result = this.validateField(field, value);
      
      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    return {
      valid: isValid,
      errors
    };
  }
}

/**
 * 创建验证器实例
 * @returns {Validator} 验证器实例
 */
export function createValidator() {
  return new Validator();
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} 验证结果
 */
export function validatePassword(password) {
  const result = {
    isValid: false,
    score: 0,
    message: ''
  };

  if (!password) {
    result.message = '密码不能为空';
    return result;
  }

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
 * 验证确认密码
 * @param {string} password - 原密码
 * @param {string} confirmPassword - 确认密码
 * @returns {Object} 验证结果
 */
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return {
      valid: false,
      message: '请确认密码'
    };
  }

  if (password !== confirmPassword) {
    return {
      valid: false,
      message: '两次输入的密码不一致'
    };
  }

  return { valid: true };
}

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @param {Array} allowedTypes - 允许的文件类型
 * @returns {Object} 验证结果
 */
export function validateFileType(file, allowedTypes) {
  if (!file) {
    return {
      valid: false,
      message: '请选择文件'
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `只支持 ${allowedTypes.join(', ')} 格式的文件`
    };
  }

  return { valid: true };
}

/**
 * 验证文件大小
 * @param {File} file - 文件对象
 * @param {number} maxSize - 最大文件大小（字节）
 * @returns {Object} 验证结果
 */
export function validateFileSize(file, maxSize) {
  if (!file) {
    return {
      valid: false,
      message: '请选择文件'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      message: `文件大小不能超过 ${formatFileSize(maxSize)}`
    };
  }

  return { valid: true };
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的文件大小
 */
function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 常用验证规则预设
 */
export const COMMON_RULES = {
  // 用户名规则
  username: [
    { type: VALIDATION_RULES.REQUIRED },
    { type: VALIDATION_RULES.USERNAME }
  ],

  // 邮箱规则
  email: [
    { type: VALIDATION_RULES.REQUIRED },
    { type: VALIDATION_RULES.EMAIL }
  ],

  // 手机号规则
  phone: [
    { type: VALIDATION_RULES.REQUIRED },
    { type: VALIDATION_RULES.PHONE }
  ],

  // 密码规则
  password: [
    { type: VALIDATION_RULES.REQUIRED },
    { type: VALIDATION_RULES.PASSWORD }
  ],

  // 确认密码规则
  confirmPassword: (password) => [
    { type: VALIDATION_RULES.REQUIRED },
    { 
      type: VALIDATION_RULES.CUSTOM, 
      value: (confirmPassword) => validateConfirmPassword(password, confirmPassword).valid,
      message: '两次输入的密码不一致'
    }
  ]
};
