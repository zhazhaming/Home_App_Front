// API请求相关的组合式函数
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

/**
 * 通用API请求Hook
 * @param {Function} apiFunction - API函数
 * @param {Object} options - 配置选项
 * @returns {Object} 响应式状态和方法
 */
export function useApi(apiFunction, options = {}) {
  const {
    immediate = false,
    initialData = null,
    onSuccess = null,
    onError = null,
    showMessage = true,
    successMessage = '操作成功',
    errorMessage = '操作失败'
  } = options;

  // 响应式状态
  const data = ref(initialData);
  const loading = ref(false);
  const error = ref(null);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0
  });

  /**
   * 执行API请求
   * @param {Object} params - 请求参数
   * @returns {Promise<any>} 请求结果
   */
  const execute = async (params = {}) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiFunction(params);

      if (response.code === 200) {
        data.value = response.data;
        
        // 处理分页信息
        if (response.data && typeof response.data === 'object') {
          if (response.data.items) {
            data.value = response.data.items;
          }
          if (response.data.total !== undefined) {
            pagination.total = response.data.total;
          }
          if (response.data.current !== undefined) {
            pagination.current = response.data.current;
          }
          if (response.data.pageSize !== undefined) {
            pagination.pageSize = response.data.pageSize;
          }
        }

        // 成功回调
        if (onSuccess) {
          onSuccess(response);
        }

        // 显示成功消息
        if (showMessage && successMessage) {
          ElMessage.success(successMessage);
        }

        return response;
      } else {
        throw new Error(response.message || '请求失败');
      }
    } catch (err) {
      error.value = err;
      
      // 错误回调
      if (onError) {
        onError(err);
      }

      // 显示错误消息
      if (showMessage) {
        ElMessage.error(err.message || errorMessage);
      }

      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 重置状态
   */
  const reset = () => {
    data.value = initialData;
    loading.value = false;
    error.value = null;
    pagination.current = 1;
    pagination.pageSize = 10;
    pagination.total = 0;
  };

  /**
   * 刷新数据
   * @param {Object} params - 请求参数
   */
  const refresh = (params = {}) => {
    return execute(params);
  };

  // 立即执行
  if (immediate) {
    execute();
  }

  return {
    data,
    loading,
    error,
    pagination,
    execute,
    reset,
    refresh
  };
}

/**
 * 分页数据请求Hook
 * @param {Function} apiFunction - API函数
 * @param {Object} options - 配置选项
 * @returns {Object} 响应式状态和方法
 */
export function usePagination(apiFunction, options = {}) {
  const {
    immediate = true,
    pageSize = 10,
    onSuccess = null,
    onError = null
  } = options;

  const data = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const pagination = reactive({
    current: 1,
    pageSize,
    total: 0
  });

  /**
   * 获取数据
   * @param {Object} params - 额外参数
   */
  const fetchData = async (params = {}) => {
    try {
      loading.value = true;
      error.value = null;

      const requestParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params
      };

      const response = await apiFunction(requestParams);

      if (response.code === 200) {
        data.value = response.data.items || response.data || [];
        pagination.total = response.data.total || 0;
        pagination.current = response.data.current || pagination.current;

        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        throw new Error(response.message || '获取数据失败');
      }
    } catch (err) {
      error.value = err;
      data.value = [];

      if (onError) {
        onError(err);
      } else {
        ElMessage.error(err.message || '获取数据失败');
      }
    } finally {
      loading.value = false;
    }
  };

  /**
   * 页码变化
   * @param {number} page - 页码
   */
  const handlePageChange = (page) => {
    pagination.current = page;
    fetchData();
  };

  /**
   * 页面大小变化
   * @param {number} size - 页面大小
   */
  const handleSizeChange = (size) => {
    pagination.pageSize = size;
    pagination.current = 1;
    fetchData();
  };

  /**
   * 刷新数据
   * @param {Object} params - 额外参数
   */
  const refresh = (params = {}) => {
    pagination.current = 1;
    fetchData(params);
  };

  // 立即执行
  if (immediate) {
    fetchData();
  }

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    handlePageChange,
    handleSizeChange,
    refresh
  };
}

/**
 * 表单提交Hook
 * @param {Function} submitFunction - 提交函数
 * @param {Object} options - 配置选项
 * @returns {Object} 响应式状态和方法
 */
export function useFormSubmit(submitFunction, options = {}) {
  const {
    onSuccess = null,
    onError = null,
    showMessage = true,
    successMessage = '保存成功',
    errorMessage = '保存失败'
  } = options;

  const loading = ref(false);
  const error = ref(null);

  /**
   * 提交表单
   * @param {Object} formData - 表单数据
   * @returns {Promise<boolean>} 是否提交成功
   */
  const submit = async (formData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await submitFunction(formData);

      if (response.code === 200) {
        if (onSuccess) {
          onSuccess(response);
        }

        if (showMessage && successMessage) {
          ElMessage.success(successMessage);
        }

        return true;
      } else {
        throw new Error(response.message || '提交失败');
      }
    } catch (err) {
      error.value = err;

      if (onError) {
        onError(err);
      }

      if (showMessage) {
        ElMessage.error(err.message || errorMessage);
      }

      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    submit
  };
}

/**
 * 删除操作Hook
 * @param {Function} deleteFunction - 删除函数
 * @param {Object} options - 配置选项
 * @returns {Object} 响应式状态和方法
 */
export function useDelete(deleteFunction, options = {}) {
  const {
    onSuccess = null,
    onError = null,
    showMessage = true,
    successMessage = '删除成功',
    errorMessage = '删除失败',
    confirmMessage = '确定要删除吗？'
  } = options;

  const loading = ref(false);
  const error = ref(null);

  /**
   * 删除项目
   * @param {string|number} id - 项目ID
   * @param {Object} params - 额外参数
   * @returns {Promise<boolean>} 是否删除成功
   */
  const deleteItem = async (id, params = {}) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await deleteFunction(id, params);

      if (response.code === 200) {
        if (onSuccess) {
          onSuccess(response);
        }

        if (showMessage && successMessage) {
          ElMessage.success(successMessage);
        }

        return true;
      } else {
        throw new Error(response.message || '删除失败');
      }
    } catch (err) {
      error.value = err;

      if (onError) {
        onError(err);
      }

      if (showMessage) {
        ElMessage.error(err.message || errorMessage);
      }

      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    deleteItem
  };
}
