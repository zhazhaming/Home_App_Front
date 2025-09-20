import { defineStore } from 'pinia';
import request from '../services/request';

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    user_id: '',
    username: '',
    email: '',
    token: '',
    refresh_token: '',
    avatar: 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg', // 默认头像
  }),
  
  actions: {
    setUserInfo(userData) {
      this.isLoggedIn = true;
      this.user_id = userData.user_id || '';
      this.username = userData.username || '';
      this.email = userData.email || '';
      this.token = userData.token || '';
      this.refresh_token = userData.refresh_token || '';
      // 修复头像逻辑：如果传入了头像，使用传入的头像；否则保持当前头像不变，只有在完全没有头像时才使用默认头像
      if (userData.avatar) {
        this.avatar = userData.avatar;
      } else if (!this.avatar || this.avatar === 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg') {
        this.avatar = 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg';
      }
      
      // 保存到localStorage
      localStorage.setItem('user_token', this.token);
      localStorage.setItem('refresh_token', this.refresh_token);
      localStorage.setItem('user_info', JSON.stringify({
        user_id: this.user_id,
        username: this.username,
        email: this.email,
        token: this.token,
        refresh_token: this.refresh_token,
        avatar: this.avatar
      }));
    },
    
    logout() {
      this.isLoggedIn = false;
      this.user_id = '';
      this.username = '';
      this.email = '';
      this.token = '';
      this.refresh_token = '';
      this.avatar = 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg';
      
      // 清除localStorage
      localStorage.removeItem('user_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    },
    
    // 完整的退出登录流程，包括调用后端接口
    async logoutWithServer() {
      try {
        // 调用后端接口删除token
        if (this.user_id) {
          try {
            console.log('开始调用后端logout接口，用户ID:', this.user_id);
            const response = await request({
              url: '/user/logout',
              method: 'post',
              params: { id: this.user_id }
            });
            console.log('后端logout接口响应:', response);
            console.log('后端token删除成功');
          } catch (error) {
            console.error('调用后端logout接口失败:', error);
            console.error('错误详情:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
            });
            // 即使后端调用失败，也继续执行本地退出逻辑
          }
        } else {
          console.log('用户ID为空，跳过后端接口调用');
        }
        
        // 执行本地退出逻辑
        this.logout();
        return true;
      } catch (error) {
        console.error('退出登录失败:', error);
        return false;
      }
    },
    
    checkLoginStatus() {
      const token = localStorage.getItem('user_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      
      if (token && userInfo.user_id) {
        this.isLoggedIn = true;
        this.token = token;
        this.refresh_token = refreshToken || '';
        this.user_id = userInfo.user_id || '';
        this.username = userInfo.username || '';
        this.email = userInfo.email || '';
        // 修复头像逻辑：只有当localStorage中没有avatar时才使用默认头像
        this.avatar = userInfo.avatar || 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg';
        
        // 检查登录状态后，获取最新的用户信息（包括头像）
        this.fetchUserInfo();
      }
    },
    
    // 从后端获取最新的用户信息
    async fetchUserInfo() {
      try {
        if (!this.user_id || !this.token) {
          console.log('用户未登录，跳过获取用户信息');
          return;
        }
        
        console.log('🔄 从后端获取最新用户信息...');
        const response = await request({
          url: '/user/info',
          method: 'post',
          params: { id: parseInt(this.user_id) }
        });
        
        if (response.code === 200) {
          const userData = response.data;
          console.log('✅ 获取用户信息成功:', userData);
          
          // 更新用户信息，特别是头像
          this.setUserInfo({
            user_id: this.user_id,
            username: userData.username || this.username,
            email: userData.email || this.email,
            token: this.token,
            refresh_token: this.refresh_token,
            avatar: userData.avatar || this.avatar
          });
          
          console.log('🖼️ 头像已更新为:', this.avatar);
        } else {
          console.error('❌ 获取用户信息失败:', response);
        }
      } catch (error) {
        console.error('❌ 获取用户信息出错:', error);
        // 不显示错误消息，静默失败
      }
    }
  }
});