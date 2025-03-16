import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    user_id: '',
    username: '',
    token: '',
    avatar: 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg', // 默认头像
  }),
  
  actions: {
    setUserInfo(userData) {
      this.isLoggedIn = true;
      this.user_id = userData.user_id || '';
      this.username = userData.username || '';
      this.token = userData.token || '';
      this.avatar = userData.avatar || 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg';
    },
    
    logout() {
      this.isLoggedIn = false;
      this.user_id = '';
      this.username = '';
      this.token = '';
      this.avatar = 'http://120.78.1.49/group1/M00/00/00/rBhVEWfVteKAFat3AADG2omeE7U077.jpg';
      localStorage.removeItem('user_token');
    },
    
    checkLoginStatus() {
      const token = localStorage.getItem('user_token');
      if (token) {
        this.isLoggedIn = true;
        this.token = token;
        // 这里可以添加向后端验证token的逻辑
      }
    }
  }
}); 