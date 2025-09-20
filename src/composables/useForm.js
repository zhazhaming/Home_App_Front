// 表单相关的组合式函数
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { createValidator, COMMON_RULES } from '../utils/validation';

/**
 * 表单管理Hook
 * @param {Object} initialData - 初始表单数据
 * @param {Object} validationRules - 验证规则
 * @param {Object} options - 配置选项
 * @returns {Object} 表单状态和方法
 */
export function useForm(initialData = {}, validationRules = {}, options = {}) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    showValidationMessage = true
  } = options;

  // 表单数据
  const formData = reactive({ ...initialData });
  
  // 表单状态
  const isSubmitting = ref(false);
  const isDirty = ref(false);
  const isValid = ref(true);
  
  // 验证相关
  const validator = createValidator();
  const errors = reactive({});
  const touched = reactive({});
  
  // 初始化验证规则
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const messages = {};
    
    // 为每个规则添加默认消息
    rules.forEach(rule => {
      if (rule.message) {
        messages[rule.type] = rule.message;
      }
    });
    
    validator.addRule(field, rules, messages);
  });

  // 计算属性
  const hasErrors = computed(() => Object.keys(errors).length > 0);
  const isFormValid = computed(() => isValid.value && !hasErrors.value);

  /**
   * 验证单个字段
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   */
  const validateField = (field, value) => {
    const result = validator.validateField(field, value);
    
    if (result.valid) {
      delete errors[field];
    } else {
      errors[field] = result.message;
    }
    
    // 更新表单验证状态
    isValid.value = Object.keys(errors).length === 0;
  };

  /**
   * 验证整个表单
   * @returns {boolean} 是否验证通过
   */
  const validateForm = () => {
    const result = validator.validate(formData);
    
    // 清除所有错误
    Object.keys(errors).forEach(key => delete errors[key]);
    
    if (!result.valid) {
      Object.assign(errors, result.errors);
    }
    
    isValid.value = result.valid;
    return result.valid;
  };

  /**
   * 设置字段值
   * @param {string} field - 字段名
   * @param {any} value - 值
   */
  const setFieldValue = (field, value) => {
    formData[field] = value;
    isDirty.value = true;
    
    if (validateOnChange) {
      validateField(field, value);
    }
  };

  /**
   * 设置字段错误
   * @param {string} field - 字段名
   * @param {string} message - 错误消息
   */
  const setFieldError = (field, message) => {
    errors[field] = message;
    isValid.value = false;
  };

  /**
   * 清除字段错误
   * @param {string} field - 字段名
   */
  const clearFieldError = (field) => {
    delete errors[field];
    isValid.value = Object.keys(errors).length === 0;
  };

  /**
   * 清除所有错误
   */
  const clearErrors = () => {
    Object.keys(errors).forEach(key => delete errors[key]);
    isValid.value = true;
  };

  /**
   * 标记字段为已触摸
   * @param {string} field - 字段名
   */
  const touchField = (field) => {
    touched[field] = true;
    
    if (validateOnBlur) {
      validateField(field, formData[field]);
    }
  };

  /**
   * 重置表单
   */
  const resetForm = () => {
    Object.keys(formData).forEach(key => {
      formData[key] = initialData[key] || '';
    });
    
    clearErrors();
    Object.keys(touched).forEach(key => delete touched[key]);
    isDirty.value = false;
  };

  /**
   * 获取字段值
   * @param {string} field - 字段名
   * @returns {any} 字段值
   */
  const getFieldValue = (field) => {
    return formData[field];
  };

  /**
   * 获取字段错误
   * @param {string} field - 字段名
   * @returns {string} 错误消息
   */
  const getFieldError = (field) => {
    return errors[field] || '';
  };

  /**
   * 检查字段是否被触摸
   * @param {string} field - 字段名
   * @returns {boolean} 是否被触摸
   */
  const isFieldTouched = (field) => {
    return touched[field] || false;
  };

  /**
   * 检查字段是否有错误
   * @param {string} field - 字段名
   * @returns {boolean} 是否有错误
   */
  const hasFieldError = (field) => {
    return !!errors[field];
  };

  // 监听表单数据变化
  watch(formData, () => {
    isDirty.value = true;
  }, { deep: true });

  return {
    // 状态
    formData,
    isSubmitting,
    isDirty,
    isValid,
    errors,
    touched,
    
    // 计算属性
    hasErrors,
    isFormValid,
    
    // 方法
    setFieldValue,
    getFieldValue,
    setFieldError,
    clearFieldError,
    clearErrors,
    getFieldError,
    touchField,
    isFieldTouched,
    hasFieldError,
    validateField,
    validateForm,
    resetForm
  };
}

/**
 * 登录表单Hook
 * @param {Object} options - 配置选项
 * @returns {Object} 表单状态和方法
 */
export function useLoginForm(options = {}) {
  const initialData = {
    username: '',
    password: ''
  };

  const validationRules = {
    username: COMMON_RULES.username,
    password: COMMON_RULES.password
  };

  return useForm(initialData, validationRules, options);
}

/**
 * 注册表单Hook
 * @param {Object} options - 配置选项
 * @returns {Object} 表单状态和方法
 */
export function useRegisterForm(options = {}) {
  const initialData = {
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  };

  const validationRules = {
    username: COMMON_RULES.username,
    password: COMMON_RULES.password,
    confirmPassword: [
      { type: 'required' },
      { 
        type: 'custom', 
        value: (value) => {
          const password = initialData.password;
          return password === value;
        },
        message: '两次输入的密码不一致'
      }
    ],
    email: COMMON_RULES.email
  };

  return useForm(initialData, validationRules, options);
}

/**
 * 用户信息表单Hook
 * @param {Object} initialData - 初始数据
 * @param {Object} options - 配置选项
 * @returns {Object} 表单状态和方法
 */
export function useProfileForm(initialData = {}, options = {}) {
  const defaultData = {
    username: '',
    email: '',
    phone: '',
    avatar: '',
    ...initialData
  };

  const validationRules = {
    username: COMMON_RULES.username,
    email: COMMON_RULES.email,
    phone: COMMON_RULES.phone
  };

  return useForm(defaultData, validationRules, options);
}

/**
 * 密码修改表单Hook
 * @param {Object} options - 配置选项
 * @returns {Object} 表单状态和方法
 */
export function usePasswordForm(options = {}) {
  const initialData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  const validationRules = {
    oldPassword: [
      { type: 'required', message: '请输入原密码' }
    ],
    newPassword: COMMON_RULES.password,
    confirmPassword: [
      { type: 'required' },
      { 
        type: 'custom', 
        value: (value) => {
          const newPassword = initialData.newPassword;
          return newPassword === value;
        },
        message: '两次输入的密码不一致'
      }
    ]
  };

  return useForm(initialData, validationRules, options);
}
