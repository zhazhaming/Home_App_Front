// 认证相关的组合式函数
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { userAPI } from '../services/api';
import { ElMessage } from 'element-plus';
import { APP_CONFIG } from '../constants';

export function useAuth() {
  const router = useRouter();
  const userStore = useUserStore();
  
  // 登录状态
  const isLoggingIn = ref(false);
  const isRegistering = ref(false);
  
  // 计算属性
  const isLoggedIn = computed(() => userStore.isLoggedIn);
  const currentUser = computed(() => ({
    id: userStore.user_id,
    username: userStore.username,
    avatar: userStore.avatar
  }));
  
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭据
   * @returns {Promise<boolean>} 是否登录成功
   */
  const login = async (credentials) => {
    try {
      isLoggingIn.value = true;
      
      const response = await userAPI.login({
        nameoremail: credentials.username,
        password: credentials.password
      });
      
      if (response.code === APP_CONFIG.HTTP_STATUS.SUCCESS) {
        // 保存用户信息
        userStore.setUserInfo({
          user_id: response.data.id,
          username: credentials.username,
          email: response.data.email || '',
          token: response.data.token,
          refresh_token: response.data.refresh_token,
          avatar: response.data.avatar || APP_CONFIG.DEFAULT_AVATAR
        });
        
        // 登录成功后立即获取完整的用户信息（包括最新头像）
        await userStore.fetchUserInfo();
        
        ElMessage.success('登录成功');
        
        // 跳转到首页或指定页面
        const redirectPath = router.currentRoute.value.query.redirect || APP_CONFIG.HOME_PATH;
        router.push(redirectPath);
        
        return true;
      } else {
        ElMessage.error(response.message || '登录失败');
        return false;
      }
    } catch (error) {
      console.error('登录失败:', error);
      ElMessage.error('登录失败，请稍后重试');
      return false;
    } finally {
      isLoggingIn.value = false;
    }
  };
  
  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @returns {Promise<boolean>} 是否注册成功
   */
  const register = async (userData) => {
    try {
      isRegistering.value = true;
      
      const response = await userAPI.register(userData);
      
      if (response.code === APP_CONFIG.HTTP_STATUS.SUCCESS) {
        ElMessage.success('注册成功，请登录');
        router.push(APP_CONFIG.LOGIN_PATH);
        return true;
      } else {
        ElMessage.error(response.message || '注册失败');
        return false;
      }
    } catch (error) {
      console.error('注册失败:', error);
      ElMessage.error('注册失败，请稍后重试');
      return false;
    } finally {
      isRegistering.value = false;
    }
  };
  
  /**
   * 用户登出
   */
  const logout = async () => {
    try {
      // 调用登出API
      await userAPI.logout();
    } catch (error) {
      console.error('登出API调用失败:', error);
    } finally {
      // 清除本地状态
      userStore.logout();
      ElMessage.success('已退出登录');
      router.push(APP_CONFIG.LOGIN_PATH);
    }
  };
  
  /**
   * 更新用户信息
   * @param {Object} userData - 用户数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  const updateProfile = async (userData) => {
    try {
      const response = await userAPI.updateProfile(userData);
      
      if (response.code === APP_CONFIG.HTTP_STATUS.SUCCESS) {
        // 更新本地状态
        userStore.setUserInfo({
          ...userStore,
          ...userData
        });
        
        ElMessage.success('个人信息更新成功');
        return true;
      } else {
        ElMessage.error(response.message || '更新失败');
        return false;
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      ElMessage.error('更新失败，请稍后重试');
      return false;
    }
  };
  
  /**
   * 修改密码
   * @param {Object} passwordData - 密码数据
   * @returns {Promise<boolean>} 是否修改成功
   */
  const changePassword = async (passwordData) => {
    try {
      const response = await userAPI.changePassword(passwordData);
      
      if (response.code === APP_CONFIG.HTTP_STATUS.SUCCESS) {
        ElMessage.success('密码修改成功');
        return true;
      } else {
        ElMessage.error(response.message || '密码修改失败');
        return false;
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      ElMessage.error('密码修改失败，请稍后重试');
      return false;
    }
  };
  
  /**
   * 上传头像
   * @param {File} file - 头像文件
   * @returns {Promise<boolean>} 是否上传成功
   */
  const uploadAvatar = async (file) => {
    try {
      const response = await userAPI.uploadAvatar(file);
      
      if (response.code === APP_CONFIG.HTTP_STATUS.SUCCESS) {
        // 更新用户头像
        userStore.setUserInfo({
          ...userStore,
          avatar: response.data.avatar
        });
        
        ElMessage.success('头像上传成功');
        return true;
      } else {
        ElMessage.error(response.message || '头像上传失败');
        return false;
      }
    } catch (error) {
      console.error('上传头像失败:', error);
      ElMessage.error('头像上传失败，请稍后重试');
      return false;
    }
  };
  
  /**
   * 检查登录状态
   */
  const checkLoginStatus = () => {
    userStore.checkLoginStatus();
  };
  
  return {
    // 状态
    isLoggingIn,
    isRegistering,
    isLoggedIn,
    currentUser,
    
    // 方法
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    uploadAvatar,
    checkLoginStatus
  };
}
