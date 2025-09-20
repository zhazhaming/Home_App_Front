import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    user_id: '',
    username: '',
    token: '',
    refresh_token: '',
    avatar: 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg', // 默认头像
  }),
  
  actions: {
    setUserInfo(userData) {
      this.isLoggedIn = true;
      this.user_id = userData.user_id || '';
      this.username = userData.username || '';
      this.token = userData.token || '';
      this.refresh_token = userData.refresh_token || '';
      this.avatar = userData.avatar || 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg';
      
      // 保存到localStorage
      localStorage.setItem('user_token', this.token);
      localStorage.setItem('refresh_token', this.refresh_token);
      localStorage.setItem('user_info', JSON.stringify({
        user_id: this.user_id,
        username: this.username,
        token: this.token,
        refresh_token: this.refresh_token,
        avatar: this.avatar
      }));
    },
    
    logout() {
      this.isLoggedIn = false;
      this.user_id = '';
      this.username = '';
      this.token = '';
      this.refresh_token = '';
      this.avatar = 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg';
      
      // 清除localStorage
      localStorage.removeItem('user_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
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
        this.avatar = userInfo.avatar || this.avatar;
      }
    }
  }
});